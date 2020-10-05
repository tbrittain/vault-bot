import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import os
import time

load_dotenv()
CLIENT_ID = os.getenv("SPOTIPY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIPY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIPY_REDIRECT_URI")

scope = "playlist-modify-public"
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI))


async def song_search(user_message):
    original_message = str(user_message)
    original_message = original_message.replace("'", "")  # clean up user message for spotify search
    original_message = original_message.replace('"', '')

    search_results = sp.search(q='track:' + original_message, type='track')
    # print(search_results['tracks']['items'])
    if len(search_results['tracks']['items']) > 0:
        track_results_string = "```"
        results_list = []
        counter = 1
        for item in search_results['tracks']['items']:
            artist = (item['album']['artists'][0]['name'])  # artist name
            album = (item['album']['name'])  # album name
            track = (item['name'])  # track name

            track_id = (item['id'])
            track_id_dic = {counter: track_id}
            results_list.append(track_id_dic)
            # TODO: figure out how to embed links in markdown
            # https://stackoverflow.com/questions/44862112/how-can-i-send-an-embed-via-my-discord-bot-w-python
            # https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline-
            # artist_url = (item['album']['artists'][0]['external_urls']['spotify'])
            # album_url = (item['album']['external_urls']['spotify'])

            track_results_string += f'{counter}. "{track}" by {artist} from album "{album}"\n'
            counter += 1
        track_results_string += '```'
        return [track_results_string, results_list]
    else:
        return f'No Spotify tracks for query {original_message} found!'


# TODO: add sqlite database or JSON integration here to track overall stats
async def add_to_playlist(song_id):
    song_id = [song_id, ]
    sp.playlist_add_items('5YQHb5wt9d0hmShWNxjsTs', song_id)
    print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()) +
          f' Song of ID {song_id} added to Vault Community Playlist')
    sp.playlist_add_items('4C6pU7YmbBUG8sFFk4eSXj', song_id)
    print(time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()) +
          f' Song of ID {song_id} added to Vault Community Archive Playlist')



# https://stackoverflow.com/a/61529490/14338656
def octToDec(octal_number):
    string_oct = str(octal_number)
    le = len(string_oct)
    octal = 0
    for i in (range(le)):
        octal = octal + int(string_oct[i]) * pow(8, le - 1)
        le -= 1
    print(octal)


if __name__ == "__main__":
    pass
