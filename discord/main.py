import discord
from discord.ext import tasks, commands
import os
from dotenv import load_dotenv
import asyncio
from spotipy import SpotifyException
import random
from src import spotify_commands
from src import config
from src import historical_tracking
from src import vb_utils
from src import spotify_selects
from src import discord_responses
from alive_progress import alive_bar, config_handler
from google.cloud import secretmanager
import sys
import re

# TODO: implement discord slash commands
# https://pypi.org/project/discord-py-slash-command/

# TODO: implement a webhook to send daily statistics to myself
# https://www.codespeedy.com/create-a-discord-webhook-in-python-for-a-bot/


def access_secret_version(secret_id, project_id, version_id="1"):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
    response = client.access_secret_version(name=name)
    return response.payload.data.decode('UTF-8')


logger = vb_utils.logger

base_dir = os.getcwd()
if config.environment == "dev":
    load_dotenv(f'{base_dir}/dev.env')
    DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
    logger.info("Running program in dev mode")
elif config.environment == "prod":
    project_id = os.getenv("PROJECT_ID")
    DISCORD_TOKEN = access_secret_version(secret_id="vb-discord-token",
                                          project_id=project_id)
    logger.info("Running program in production mode")
    if None in [project_id]:
        logger.error("Invalid environment variable, exiting")
        sys.exit(1)
elif config.environment == "prod_local":
    load_dotenv(f'{base_dir}/prod_local.env')
    project_id = os.getenv("PROJECT_ID")
    DISCORD_TOKEN = access_secret_version(secret_id="vb-discord-token",
                                          project_id=project_id)
    logger.info("Running program in local production mode")
else:
    logger.error("Invalid environment setting, exiting")
    sys.exit(1)

intents = discord.Intents.default()
intents.members = True
bot = commands.Bot(command_prefix=commands.when_mentioned,
                   case_insensitive=True,
                   help_command=None,
                   intents=intents)
bot.remove_command('help')
emoji_responses = discord_responses.emoji_responses


@bot.event
async def on_ready():
    config_handler.set_global(spinner='classic', bar='solid')
    guild_count = 0
    with alive_bar(total=len(bot.guilds), title='Retrieving servers...') as bar:
        for guild in bot.guilds:
            logger.debug(f"{guild.id} (name: {guild.name})")
            guild_count = guild_count + 1
            bar()
    logger.info(f"VaultBot is in {guild_count} guilds.")
    logger.info(f"VaultBot is fully loaded and online.")
    await bot.change_presence(activity=discord.Game(f'@me + help'))

    if config.environment == "prod_local" or config.environment == "prod":
        hourly_cleanup.start()
        generate_aggregate_playlists.start()


@tasks.loop(minutes=60)
async def hourly_cleanup():
    await bot.wait_until_ready()
    logger.info(f"Beginning hourly cleanup")
    with alive_bar(total=3, title='Hourly cleanup...') as bar:
        logger.debug("Performing expired track removal (if necessary)...")
        await spotify_commands.expired_track_removal()
        bar()
        spotify_commands.playlist_description_update(playlist_id="5YQHb5wt9d0hmShWNxjsTs",
                                                     initial_desc='The playlist with guaranteed freshness. ')
        bar()
        logger.debug('Checking whether to log current playlist data...')
        historical_tracking.playlist_snapshot_coordinator()
        bar()
        logger.info('Playlist stats logging complete')
    logger.info('Hourly playlist cleanup complete!')


