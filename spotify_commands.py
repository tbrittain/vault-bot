import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv
import os
import asyncio

load_dotenv()
CLIENT_ID = os.getenv("SPOTIPY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIPY_CLIENT_SECRET")

scope = "playlist-modify-public"
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET))


async def song_search(user_message):
    original_message = str(user_message)
    original_message = original_message.replace("'", "")  # clean up user message for spotify search
    original_message = original_message.replace('"', '')

    search_results = sp.search(q='track:' + original_message, type='track')
    # print(search_results['tracks']['items'])
    if len(search_results['tracks']['items']) > 0:
        track_results_string = "```"
        counter = 1
        for item in search_results['tracks']['items']:
            artist = (item['album']['artists'][0]['name'])  # artist name
            album = (item['album']['name'])  # album name
            track = (item['name'])  # track name

            artist_url = (item['album']['artists'][0]['external_urls']['spotify'])
            album_url = (item['album']['external_urls']['spotify'])

            track_results_string += f'{counter}. {track} by [{artist}]({artist_url})' \
                                    f' from album [{album}]({album_url})\n'
            counter += 1
        track_results_string += '```'
        return track_results_string
    else:
        return f'No Spotify tracks for query {original_message} found!'


async def add_to_playlist(user_message):
    await asyncio.gather(song_search())

    return


if __name__ == "__main__":
    search = input('Input a song name: ')
    results = asyncio.run(song_search(search))
    print(results)
