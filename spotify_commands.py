import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import os
from datetime import datetime
from spotipy import SpotifyException
import db
import pandas as pd
import random

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


async def add_to_playlist(song_id):
    existing_songs = await songs_in_dyn_playlist()
    if song_id in existing_songs:
        raise FileExistsError('Song already present in Dyn playist! Not adding duplicate ID.')
    else:
        song_id = [song_id, ]  # for whatever reason, spotipy input is a list
        sp.playlist_add_items('5YQHb5wt9d0hmShWNxjsTs', song_id)  # dynamic
        sp.playlist_add_items('4C6pU7YmbBUG8sFFk4eSXj', song_id)  # archive


async def songs_in_dyn_playlist():
    results = sp.playlist_items('5YQHb5wt9d0hmShWNxjsTs')  # dynamic playlist ID
    tracks = results['items']
    while results['next']:
        results = sp.next(results)
        tracks.extend(results['items'])

    tracks_in_playlist = {}
    for song in tracks:
        tracks_in_playlist[song['track']['id']] = song['track']['name']

    return tracks_in_playlist


async def convert_to_track_id(song_input):
    song = sp.track(track_id=song_input)
    print(f'Converted input {song_input} to {song["id"]}')

    return song['id']


# cannot await this function since used with updating the json
def get_track_info(track_id, user):
    global track_info
    song = sp.track(track_id=track_id)

    try:
        track_info = {'artist': (song['artists'][0]['name']),
                      'song': (song['name']),
                      'album': (song['album']['name']),
                      'added_by': user,
                      'added_at': str(datetime.now()),
                      'song_length': (float(song['duration_ms']) / 60000),
                      'artist_id': song['artists'][0]['id']}

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


async def validate_song(track_id):
    try:
        song = sp.track(track_id=track_id)
        if int(song['duration_ms']) > 600000:  # catch if song greater than 600k ms (10 min)
            raise OverflowError('Track too long!')

    # never reached bc handled prior to reaching this function
    except SpotifyException:  # catch if user tries to add podcast episode to playlist
        raise ValueError('Cannot add podcast episode to playlist!')


def artist_genres(artist_id):
    # gotta reformat genres because some genres have apostrophes or are quotation strings vs apostrophe strings
    # and sql can only accept apostrophe varchars
    genres = sp.artist(artist_id)['genres']
    genres = str(genres)
    genres = genres.replace("'", "")
    genres = genres.replace('"', "")
    genres = genres.replace('[', "")
    genres = genres.replace(']', "")
    genres = genres.split(', ')

    return genres


# likely once a song added/songs purged
def playlist_genres(playlist_id):
    results = sp.playlist_items(playlist_id)  # dynamic playlist ID
    tracks = results['items']
    while results['next']:
        results = sp.next(results)
        tracks.extend(results['items'])

    artist_list = []
    for song in tracks:
        artist_list.append(song['track']['artists'][0]['id'])

    artist_genres = {}
    for artist in artist_list:
        artist_genres[artist] = sp.artist(artist)['genres']

    # make it so all genres from artists are taken into account
    total_genre_list = []
    for artist, artist_genres in artist_genres.items():
        for individual_genre in artist_genres:
            total_genre_list.append(individual_genre)

    genre_count = {}
    for genre in total_genre_list:
        try:
            if genre not in genre_count:
                genre_count[genre] = 1
            else:
                genre_count[genre] += 1
        except IndexError:  # some artists do not have a genre
            pass

    genre_count = {key: value for key, value in
                   sorted(genre_count.items(), key=lambda item: item[1], reverse=True)}

    return genre_count


def playlist_description_update(playlist_id, playlist_name):
    global desc
    genre_count_dict = playlist_genres(playlist_id)
    top_genres = {k: genre_count_dict[k] for k in list(genre_count_dict)[:10]}
    if playlist_name == 'dynamic':
        desc = 'This is a dynamic playlist, meaning that the songs ' \
               'are automagically purged by VaultBot after two weeks. '
    elif playlist_name == 'archive':
        desc = 'This playlist keeps all of the tracks that were added ' \
               'in the original Vault Community Playlist. '

    if len(top_genres) > 0:  # only adds genre details if there are actually artists in the playlist
        desc += 'Prominent genres include: '
        for genre, count in top_genres.items():
            desc += f'{genre}, '
        desc += 'and more!'

    # print(desc)
    description_length = len(desc)
    print(f'Updated length of playlist {playlist_name} description: {description_length}')

    if len(desc) < 300:  # need to ensure playlist description is 300 characters or fewer
        print(f'Playlist description length within valid range. Updating description of {playlist_name} playlist.')
        sp.playlist_change_details(playlist_id=playlist_id, description=desc)
    else:
        print(f'Description too long. Not updating {playlist_name} playlist description.')


def recommend_songs():
    artists = db.dyn_artists_artist_retrieve()
    artist_count = {}

    for artist in artists:
        if artist[0] not in artist_count:
            artist_count[artist[0]] = 1
        else:
            artist_count[artist[0]] += 1

    # this sorts by top artists for recommendations, but i think its better to seed random artists from the playlist
    # artist_count = {key: value for key, value in
    #                 sorted(artist_count.items(), key=lambda item: item[1], reverse=True)}
    # top_artists = [k for k in list(artist_count)[:5]]

    random_artists = []
    while len(random_artists) < 5:
        artist = random.choice(list(artist_count))
        if artist not in random_artists:
            random_artists.append(artist)

    # inherent problem with spotipy recommendations: if you keep song limit = 1, it appears that the
    # probability of the recommended song being from one of the random artist is VERY high
    # the higher the song limit, the more variability in the recommendation, which seems more ideal
    # ie some artists who are not currently on the playlist are recommended

    song_info_columns = ['song_uri', 'artist', 'artist_id', 'song', 'song_url', 'preview_url', 'album_art']
    total_song_df = pd.DataFrame(columns=song_info_columns)

    while len(total_song_df) < 10:
        recommended_tracks = sp.recommendations(seed_artists=random_artists, limit=20)
        for track in recommended_tracks['tracks']:
            if track['artists'][0]['id'] not in artist_count:
                song_info = {
                    'song_uri': track['uri'],
                    'artist': track['artists'][0]['name'],
                    'artist_id': track['artists'][0]['id'],
                    'song': track['name'],
                    'song_url': track['external_urls']['spotify'],
                    'album_art': track['album']['images'][1]['url']
                }
                if track['preview_url'] is not None:
                    song_info['preview_url'] = track['preview_url']

                song_df = pd.DataFrame(song_info, index=[0])
                total_song_df = pd.concat([total_song_df, song_df], ignore_index=True)

    return total_song_df


if __name__ == "__main__":
    song_recommendations = recommend_songs()
    choice = random.randint(0, 9)

    row = song_recommendations.loc[choice]
    print(row)

    print(row['preview_url'])
    print(type(row['preview_url']))
    print(isinstance(row['preview_url'], str))