from asyncio import TimeoutError
from datetime import datetime, time
from os import getenv, getcwd
from random import choice, randint
from re import match

import discord
from alive_progress import alive_bar, config_handler
from discord.ext import tasks, commands
from spotipy import SpotifyException

import src.discord_responses as responses
from src.historical_tracking import playlist_snapshot_coordinator, featured_artist
from src.spotify_commands import force_refresh_cache, expired_track_removal, playlist_description_update, \
    convert_to_track_id, validate_song, add_to_playlist, song_add_to_db, song_search
from src.spotify_selects import selects_playlists_coordinator
from src.vb_utils import access_secret_version, get_logger
from src.webhook_updates import post_webhook

logger = get_logger('main')
base_dir = getcwd()
environment = getenv("ENVIRONMENT")
if environment == "dev":
    DISCORD_TOKEN = getenv("DISCORD_TOKEN")

    if DISCORD_TOKEN is None:
        logger.error("No Discord token found. Please set the DISCORD_TOKEN environment variable.")
        exit(1)

    logger.info("Running program in dev mode")
elif environment == "prod":
    project_id = getenv("GOOGLE_CLOUD_PROJECT_ID")
    if project_id is None:
        logger.error("No Google Cloud project ID found. Please set the GOOGLE_CLOUD_PROJECT_ID environment "
                     "variable.")
        exit(1)
    DISCORD_TOKEN = access_secret_version(secret_id="vb-discord-token",
                                          project_id=project_id)
    logger.info("Running program in production mode")
else:
    logger.error("No environment variable set. Please set the ENVIRONMENT environment variable.")
    exit(1)

bot = commands.Bot(command_prefix=commands.when_mentioned,
                   case_insensitive=True,
                   help_command=None,
                   intents=discord.Intents.all())
bot.remove_command('help')
emoji_responses = responses.AFFIRMATIVES


@bot.event
async def on_ready():
    config_handler.set_global(spinner='classic', bar='solid')
    guild_count = 0
    with alive_bar(total=len(bot.guilds), title='Retrieving servers...') as bar:
        for guild in bot.guilds:
            logger.debug(f"{guild.id} (name: {guild.name})")
            print(f"{guild.id} (name: {guild.name})")
            guild_count = guild_count + 1
            bar()
    logger.info(f"VaultBot is in {guild_count} guilds.")
    logger.info(f"VaultBot is fully loaded and online.")
    await bot.change_presence(activity=discord.Game(f'@me + help'))

    # TODO: Here, run migrations

    if environment == "prod":
        hourly_cleanup.start()
        generate_aggregate_playlists.start()


@tasks.loop(minutes=60)
async def hourly_cleanup():
    await bot.wait_until_ready()
    logger.info(f"Beginning hourly cleanup...")
    with alive_bar(total=5, title='Hourly cleanup...') as bar:
        logger.debug("Performing expired track removal (if necessary)...")
        force_refresh_cache()
        expired_track_removal()
        bar()
        playlist_description_update(playlist_id="5YQHb5wt9d0hmShWNxjsTs",
                                    initial_desc='The playlist with guaranteed freshness. '
                                                 'See more at vaultbot.tbrittain.com! ')
        bar()
        logger.debug('Checking whether to log current playlist data...')
        playlist_snapshot_coordinator()
        bar()
        logger.debug('Checking whether to post webhook updates...')
        time_now = datetime.utcnow().time()
        begin = time(23, 0)
        end = time(23, 59, 59)
        if begin <= time_now <= end:
            logger.debug('Pushing update to webhook...')
            post_webhook()
        bar()
        logger.debug('Checking whether to select a new featured artist')
        featured_artist()
        bar()
        logger.info('Playlist stats logging complete!')
    logger.info('Hourly playlist cleanup complete!')


@tasks.loop(hours=12)
async def generate_aggregate_playlists():
    await bot.wait_until_ready()
    logger.info("Beginning generation of aggregate playlists")
    selects_playlists_coordinator()
    logger.info("Aggregate playlist generation complete!")


@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        await ctx.send(f'Unrecognized command, {ctx.author.mention}!')
        await ctx.send(f'Try $help for a full list of my fantastic, very useful features!')


