import discord
from discord.ext import tasks
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

load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")

bot = discord.Client()
curr_time = time.strftime("%H:%M:%S", time.localtime())


# TODO: make bot ignore messages from other bots
# TODO: add header metadata for rmd HTML output
# TODO: add highscores tab in the Rmd file that shows different metrics (current top artists, top users)
# TODO: see how program responds to songs being re-added to dyn playlist once expired when it comes to archive

# IMPORTANT BELOW
# TODO: consider rewriting main.py according to @bot.command() rather than on message for all events
# i wrote main.py a bit haphazardly compared to how it probably should be written
# discord.py offers @bot.command events that handle individual bot commands
# the way that i have it currently written essentially makes it so that EVERY message to the channel is parsed by
# the bot, which actually causes some problems (namely IndexErrors) that tend to spam the console
# these don't break the program thankfully, but they definitely are annoying and rewriting main.py has
# been on my radar for some time
# https://github.com/Rapptz/discord.py <- look at examples

@bot.event
async def on_ready():
    # CREATES A COUNTER TO KEEP TRACK OF HOW MANY GUILDS / SERVERS THE BOT IS CONNECTED TO.
    guild_count = 0
    # LOOPS THROUGH ALL THE GUILD / SERVERS THAT THE BOT IS ASSOCIATED WITH.
    for guild in bot.guilds:
        # PRINT THE SERVER'S ID AND NAME.
        print(f"- {guild.id} (name: {guild.name})")
        guild_count = guild_count + 1
    print(f"VaultBot is in {guild_count} guilds.")
    print(f"VaultBot is fully loaded and online.")
    await bot.change_presence(activity=discord.Game('$help'))  # sets discord activity to $help

    # tri-daily scheduled tasks
    sql_backup.start()

    # hourly scheduled tasks
    song_time_check.start()


