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
import stats_commands
import subprocess

load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")

bot = discord.Client()


# TODO: urgent! backup json
# TODO: make bot ignore messages from other bots
# TODO: troubleshoot why bot sometimes responds with N instead of song results
# TODO: consider rewriting main.py according to @bot.command() rather than on message for all events
# TODO: function that updates playlist description with some genres?
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
    song_time_check.start()


@bot.event
async def on_message(message):
    if message.content[0] == "$":  # $ dollar sign will be the default bot command
        user_input = str(message.content)

        print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()) + f' User {message.author} invoked = {user_input}')

        user_input = user_input.replace("$", "")  # bot already called, removing $ for parsing user message
        first_word = user_input.split(' ', 1)[0]  # first word corresponds to command

        message_body = user_input.split(' ', 1)[1:]  # rest of body correspond to command argument(s)

        # begin commands
        if first_word.lower() == 'search':  # $search command
            if not message_body:  # handle if no arguments for search
                await message.channel.send(f'Please search for a song with your words, {message.author.mention} ')
            else:
                raw_results = await asyncio.gather(spotify_commands.song_search(message_body))
                search_results = raw_results[0]
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
                await message.channel.send(f'Select the emoji of the track you want to add, {message.author.mention}')

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
                        await spotify_commands.check_song(track_id=selected_track_id)  # check if valid track
                        await spotify_commands.add_to_playlist(song_id=selected_track_id)

                        # cannot await the JSON serializable stats_song_add()
                        stats_commands.stats_song_add(song_id=selected_track_id, user=str(message.author))
                        await message.channel.send(random.choice(emoji_responses))
                        await message.channel.send('Track has been added to the community playlists!')
                        print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()) +
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
            # print(f'message_body is {message_body}')
            emoji_responses = ['👌', '👍', '🤘', '🤙', '🤝']
            try:
                converted_song_id = await spotify_commands.convert_to_track_id(message_body)
                await spotify_commands.check_song(track_id=converted_song_id)  # check if valid track

                await spotify_commands.add_to_playlist(song_id=converted_song_id)
                stats_commands.stats_song_add(song_id=converted_song_id, user=str(message.author))
                await message.channel.send(random.choice(emoji_responses))
                await message.channel.send('Track has been added to the community playlists!')
                print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()) +
                      f' Song of ID {message_body} added to playlists by {message.author}')

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

        elif first_word.lower() == 'stats':
            try:
                if not message_body:
                    await message.channel.send(f'Please enter a valid argument, '
                                               f'such as $stats playlist or $stats user, {message.author.mention}!')
                else:
                    message_body = str(message_body)
                    message_body = message_body.replace('[', '')
                    message_body = message_body.replace(']', '')
                    message_body = message_body.replace('"', '')
                    message_body = message_body.replace("'", '')

                    method_argument = message_body.split(' ', 1)[0]
                    method_argument = str(method_argument)

                    if method_argument != 'playlist' and method_argument != 'user' and method_argument != 'advanced':
                        # defaults to dynamic playlist
                        message_body = 'playlist'
                    if message_body == 'advanced':
                        # had to use the absolute paths due to R and Rscript.exe not understanding relative paths
                        subprocess.call(
                            ["C:/Program Files/R/R-3.5.1/bin/Rscript.exe", "D:/Github/vault-bot/stats_graphics.R"])
                        file = discord.File("embeds/dynamic_plot.jpg", filename="dynamic_plot.jpg")
                        await message.channel.send(file=file)
                    else:
                        await message.channel.send(stats_commands.display_stats(method=message_body))
            except ValueError:
                await message.channel.send(f'User not present in my ledger, {message.author.mention}!')
                await message.channel.send(f'Be sure you enter user name in the correct format, e.g. {message.author}')

        elif first_word.lower() == 'highscores':
            try:
                if not message_body:
                    await message.channel.send(f'Please enter a valid argument, such as $highscores playlist or '
                                               f'$highscores user, {message.author.mention}!')
                else:
                    message_body = str(message_body)
                    message_body = message_body.replace('[', '')
                    message_body = message_body.replace(']', '')
                    message_body = message_body.replace('"', '')
                    message_body = message_body.replace("'", '')

                    method_argument = message_body.split(' ', 1)[0]
                    method_argument = str(method_argument)

                    if method_argument != 'playlist' and method_argument != 'user':  # defaults to dynamic playlist
                        message_body = 'playlist'

                    await message.channel.send(stats_commands.display_highscores(method=message_body))
            except ValueError:
                await message.channel.send(f'User not present in my ledger, {message.author.mention}!')
                await message.channel.send(f'Be sure you enter user name in the correct format, e.g. {message.author}')

        elif first_word.lower() == 'playlists' or first_word.lower() == 'playlist':
            try:
                playlist_embed = discord.Embed(title='$playlists',
                                               description='Links to the playlists. Paste the URI in your browser to '
                                                           'open the playlist on your desktop client! Be sure to '
                                                           'follow the playlist for easy access :grinning:',
                                               color=0x00ff00)
                playlist_embed.add_field(name='Main playlist', value='https://spoti.fi/33AnPqd', inline=False)
                playlist_embed.add_field(name='Archive playlist', value='https://spoti.fi/3iGBNeE', inline=False)
                playlist_embed.add_field(name='Main Spotify URI',
                                         value='spotify:playlist:5YQHb5wt9d0hmShWNxjsTs', inline=False)
                playlist_embed.add_field(name='Archive Spotify URI',
                                         value='spotify:playlist:4C6pU7YmbBUG8sFFk4eSXj', inline=False)
                await message.channel.send(embed=playlist_embed)
            except IndexError:
                pass

        elif first_word.lower() == 'random':
            number = random.randint(1, 8)

            if number == 1:
                file = discord.File("embeds/gato.jpg", filename="gato.jpg")
                await message.channel.send(file=file)
            elif number == 2:
                file = discord.File("embeds/necky.mp4", filename="necky.mp4")
                await message.channel.send(file=file)
            elif number == 3:
                file = discord.File("embeds/flip.mp4", filename="flip.mp4")
                await message.channel.send(file=file)
            elif number == 4:
                file = discord.File("embeds/kyle.mp3", filename="kyle.mp3")
                await message.channel.send(file=file)
            elif number == 5:
                file = discord.File("embeds/lasana.jpg", filename="lasana.jpg")
                await message.channel.send(file=file)
            elif number == 6:
                file = discord.File("embeds/nuggy.jpg", filename="nuggy.jpg")
                await message.channel.send(file=file)
            elif number == 7:
                file = discord.File("embeds/hit.jpg", filename="hit.jpg")
                await message.channel.send(file=file)
            elif number == 8:
                file = discord.File("embeds/kyle2.mp3", filename="kyle2.mp3")
                await message.channel.send(file=file)

        # help documentation
        elif first_word.lower() == 'help':
            command_names = ['search', 'add', 'stats', 'highscores', 'playlists']
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
                                         value='See https://bit.ly/3d9Z9bm for more info on Spotify track attributes', inline=False)
                    help_embed.add_field(name="Playlist example",
                                         value='$stats playlist', inline=False)
                    help_embed.add_field(name="User example",
                                         value='$stats user threesquared#3899', inline=False)
                    await message.channel.send(embed=help_embed)

                elif message_body.__contains__('highscores'):
                    help_embed = discord.Embed(title='$help highscores', color=random.randint(0, 0xffffff))
                    help_embed.add_field(name="Function information",
                                         value='Retrieve the high or low statistics for a playlist/user', inline=False)
                    help_embed.add_field(name="Spotify track attributes",
                                         value='See https://bit.ly/3d9Z9bm for more info on Spotify track attributes',
                                         inline=False)
                    help_embed.add_field(name="Playlist high scores example",
                                         value='$highscores playlist', inline=False)
                    help_embed.add_field(name="Playlist low scores example",
                                         value='$highscores playlist low', inline=False)
                    help_embed.add_field(name="Archive playlist high scores example",
                                         value='$highscores playlist archive high', inline=False)
                    help_embed.add_field(name="User example (TBA)",
                                         value='$highscores user threesquared#3899', inline=False)
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
                    help_embed.add_field(name='$highscores', value='Lists the top tracks for each Spotify attribute '
                                                                   'for a playlist/user', inline=False)

                    await message.channel.send(embed=help_embed)
                except IndexError:
                    pass
        else:
            await message.channel.send(f'Unrecognized command "{first_word}", {message.author.mention}!')


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
    for track in track_list:
        for key, value in track.items():
            date_split = value.split('-')
            time_difference = datetime.now() - datetime(year=int(date_split[0]),
                                                        month=int(date_split[1]),
                                                        day=int(date_split[2]))
            if time_difference > timedelta(days=14):  # set 2 weeks threshold for track removal
                # TODO: update the json to refresh calculating average attributes when tracks removed
                spotify_commands.sp.playlist_remove_all_occurrences_of_items(playlist_id='5YQHb5wt9d0hmShWNxjsTs',
                                                                             items=[key])
                stats_commands.purge_stats(song_id=[key])

                print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()) + f' Song {key} removed from playlist')
    print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()) + ' Hourly playlist cleanup complete')


if __name__ == "__main__":
    bot.run(DISCORD_TOKEN)  # statement is blocking, needs to be final in execution