@bot.event
async def on_message(ctx):
    if ctx.author == bot.user or ctx.author == ctx.author.bot:
        return  # ignore messages from self and other bots
    if isinstance(ctx.channel, discord.channel.DMChannel):
        spotify_url_regex = r"(https?:\/\/(.+?\.)?spotify\.com(\/[A-Za-z0-9\-\._~:\/\?#\[\]@!$&'\(\)\*\+,;\=]*)?)"
        if match(pattern=spotify_url_regex, string=ctx.content):
            converted_song_id = None
            try:
                converted_song_id = await convert_to_track_id(ctx.content)
            except SpotifyException:
                await ctx.channel.send(f"Please send me a valid Spotify link and I "
                                       f"will try to add it to the playlists, {ctx.author.mention}!")
            if converted_song_id is not None:
                try:
                    await validate_song(track_id=converted_song_id)
                    await add_to_playlist(song_id=converted_song_id)
                    song_add_to_db(song_id=converted_song_id, user=str(ctx.author))
                    logger.debug(f'Song of ID {converted_song_id} added to playlists '
                                 f'by {ctx.author} via private message')
                    await ctx.channel.send(
                        f'Track has been added to the community playlists! {choice(emoji_responses)}')
                except OverflowError:
                    await ctx.channel.send(f"Cannot add songs longer than 10 minutes "
                                           f"to playlist, {ctx.author.mention}!")
                except FileExistsError:
                    await ctx.channel.send(f"Track already exists in dynamic playlist, "
                                           f"{ctx.author.mention}! I'm not gonna re-add it!")
    await bot.process_commands(ctx)


@bot.command()
@commands.guild_only()
async def search(ctx, *, song_query):
    logger.debug(f'User {ctx.author} invoked $search with query {song_query}')

    try:
        track_results, track_ids = await song_search(song_query)
    except SyntaxError:
        await ctx.send(f'No tracks found! Are you sure you '
                       f'spelled everything right, {ctx.author.mention}?')

    else:
        msg = await ctx.channel.send(track_results)

        for index, emoji in enumerate(responses.NUMBERS):
            if index == len(track_ids):
                break
            else:
                await msg.add_reaction(emoji=emoji)
        await msg.add_reaction(emoji=responses.CANCEL)
        await ctx.channel.send(
            f'Select the emoji of the track you want to add, {ctx.author.mention}')

        def check(check_reaction, user_reaction):
            return True if user_reaction == ctx.author and (
                    any(str(check_reaction.emoji) in s for s in responses.NUMBERS)
                    or str(check_reaction.emoji == responses.CANCEL)) else False

        try:
            reaction, user = await bot.wait_for('reaction_add', timeout=30.0, check=check)
        except TimeoutError:
            await ctx.channel.send(f'Never mind, {ctx.author.mention}. '
                                   f'You took too long. Please try again.')
            return
        if reaction and msg.id == reaction.message.id:
            try:
                track_selection = responses.NUMBERS_TO_INDEX_MAP[reaction.emoji]

                if track_selection is not None:
                    selected_track_id = track_ids[track_selection][track_selection + 1]

                    await validate_song(track_id=selected_track_id)
                    await add_to_playlist(song_id=selected_track_id)

                    song_add_to_db(song_id=selected_track_id, user=str(ctx.author))
                    await ctx.channel.send(f'Track has been added to the community playlists!'
                                           f'{choice(emoji_responses)}')
                    logger.debug(f'Song of ID {selected_track_id} added to playlists by {ctx.author}')
                else:
                    await ctx.channel.send(f'OK, {ctx.author.mention}. I cancelled the track search.')
            except FileExistsError:
                await ctx.channel.send(f"Track already exists in dynamic playlist, "
                                       f"{ctx.author.mention}! I'm not gonna re-add it!")
            except OverflowError:
                await ctx.channel.send(f"Cannot add songs longer than 10 minutes "
                                       f"to playlist, {ctx.author.mention}!")


@search.error
async def search_error(ctx, error):
    if isinstance(error, commands.MissingRequiredArgument):
        if error.param.name == 'song_query':
            await ctx.send(f'Please search for a song with your words, {ctx.author.mention}')