@tasks.loop(hours=6)
async def generate_aggregate_playlists():
    await bot.wait_until_ready()
    logger.info("Beginning generation of aggregate playlists")
    spotify_selects.selects_playlists_coordinator()
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
        if re.match(pattern=spotify_url_regex, string=ctx.content):
            converted_song_id = None
            try:
                converted_song_id = await spotify_commands.convert_to_track_id(ctx.content)
            except SpotifyException:
                await ctx.channel.send(f"Please send me a valid Spotify link and I "
                                       f"will try to add it to the playlists, {ctx.author.mention}!")
            if converted_song_id is not None:
                try:
                    await spotify_commands.validate_song(track_id=converted_song_id)
                    await spotify_commands.add_to_playlist(song_id=converted_song_id)
                    spotify_commands.song_add_to_db(song_id=converted_song_id, user=str(ctx.author))
                    logger.debug(f'Song of ID {converted_song_id} added to playlists '
                                 f'by {ctx.author} via private message')
                    await ctx.channel.send(
                        f'Track has been added to the community playlists! {random.choice(emoji_responses)}')
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

    raw_results = await asyncio.gather(spotify_commands.song_search(song_query))
    search_results = raw_results[0]

    if search_results[0] == 'N':
        await ctx.send(f'No tracks found! Are you sure you '
                       f'spelled everything right, {ctx.author.mention}?')

    else:
        msg = await ctx.channel.send(search_results[0])
        track_ids = search_results[1]

        emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣',
                  '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
        cancel_emoji = '❌'
        for index, emoji in enumerate(emojis):
            if index == len(track_ids):
                break
            else:
                await msg.add_reaction(emoji=emoji)
        await msg.add_reaction(emoji=cancel_emoji)
        await ctx.channel.send(
            f'Select the emoji of the track you want to add, {ctx.author.mention}')

        def check(reaction, user):
            return True if user == ctx.author and (any(str(reaction.emoji) in s for s in emojis) or
                                                   str(reaction.emoji == cancel_emoji)) else False

        try:
            reaction, user = await bot.wait_for('reaction_add', timeout=30.0, check=check)
        except asyncio.TimeoutError:
            await ctx.channel.send(f'Never mind, {ctx.author.mention}. '
                                   f'You took too long. Please try again.')
        # FIXME this fix prevents duplicate songs from being added but prevents the
        # original message from being processed
        if reaction and msg.id == reaction.message.id:
            try:
                if reaction.emoji == '1️⃣':
                    track_selection = 0
                elif reaction.emoji == '2️⃣':
                    track_selection = 1
                elif reaction.emoji == '3️⃣':
                    track_selection = 2
                elif reaction.emoji == '4️⃣':
                    track_selection = 3
                elif reaction.emoji == '5️⃣':
                    track_selection = 4
                elif reaction.emoji == '6️⃣':
                    track_selection = 5
                elif reaction.emoji == '7️⃣':
                    track_selection = 6
                elif reaction.emoji == '8️⃣':
                    track_selection = 7
                elif reaction.emoji == '9️⃣':
                    track_selection = 8
                elif reaction.emoji == '🔟':
                    track_selection = 9
                elif reaction.emoji == '❌':
                    track_selection = None
                if track_selection is not None:
                    selected_track_id = track_ids[track_selection][track_selection + 1]

                    await spotify_commands.validate_song(track_id=selected_track_id)
                    await spotify_commands.add_to_playlist(song_id=selected_track_id)

                    spotify_commands.song_add_to_db(song_id=selected_track_id, user=str(ctx.author))
                    await ctx.channel.send(f'Track has been added to the community playlists!'
                                           f'{random.choice(emoji_responses)}')
                    logger.debug(f'Song of ID {selected_track_id} added to playlists by {ctx.author}')
                else:
                    await ctx.channel.send(f'OK, {ctx.author.mention}. I cancelled the track search.')
            except FileExistsError:
                await ctx.channel.send(f"Track already exists in dynamic playlist, "
                                       f"{ctx.author.mention}! I'm not gonna re-add it!")
            except ValueError:
                await ctx.channel.send(f"Cannot add podcast episode to playlist, "
                                       f"{ctx.author.mention}!")
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
        converted_song_id = await spotify_commands.convert_to_track_id(song_url_or_id)
        await spotify_commands.validate_song(track_id=converted_song_id)
        await spotify_commands.add_to_playlist(song_id=converted_song_id)
        spotify_commands.song_add_to_db(song_id=converted_song_id, user=str(ctx.author))
        await ctx.channel.send(f'Track has been added to the community playlists! {random.choice(emoji_responses)}')
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
    logger.debug(f'User {ctx.author} invoked {config.bot_command_prefix}playlists')
    playlist_embed = discord.Embed(title=f'{config.bot_command_prefix}links',
                                   description='Links to the playlists and more. Be sure to '
                                               'follow the playlists for easy access :grinning:',
                                   color=random.randint(0, 0xffffff))
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
        help_embed = discord.Embed(title='$help search', color=random.randint(0, 0xffffff))
        help_embed.add_field(name="Function information",
                             value='Finds a song to add to the playlist with duration no '
                                   'greater than 10 minutes. Returns the top 10 results. Select emoji on '
                                   'bot message to confirm track.')
        help_embed.add_field(name="Example",
                             value='$search bohemian rhapsody')
        await ctx.send(embed=help_embed)

    elif section.lower().__contains__('add'):
        help_embed = discord.Embed(title='$help add', color=random.randint(0, 0xffffff))
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
                                   color=random.randint(0, 0xffffff))
        help_embed.add_field(name='$search', value='Searches Spotify based on song name '
                                                   'and lists the top results', inline=False)
        help_embed.add_field(name='$add', value='Input a Spotify song link/URI/ID to '
                                                'add it directly to the playlist', inline=False)
        help_embed.add_field(name='$suggestion', value='Send a suggestion to threesquared', inline=False)

        await ctx.send(embed=help_embed)


if __name__ == "__main__":
    bot.run(DISCORD_TOKEN)