@bot.event
async def on_message(message):
    papa_check = str(message.content)
    if message.content[0] == "$":  # $ dollar sign will be the default bot command
        user_input = str(message.content)

        print(curr_time + f' User {message.author} invoked: {user_input}')

        user_input = user_input.replace("$", "")  # bot already called, removing $ for parsing user message
        first_word = user_input.split(' ', 1)[0]  # first word corresponds to command

        message_body = user_input.split(' ', 1)[1:]  # rest of body correspond to command argument(s)

        # begin commands
        if first_word.lower() == 'search':  # $search command
            if not message_body:  # handle if no arguments for search
                await message.channel.send(f'Please search for a song with your words, {message.author.mention}')
            else:
                raw_results = await asyncio.gather(spotify_commands.song_search(message_body))
                search_results = raw_results[0]

                # check if any results were found
                if search_results[0] == 'N':
                    await message.channel.send(f'No tracks found! Are you sure you '
                                               f'spelled everything right, {message.author.mention}?')
                else:  # results were found
                    msg = await message.channel.send(search_results[0])
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
                    await message.channel.send(
                        f'Select the emoji of the track you want to add, {message.author.mention}')

                    def check(reaction, user):  # define the conditions where the bot will actually add the song
                        if user == message.author and any(str(reaction.emoji) in s for s in emojis):
                            return True
                        else:
                            return False

                    try:
                        reaction, user = await bot.wait_for('reaction_add', timeout=30.0, check=check)
                    except asyncio.TimeoutError:
                        await message.channel.send(f'Never mind, {message.author.mention}. '
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
                        # print(track_ids[track_selection][track_selection + 1])
                        try:
                            selected_track_id = track_ids[track_selection][track_selection + 1]
                            emoji_responses = ['👌', '👍', '🤘', '🤙', '🤝']

                            # check_song raises exceptions if song not valid for playlist
                            await spotify_commands.validate_song(track_id=selected_track_id)  # check if valid track
                            await spotify_commands.add_to_playlist(song_id=selected_track_id)

                            # cannot await the JSON serializable stats_song_add()
                            db.db_song_add(song_id=selected_track_id, user=str(message.author))
                            await message.channel.send(random.choice(emoji_responses))
                            await message.channel.send('Track has been added to the community playlists!')
                            print(curr_time +
                                  f' Song of ID {selected_track_id} added to playlists by {message.author}')
                        except FileExistsError:
                            await message.channel.send(f"Track already exists in dynamic playlist, "
                                                       f"{message.author.mention}! I'm not gonna re-add it!")
                        except ValueError:
                            await message.channel.send(f"Cannot add podcast episode to playlist, "
                                                       f"{message.author.mention}!")
                        except OverflowError:
                            await message.channel.send(f"Cannot add songs longer than 10 minutes "
                                                       f"to playlist, {message.author.mention}!")

        elif first_word.lower() == 'add':  # $add command
            message_body = str(message_body)
            message_body = message_body.replace('[', "")
            message_body = message_body.replace(']', "")
            message_body = message_body.replace("'", "")

            emoji_responses = ['👌', '👍', '🤘', '🤙', '🤝']
            try:
                converted_song_id = await spotify_commands.convert_to_track_id(message_body)
                await spotify_commands.validate_song(track_id=converted_song_id)  # check if valid track

                await spotify_commands.add_to_playlist(song_id=converted_song_id)
                db.db_song_add(song_id=converted_song_id, user=str(message.author))
                await message.channel.send(random.choice(emoji_responses))
                await message.channel.send('Track has been added to the community playlists!')
                print(curr_time +
                      f' Song of ID {converted_song_id} added to playlists by {message.author}')

            except IndexError:
                await message.channel.send(f'Please enter a Spotify track ID, {message.author.mention}')
            except SpotifyException:
                await message.channel.send(f'Please enter a valid argument, {message.author.mention}')
                await message.channel.send(f'Valid arguments for $add are the raw Spotify song link, song URI, '
                                           f'or song ID')
            except FileExistsError:
                await message.channel.send(f"Track already exists in dynamic playlist, "
                                           f"{message.author.mention}! I'm not gonna re-add it!")
            except ValueError:
                await message.channel.send(f"Cannot add podcast episode to playlist, "
                                           f"{message.author.mention}!")
            except OverflowError:
                await message.channel.send(f"Cannot add songs longer than 10 minutes "
                                           f"to playlist, {message.author.mention}!")

        # re-did stats to simply paste link to the website
        # phased out highscores
        elif first_word.lower() == 'stats':

            message_body = str(message_body)
            message_body = message_body.replace('[', "")
            message_body = message_body.replace(']', "")
            message_body = message_body.replace("'", "")

            if message_body == 'advanced':
                # had to use the absolute paths due to R and Rscript.exe not understanding relative paths
                subprocess.call(
                    ["C:/Program Files/R/R-4.0.3/bin/Rscript.exe", "D:/Github/vault-bot/stats_graphics.R"])
                file = discord.File("embeds/dynamic_plot.jpg", filename="dynamic_plot.jpg")
                await message.channel.send(file=file)
            else:
                playlist_embed = discord.Embed(title='$stats',
                                               description='Link to stats',
                                               color=random.randint(0, 0xffffff))
                playlist_embed.add_field(name='Link', value='http://vaultbot.tbrittain.com/', inline=False)
                await message.channel.send(embed=playlist_embed)

        elif first_word.lower() == 'playlists' or first_word.lower() == 'playlist':
            try:
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
                await message.channel.send(embed=playlist_embed)
            except IndexError:
                pass

        elif first_word.lower() == 'suggestion':
            message_body = str(message_body)
            message_body = message_body.replace('[', "")
            message_body = message_body.replace(']', "")
            message_body = message_body.replace("'", "")

            if not message_body:
                await message.channel.send(f"Please include something in your suggestion, {message.author.mention}!")
            else:
                benevolent_dictator = bot.get_user(177260855308713985)
                await discord.Member.send(benevolent_dictator,
                                          content=f'User {message.author} submitted suggestion: {message_body}')
                await message.channel.send(f'Thanks, your suggestion has been relayed to my '
                                           f'master, {message.author.mention}')

        # help documentation
        elif first_word.lower() == 'help':
            command_names = ['search', 'add', 'stats', 'playlists']
            message_body = str(message_body)
            message_body = message_body.replace("'", "")
            message_body = message_body.replace("[", "")
            message_body = message_body.replace("]", "")
            message_body = message_body.replace('"', "")

            if message_body in command_names:
                if message_body.__contains__('search'):
                    help_embed = discord.Embed(title='$help search', color=random.randint(0, 0xffffff))
                    help_embed.add_field(name="Function information",
                                         value='Finds a song to add to the playlist with duration no '
                                               'greater than 10 minutes. Returns the top 10 results. Select emoji on '
                                               'bot message to confirm track.')
                    help_embed.add_field(name="Example",
                                         value='$search bohemian rhapsody')
                    await message.channel.send(embed=help_embed)

                elif message_body.__contains__('add'):
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
                    await message.channel.send(embed=help_embed)
                    file = discord.File("embeds/addmobile.gif", filename="addmobile.gif")
                    await message.channel.send('You can even PM me a song directly to add it to the playlist!',
                                               file=file)

                elif message_body.__contains__('stats'):
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
                    await message.channel.send(embed=help_embed)

                elif message_body.__contains__('playlists'):
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
                    await message.channel.send(embed=help_embed)

            else:
                try:
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

                    await message.channel.send(embed=help_embed)
                except IndexError:
                    pass
        else:
            await message.channel.send(f'Unrecognized command "{first_word}", {message.author.mention}!')
    elif papa_check.lower().__contains__('papa'):
        file = discord.File("embeds/papa.MOV", filename="papa.mov")
        await message.channel.send(file=file)

    elif papa_check.lower().__contains__('-play'):
        alert_check = random.randint(1, 10)
        if alert_check == 1:
            await message.channel.send(f'I see you are playing some music there, {message.author.mention}')
            await message.channel.send(f'How about you share some tunes to the community playlist? :wink:')


@tasks.loop(minutes=60)
async def song_time_check():
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
        print(curr_time + ' Preparing to update track popularities and check for expired songs.\n'
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

                    print(curr_time + f' Song {key} removed from playlist')
    print(curr_time + ' Track popularities updated and expired songs checked.')
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


if __name__ == "__main__":
    bot.run(DISCORD_TOKEN)  # statement is blocking, needs to be final in execution
