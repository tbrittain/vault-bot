import discord
import os
from dotenv import load_dotenv
import asyncio
import spotify_commands
import time
from spotipy import SpotifyException
import schedule

load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")

bot = discord.Client()


# TODO: make bot ignore messages from other bots

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


@bot.event
async def on_message(message):
    if message.content[0] == "$":  # $ dollar sign will be the default bot command
        user_input = str(message.content)
        channel = message.channel
        print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()) + f' User {message.author} invoked = {user_input}')

        user_input = user_input.replace("$", "")  # bot already called, removing $ for parsing user message
        first_word = user_input.split(' ', 1)[0]  # first word corresponds to command
        try:
            message_body = user_input.split(' ', 1)[1:]  # rest of body correspond to command argument(s)
        except IndexError:
            pass  # some commands do not have arguments, so ignore

        # begin commands
        if first_word == 'search':  # $search command
            if not message_body:  # handle if no arguments for search
                await message.channel.send(f'Please search for a song with your words, {message.author.mention} ')
            else:
                raw_results = await asyncio.gather(spotify_commands.song_search(message_body))
                search_results = raw_results[0]
                msg = await message.channel.send(search_results[0])

                track_ids = search_results[1]
                print(len(track_ids))
                print(track_ids)

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
                    reaction, user = await bot.wait_for('reaction_add', timeout=60.0, check=check)
                except asyncio.TimeoutError:
                    await message.channel.send(f'Nevermind, {message.author.mention}. Be that way.')
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
                    print(track_ids[track_selection][track_selection + 1])
                    selected_track_id = track_ids[track_selection][track_selection + 1]
                    await message.channel.send('👍')
                    await spotify_commands.add_to_playlist(selected_track_id)
                    await message.channel.send('Track has been added to the community playlist!')

        elif first_word == 'add':  # $add command
            message_body = str(message_body)
            message_body = message_body.replace('[', "")
            message_body = message_body.replace(']', "")
            message_body = message_body.replace("'", "")
            try:
                await spotify_commands.add_to_playlist(message_body)
            except IndexError:
                await message.channel.send(f'Please enter a Spotify track ID, {message.author.mention}')
            except SpotifyException:
                await message.channel.send(f'Please enter a valid argument, {message.author.mention}')
                await message.channel.send(f'Valid arguments for $add are the raw Spotify song link, song URI, '
                                           f'or song ID')

        elif first_word == 'playlist':
            try:
                playlist_embed = discord.Embed(title='$playlist',
                                               description='Links to the playlists',
                                               color=0x00ff00)
                playlist_embed.add_field(name='Main playlist', value='https://open.spotify.com/playlist'
                                                                     '/5YQHb5wt9d0hmShWNxjsTs?si=Zw8fNLiKSligb1pQcMfUlg')
                playlist_embed.add_field(name='Archive playlist', value='https://open.spotify.com/playlist'
                                                                        '/4C6pU7YmbBUG8sFFk4eSXj?si=R2O3G3suS1CSuFEQPjZIhA')
                await message.channel.send(embed=playlist_embed)
            except IndexError:
                pass

        elif first_word == 'help':
            try:
                help_embed = discord.Embed(title='$help',
                                           description='Hopefully this answers your question...',
                                           color=0x00ff00)
                help_embed.add_field(name='$search', value='Searches Spotify based on song name '
                                                           'and lists the top 10 results')
                help_embed.add_field(name='$add', value='Input a Spotify song link/URI/ID to add it directly to the '
                                                        'playlist')
                help_embed.add_field(name='$playlist', value='Pastes link to the Spotify playlist')
                await message.channel.send(embed=help_embed)
            except IndexError:
                pass
        else:
            await message.channel.send(f'Unrecognized command "{first_word}", {message.author.mention}!')


if __name__ == "__main__":
    bot.run(DISCORD_TOKEN)
    # after this, need to invoke command to analyze whether song been added >2 weeks ago, then remove it from dynamic
    # playlist
