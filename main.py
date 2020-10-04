import discord
import os
from dotenv import load_dotenv

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

        # INCREMENTS THE GUILD COUNTER.
        guild_count = guild_count + 1

    # PRINTS HOW MANY GUILDS / SERVERS THE BOT IS IN.
    print("SampleDiscordBot is in " + str(guild_count) + " guilds.")


@bot.event
async def on_message(message):
    # CHECKS IF THE MESSAGE THAT WAS SENT IS EQUAL TO "HELLO".
    if message.content == "hello":
        # SENDS BACK A MESSAGE TO THE CHANNEL.
        await message.channel.send("hey dirtbag")


bot.run(DISCORD_TOKEN)