@bot.command()
@commands.guild_only()
async def add(ctx, song_url_or_id: str):
    logger.debug(f'User {ctx.author} invoked $add with input {song_url_or_id}')
    try:
        converted_song_id = await convert_to_track_id(song_url_or_id)
        await validate_song(track_id=converted_song_id)
        await add_to_playlist(song_id=converted_song_id)
        song_add_to_db(song_id=converted_song_id, user=str(ctx.author))
        await ctx.channel.send(f'Track has been added to the community playlists! {choice(emoji_responses)}')
        logger.debug(f'Song of ID {converted_song_id} added to playlists by {ctx.author}')

    except IndexError:
        await ctx.send(f'Please enter a Spotify track ID, {ctx.author.mention}')
    except SpotifyException:
        await ctx.send(f'Please enter a valid argument, {ctx.author.mention}')
        await ctx.send(f'Valid arguments for $add are the raw Spotify song link, song URI, '
                       f'or song ID')
    except FileExistsError:
        await ctx.send(f"Track already exists in dynamic playlist, "
                       f"{ctx.author.mention}! I'm not gonna re-add it!")
    except ValueError:
        await ctx.send(f"Cannot add podcast episode to playlist, "
                       f"{ctx.author.mention}!")
    except OverflowError:
        await ctx.send(f"Cannot add songs longer than 10 minutes "
                       f"to playlist, {ctx.author.mention}!")


@add.error
async def add_error(ctx, error):
    if isinstance(error, commands.MissingRequiredArgument):
        if error.param.name == 'song_url_or_id':
            await ctx.send(f'Please enter a valid song to add, {ctx.author.mention}')
            await ctx.send(f'Valid arguments for $add are the raw Spotify song link, song URI, '
                           f'or song ID')


@bot.command(aliases=['playlist', 'links'])
async def playlists(ctx):
    logger.debug(f'User {ctx.author} invoked $playlists')
    playlist_embed = discord.Embed(title=f'Playlists',
                                   description='Links to the playlists and more. Be sure to '
                                               'follow the playlists for easy access :grinning:',
                                   color=randint(0, 0xffffff))
    playlist_embed.add_field(name='Links to VaultBot things', value='https://linktr.ee/tbrittain', inline=False)
    await ctx.send(embed=playlist_embed)


@bot.command(aliases=['suggest', 'idea'])
async def suggestion(ctx, *, suggested_idea):
    logger.debug(f'User {ctx.author} suggested {suggested_idea}')
    print(ctx)
    benevolent_dictator = bot.get_user(177260855308713985)
    await discord.User.send(benevolent_dictator,
                            content=f'User {ctx.author} submitted suggestion: {suggested_idea}')
    await ctx.send(f'Thanks, your suggestion has been relayed to my '
                   f'master, {ctx.author.mention}')


@suggestion.error
async def suggestion_error(ctx, error):
    if isinstance(error, commands.MissingRequiredArgument):
        if error.param.name == 'suggested_idea':
            await ctx.send(f'Please enter a suggestion, {ctx.author.mention}')


@bot.command()
async def help(ctx, section=''):
    logger.debug(f'User {ctx.author} invoked $help')
    if section.lower().__contains__('search'):
        help_embed = discord.Embed(title='$help search', color=randint(0, 0xffffff))
        help_embed.add_field(name="Function information",
                             value='Finds a song to add to the playlist with duration no '
                                   'greater than 10 minutes. Returns the top 10 results. Select emoji on '
                                   'bot message to confirm track.')
        help_embed.add_field(name="Example",
                             value='$search bohemian rhapsody')
        await ctx.send(embed=help_embed)

    elif section.lower().__contains__('add'):
        help_embed = discord.Embed(title='$help add', color=randint(0, 0xffffff))
        help_embed.add_field(name="Function information",
                             value='Directly adds a song to the playlist without needing to go through '
                                   '$search. Accepts Spotify song URL/URI/ID.', inline=False)
        help_embed.add_field(name="URL",
                             value='$add https://open.spotify.com/track/7tFiyTwD0nx5a1eklYtX2J?si'
                                   '=pXHaPjlgSt6mFwjFWdFf9Q', inline=False)
        help_embed.add_field(name="URI",
                             value='$add spotify:track:7tFiyTwD0nx5a1eklYtX2J', inline=False)
        help_embed.add_field(name="ID",
                             value='$add 7tFiyTwD0nx5a1eklYtX2J', inline=False)
        await ctx.send(embed=help_embed)

    else:
        help_embed = discord.Embed(title='$help',
                                   description='Get specific function help with $help FUNCTION (ex. $help '
                                               'add)',
                                   color=randint(0, 0xffffff))
        help_embed.add_field(name='$search', value='Searches Spotify based on song name '
                                                   'and lists the top results', inline=False)
        help_embed.add_field(name='$add', value='Input a Spotify song link/URI/ID to '
                                                'add it directly to the playlist', inline=False)
        help_embed.add_field(name='$suggestion', value='Send a suggestion to threesquared', inline=False)

        await ctx.send(embed=help_embed)


if __name__ == "__main__":
    bot.run(DISCORD_TOKEN)
