import discord
from discord.ext import tasks, commands
import os
from dotenv import load_dotenv
import asyncio
import spotify_commands
import time
from spotipy import SpotifyException
from datetime import datetime, timedelta
import random
import subprocess
import db
import io_functions
import pandas as pd

# from network_visualization import network_coordinator

load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
bot = commands.Bot(command_prefix='$', case_insensitive=True, help_command=None)
curr_time = time.strftime("%H:%M:%S", time.localtime())


@bot.event
async def on_ready():
    guild_count = 0
    for guild in bot.guilds:
        print(f"- {guild.id} (name: {guild.name})")
        guild_count = guild_count + 1
    print(f"VaultBot is in {guild_count} guilds.")
    print(f"VaultBot is fully loaded and online.")
    await bot.change_presence(activity=discord.Game('$help'))  # sets discord activity to $help

    # tri-daily scheduled tasks
    # sql_backup.start()

    # hourly scheduled tasks
    # hourly_cleanup.start()


@tasks.loop(minutes=60)
async def hourly_cleanup():
    await bot.wait_until_ready()
    results = spotify_commands.sp.playlist_items(playlist_id='5YQHb5wt9d0hmShWNxjsTs')
    tracks = results['items']
    while results['next']:
        results = spotify_commands.sp.next(results)
        tracks.extend(results['items'])

    track_list = []
    if len(tracks) > 0:
        for track in tracks:
            # date in YYYY-MM-DD format by default from Spotify
            added_at = track['added_at']
            added_at = added_at.split('T', 1)  # precision of the track removal is to the day, not to the hour
            added_at = added_at[0]
            track_dict = {track['track']['id']: added_at}

            track_list.append(track_dict)

    # iterates over tracks pulled from spotify and for each one, determines whether it needs to be removed from
    if len(track_list) > 0:
        print(curr_time + ': Preparing to update track popularities and check for expired songs.\n'
                          'Please do not exit the program during this time.')
        for track in track_list:
            # key is the track id
            for key, value in track.items():
                # updates popularity of tracks in dynamic playlist db
                db.popularity_update(track_id=key)
                date_split = value.split('-')
                time_difference = datetime.now() - datetime(year=int(date_split[0]),
                                                            month=int(date_split[1]),
                                                            day=int(date_split[2]))
                if time_difference > timedelta(days=14):  # set 2 weeks threshold for track removal
                    spotify_commands.sp.playlist_remove_all_occurrences_of_items(playlist_id='5YQHb5wt9d0hmShWNxjsTs',
                                                                                 items=[key])
                    db.db_purge_stats(song_id=key)

                    print(curr_time + f': Song {key} removed from playlist')
    print(curr_time + ': Track popularities updated and expired songs checked.')
    # updates playlist descriptions based on genres present
    spotify_commands.playlist_description_update(playlist_id="5YQHb5wt9d0hmShWNxjsTs", playlist_name='dynamic')
    # TODO: figure out why it can only update description of one of the two playlists, but not both
    # time.sleep(2)  # may need to take a little bit of time in between the playlist description updates
    # spotify_commands.playlist_description_update(playlist_id="4C6pU7YmbBUG8sFFk4eSXj", playlist_name='archive')

    # prep data for highscores website output
    db.arts_for_website()
    io_functions.dyn_artists_write_df()

    # produce html from Rmarkdown files
    subprocess.call(
        ["C:/Program Files/R/R-4.0.3/bin/Rscript.exe", "D:/Github/vault-bot/render_rmd.R"])

    # upload interactive table to Google Cloud through batch file
    subprocess.call([r"D:/Github/vault-bot/cloudsync.bat"])

    print(curr_time + ' Hourly playlist cleanup complete')


@tasks.loop(hours=8)
async def sql_backup():
    await bot.wait_until_ready()
    # https://wiki.postgresql.org/wiki/Automated_Backup_on_Windows
    timestamp = time.strftime("%m-%d-%Y_T%H-%M", time.localtime())
    # can set a custom backup name prefix here, then concat to timestamp
    backup_name = "vaultbot_db_backup_" + timestamp
    subprocess.call([r"D:/Github/vault-bot/sql-backup.bat", f"{backup_name}"])


@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        await ctx.send(f'Unrecognized command, {ctx.author.mention}!')


