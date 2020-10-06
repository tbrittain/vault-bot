import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()
CLIENT_ID = os.getenv("SPOTIPY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIPY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIPY_REDIRECT_URI")

scope = "playlist-modify-public user-library-read"
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI, scope=scope))


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


# TODO: prevent episodes from being added to playlist
async def add_to_playlist(song_id, user):
    song_id = [song_id, ]  # for whatever reason, spotipy input is a list
    # TODO: prevent duplicate tracks from being added to community playlist
    sp.playlist_add_items('5YQHb5wt9d0hmShWNxjsTs', song_id)
    sp.playlist_add_items('4C6pU7YmbBUG8sFFk4eSXj', song_id)

    # may need a separate song search function to pull exact song ID just in case user submits URL

    # invoke JSON functions here to add to stats.json


# https://stackoverflow.com/a/61529490/14338656
def octToDec(octal_number):
    string_oct = str(octal_number)
    le = len(string_oct)
    octal = 0
    for i in (range(le)):
        octal = octal + int(string_oct[i]) * pow(8, le - 1)
        le -= 1
    print(octal)


async def convert_to_track_id(song_input):
    song = sp.track(track_id=song_input)
    print(f'Converted input {song_input} to {song["id"]}')
    return song['id']


def get_track_info(track_id, user):
    global track_info
    song = sp.track(track_id=track_id)

    try:
        track_info = {'artist': (song['artists'][0]['name']),
                      'song': (song['name']),
                      'album': (song['album']['name']),
                      'added_by': user,
                      'added_at': str(datetime.now()),
                      'song_length': (float(song['duration_ms']) / 60000)}

        audio_analysis = sp.audio_features(song['id'])[0]

        track_info['tempo'] = (audio_analysis['tempo'])
        track_info['danceability'] = (audio_analysis['danceability'])
        track_info['energy'] = (audio_analysis['energy'])
        track_info['loudness'] = (audio_analysis['loudness'])
        track_info['acousticness'] = (audio_analysis['acousticness'])
        track_info['instrumentalness'] = (audio_analysis['instrumentalness'])
        track_info['liveness'] = (audio_analysis['liveness'])
        track_info['valence'] = (audio_analysis['valence'])

    except IndexError:  # a track attribute did not exist, then just skip. happens occasionally when no artist found.
        pass

    return track_info


if __name__ == "__main__":
    user = 'Trey'
    track = 'spotify:track:3E9oQBH768xYj5YuZ9WIH7'
    new_track_id = convert_to_track_id(song_input=track)

    print(get_track_info(track_id=new_track_id, user='Trey'))
