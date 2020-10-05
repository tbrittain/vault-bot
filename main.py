import discord
import os
from dotenv import load_dotenv
import asyncio
import spotify_commands
import time

load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")

bot = discord.Client()


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

        print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()) + f' User {message.author} invoked = {user_input}')

        user_input = user_input.replace("$", "")  # bot already called, removing $ for parsing user message
        first_word = user_input.split(' ', 1)[0]  # first word corresponds to command
        message_body = user_input.split(' ', 1)[1:]  # rest of body correspond to command argument(s)

        # begin commands
        if first_word == 'search':
            if not message_body:  # handle if no arguments for search
                await message.channel.send(f'Please search for a song with your words, {message.author.mention} ')
            else:
                search_results = await asyncio.gather(spotify_commands.song_search(message_body))
                await message.channel.send(embed=search_results)
                await message.channel.send("Use the number of your desired track in the $add command")
        elif first_word == 'add':
            await message.channel.send("add")
        else:
            await message.channel.send(f'Unrecognized command "{first_word}", {message.author.mention}!')


if __name__ == "__main__":
    bot.run(DISCORD_TOKEN)