@bot.event
async def on_message(ctx):
    print(f'{curr_time}: User {ctx.author} sent message:')
    print(curr_time + ': ' + ctx.content)
    message = ctx.content.lower()
    if message.__contains__('papa'):
        file = discord.File("embeds/papa.MOV", filename="papa.mov")
        await ctx.send(file=file)
    elif message.__contains__('-play'):
        alert_check = random.randint(1, 5)
        if alert_check == 1:
            await ctx.send(f'I see you are playing some music there, {message.author.mention}')
            await ctx.send(f'How about you share some tunes to the community playlist? :wink:')
    await bot.process_commands(ctx)


@bot.command()
async def search(ctx, *, song_query):
    # TODO: see if all exceptions can be moved to search_errors
    global track_selection

    raw_results = await asyncio.gather(spotify_commands.song_search(song_query))
    search_results = raw_results[0]

    if search_results[0] == 'N':  # no search results
        await ctx.send(f'No tracks found! Are you sure you '
                       f'spelled everything right, {ctx.author.mention}?')

    else:  # results were found
        msg = await ctx.channel.send(search_results[0])
        track_ids = search_results[1]

        emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣',
                  '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

        emoji_counter = 0
        for emoji in emojis:  # only adds emojis on the results message for the amount of tracks present
            if emoji_counter == len(track_ids):
                break
            else:
                await msg.add_reaction(emoji=emoji)
                emoji_counter += 1

        await ctx.channel.send(
            f'Select the emoji of the track you want to add, {ctx.author.mention}')

        def check(reaction, user):  # define the conditions where the bot will actually add the song
            if user == ctx.author and any(str(reaction.emoji) in s for s in emojis):
                return True
            else:
                return False

        try:
            reaction, user = await bot.wait_for('reaction_add', timeout=30.0, check=check)
        except asyncio.TimeoutError:
            await ctx.channel.send(f'Never mind, {ctx.author.mention}. '
                                   f'You took too long. Please try again.')
        else:  # song added to playlist here
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

        try:
            selected_track_id = track_ids[track_selection][track_selection + 1]
            emoji_responses = ['👌', '👍', '🤘', '🤙', '🤝']

            # check_song raises exceptions if song not valid for playlist
            await spotify_commands.validate_song(track_id=selected_track_id)  # check if valid track
            await spotify_commands.add_to_playlist(song_id=selected_track_id)

            # cannot await the JSON serializable stats_song_add()
            db.db_song_add(song_id=selected_track_id, user=str(ctx.author))
            await ctx.channel.send(random.choice(emoji_responses))
            await ctx.channel.send('Track has been added to the community playlists!')
            print(curr_time +
                  f': Song of ID {selected_track_id} added to playlists by {ctx.author}')
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
async def add(ctx, song_url_or_id: str):
    emoji_responses = ['👌', '👍', '🤘', '🤙', '🤝']
    try:
        converted_song_id = await spotify_commands.convert_to_track_id(song_url_or_id)
        await spotify_commands.validate_song(track_id=converted_song_id)  # check if valid track
        await spotify_commands.add_to_playlist(song_id=converted_song_id)
        db.db_song_add(song_id=converted_song_id, user=str(ctx.author))
        await ctx.send(random.choice(emoji_responses))
        await ctx.send('Track has been added to the community playlists!')
        print(curr_time +
              f': Song of ID {converted_song_id} added to playlists by {ctx.author}')

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


@bot.command()
async def stats(ctx, advanced=''):
    if advanced.lower() == 'advanced':
        # had to use the absolute paths due to R and Rscript.exe not understanding relative paths
        subprocess.call(
            ["C:/Program Files/R/R-4.0.3/bin/Rscript.exe", "D:/Github/vault-bot/stats_graphics.R"])
        file = discord.File("embeds/dynamic_plot.jpg", filename="dynamic_plot.jpg")
        await ctx.send(file=file)
    else:
        playlist_embed = discord.Embed(title='$stats',
                                       description='Link to my website!',
                                       color=random.randint(0, 0xffffff))
        playlist_embed.add_field(name='Link', value='http://vaultbot.tbrittain.com/', inline=False)
        await ctx.send(embed=playlist_embed)


@bot.command(aliases=['playlist'])
async def playlists(ctx):
    playlist_embed = discord.Embed(title='$playlists',
                                   description='Links to the playlists. Paste the URI in your browser to '
                                               'open the playlist on your desktop client! Be sure to '
                                               'follow the playlist for easy access :grinning:',
                                   color=random.randint(0, 0xffffff))
    playlist_embed.add_field(name='Main playlist', value='https://spoti.fi/33AnPqd', inline=False)
    playlist_embed.add_field(name='Archive playlist', value='https://spoti.fi/3iGBNeE', inline=False)
    playlist_embed.add_field(name='Main Spotify URI',
                             value='spotify:playlist:5YQHb5wt9d0hmShWNxjsTs', inline=False)
    playlist_embed.add_field(name='Archive Spotify URI',
                             value='spotify:playlist:4C6pU7YmbBUG8sFFk4eSXj', inline=False)
    await ctx.send(embed=playlist_embed)


@bot.command(aliases=['recommendation'])
async def recommend(ctx):
    song_recommendations = spotify_commands.recommend_songs()
    choice = random.randint(0, 9)

    row = song_recommendations.loc[choice]
    genres = spotify_commands.artist_genres(row['artist_id'])

    playlist_embed = discord.Embed(title='$recommend',
                                   description='A song recommendation based on the current contents of the '
                                               'dynamic playlist',
                                   color=random.randint(0, 0xffffff))
    playlist_embed.set_image(url=row['album_art'])
    playlist_embed.add_field(name='Song', value=row['song'], inline=False)
    playlist_embed.add_field(name='Artist', value=row['artist'], inline=False)
    playlist_embed.add_field(name='URL', value=row['song_url'])
    playlist_embed.add_field(name='URI', value=row['song_uri'])

    if len(genres) > 0:
        playlist_embed.add_field(name='Genres', value=genres, inline=False)

    # check if preview url present, which is of type str, NaN is float
    if isinstance(row['preview_url'], str):
        playlist_embed.add_field(name='Song preview', value=row['preview_url'])

    if not isinstance(ctx.channel, discord.channel.DMChannel):
        await ctx.channel.send(f"Sending you a PM of a song to check out, {ctx.author.mention}!")
    await discord.Member.send(ctx.author, embed=playlist_embed)


@bot.command()
async def suggestion(ctx, *, suggested_idea):
    benevolent_dictator = bot.get_user(177260855308713985)
    await discord.Member.send(benevolent_dictator,
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
        file = discord.File("embeds/addmobile.gif", filename="addmobile.gif")
        await ctx.send('You can even PM me a song directly to add it to the playlist!',
                                   file=file)

    elif section.lower().__contains__('stats'):
        help_embed = discord.Embed(title='$help stats', color=random.randint(0, 0xffffff))
        help_embed.add_field(name="Function information",
                             value='Retrieve some interesting statistics for a playlist/user', inline=False)
        help_embed.add_field(name="Spotify track attributes",
                             value='See https://bit.ly/3d9Z9bm for more info on Spotify track attributes',
                             inline=False)
        help_embed.add_field(name="Playlist (gives browser link)",
                             value='$stats', inline=False)
        help_embed.add_field(name="Advanced",
                             value='$stats advanced', inline=False)
        await ctx.send(embed=help_embed)

    elif section.lower().__contains__('playlists'):
        help_embed = discord.Embed(title='$help playlists', color=random.randint(0, 0xffffff))
        help_embed.add_field(name="Function information",
                             value='Retrieve direct playlist links for easy access',
                             inline=False)
        help_embed.add_field(name="URLs",
                             value='Click them to open in your browser if you prefer web Spotify',
                             inline=False)
        help_embed.add_field(name="URIs",
                             value='Paste these in your browser and it will open the playlist in your '
                                   'desktop client', inline=False)
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
        help_embed.add_field(name='$playlists', value='Links to the Spotify playlists', inline=False)
        help_embed.add_field(name='$stats', value='General statistics for the songs '
                                                  'and users of the playlists', inline=False)
        help_embed.add_field(name='$suggestion', value='Send a suggestion to threesquared', inline=False)

        await ctx.send(embed=help_embed)


if __name__ == "__main__":
    bot.run(DISCORD_TOKEN)  # statement is blocking, needs to be final in execution
