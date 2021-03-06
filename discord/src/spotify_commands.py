import spotipy
from spotipy.oauth2 import SpotifyOAuth
from spotipy.cache_handler import CacheHandler
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
from .db import DatabaseConnection, access_secret_version
from .vb_utils import logger
from .config import environment
import sys
import json

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if environment == "dev":
    load_dotenv(f'{base_dir}/dev.env')
    CLIENT_ID = os.getenv("SPOTIPY_CLIENT_ID")
    CLIENT_SECRET = os.getenv("SPOTIPY_CLIENT_SECRET")
    REDIRECT_URI = os.getenv("SPOTIPY_REDIRECT_URI")
    commit_changes = False
elif environment == "prod":
    project_id = os.getenv("PROJECT_ID")
    CLIENT_ID = access_secret_version(secret_id="vb-spotify-client-id",
                                      project_id=project_id)
    CLIENT_SECRET = access_secret_version(secret_id="vb-spotify-client-secret",
                                          project_id=project_id)
    REDIRECT_URI = access_secret_version(secret_id="db-spotify-redirect-uri",
                                         project_id=project_id)
    commit_changes = True
    if project_id is None:
        print("Invalid environment setting, exiting")
        sys.exit(1)
else:
    print("Invalid environment variable, exiting")
    sys.exit(1)


class MemoryCacheHandler(CacheHandler):
    def __init__(self, token_info=None):
        """
        Parameters:
            * token_info: The token info to store in memory. Can be None.
        """
        self.token_info = token_info

    def get_cached_token(self):
        # logger.debug('Pulling Spotify cache information')
        return self.token_info

    def save_token_to_cache(self, token_info):
        logger.debug('Rewriting token info to memory')
        self.token_info = token_info


project_id = os.getenv("PROJECT_ID")
token = access_secret_version('vb-spotify-cache', project_id, '2')
json_token = json.loads(token)
cache_handler = MemoryCacheHandler(token_info=json_token)

scope = "playlist-modify-public user-library-read"
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI,
                                               scope=scope,
                                               cache_handler=cache_handler))


async def song_search(user_message):
    original_message = str(user_message)
    original_message = original_message.replace("'", "")
    original_message = original_message.replace('"', '')

    search_results = sp.search(q=original_message, type='track')
    if len(search_results['tracks']['items']) > 0:
        track_results_string = "```"
        result_track_ids = []
        for count, item in enumerate(search_results['tracks']['items']):
            artist = (item['album']['artists'][0]['name'])
            album = (item['album']['name'])
            track = (item['name'])

            track_id = (item['id'])
            track_id_dic = {count + 1: track_id}
            result_track_ids.append(track_id_dic)

            track_results_string += f'{count + 1}. "{track}" by {artist} from album "{album}"\n'
        track_results_string += '```'
        return track_results_string, result_track_ids
    else:
        raise SyntaxError('No tracks found')


async def add_to_playlist(song_id):
    existing_songs = songs_in_dyn_playlist()
    if song_id in existing_songs:
        logger.debug(f"{song_id} already exists in dynamic playlist, not adding")
        raise FileExistsError('Song already present in Dyn playlist! Not adding duplicate ID.')
    else:
        song_id = [song_id, ]  # input is a list
        if commit_changes:
            sp.playlist_add_items('5YQHb5wt9d0hmShWNxjsTs', song_id)  # dynamic
            sp.playlist_add_items('4C6pU7YmbBUG8sFFk4eSXj', song_id)  # archive
        else:
            logger.debug(f"Simulated adding song with ID {song_id} to playlists")


def songs_in_dyn_playlist():
    conn = DatabaseConnection()
    song_ids = conn.select_query(query_literal="song_id", table="dynamic")
    song_ids = [x[0] for x in song_ids]
    conn.terminate()
    return song_ids


async def convert_to_track_id(song_input):
    song = sp.track(track_id=song_input)
    logger.debug(f'Converted input {song_input} to {song["id"]}')

    return song['id']


def get_track_info(track_id, user):
    song = sp.track(track_id=track_id)

    # get overall track info
    track_info = {'artist': (song['artists'][0]['name']),
                  'song': (song['name']),
                  'album': (song['album']['name']),
                  'added_by': user,
                  'added_at': str(datetime.now()),
                  'song_length': (float(song['duration_ms']) / 60000),
                  'artist_id': song['artists'][0]['id'],
                  'album_art': song['album']['images'][0]['url']
                  }

    # add preview url if present
    if song['preview_url']:
        track_info['preview_url'] = song['preview_url']

    # get artist art, not always present
    try:
        artist_info = sp.artist(track_info['artist_id'])
        artist_art = artist_info['images'][0]['url']
        track_info['artist_art'] = artist_art
    except IndexError:
        pass

    # get audio features of song
    audio_analysis = sp.audio_features(song['id'])[0]

    track_info['tempo'] = (audio_analysis['tempo'])
    track_info['danceability'] = (audio_analysis['danceability'])
    track_info['energy'] = (audio_analysis['energy'])
    track_info['loudness'] = (audio_analysis['loudness'])
    track_info['acousticness'] = (audio_analysis['acousticness'])
    track_info['instrumentalness'] = (audio_analysis['instrumentalness'])
    track_info['liveness'] = (audio_analysis['liveness'])
    track_info['valence'] = (audio_analysis['valence'])

    return track_info


def song_add_to_db(song_id, user):
    conn = DatabaseConnection()

    song_dict = get_track_info(track_id=song_id, user=user)

    artist = song_dict['artist']
    song = song_dict['song']
    album = song_dict['album']
    added_by = song_dict['added_by']
    added_at = song_dict['added_at']
    song_length = song_dict['song_length']
    tempo = song_dict['tempo']
    dance = song_dict['danceability']
    energy = song_dict['energy']
    loudness = song_dict['loudness']
    acoustic = song_dict['acousticness']
    instrument = song_dict['instrumentalness']
    liveness = song_dict['liveness']
    valence = song_dict['valence']
    artist_id = song_dict['artist_id']
    album_art = song_dict['album_art']
    preview_url = None
    artist_art = None

    song_keys = list(song_dict.keys())
    if 'preview_url' in song_keys:
        preview_url = song_dict['preview_url']
    if 'artist_art' in song_keys:
        artist_art = song_dict['artist_art']

    # insert artist info into artists table
    artist_present = conn.select_query_with_condition(query_literal='id', table='artists',
                                                      column_to_match='id', condition=artist_id)
    if not artist_present:
        conn.insert_single_row(table='artists', columns=('id', 'name', 'art'), row=(artist_id, artist, artist_art))

    # insert song info into songs table
    song_present = conn.select_query_with_condition(query_literal='id', table='songs',
                                                    column_to_match='id', condition=song_id)
    if not song_present:
        table_songs_columns = ('id', 'artist_id', 'name', 'length', 'tempo', 'danceability', 'energy', 'loudness',
                               'acousticness', 'instrumentalness', 'liveness', 'valence', 'art', 'preview_url', 'album')
        table_songs_row = (song_id, artist_id, song, song_length, tempo, dance, energy, loudness, acoustic, instrument,
                           liveness, valence, album_art, preview_url, album)
        conn.insert_single_row(table='songs', columns=table_songs_columns, row=table_songs_row)

    # insert artist and genres into artists_genres
    artist_present_in_artists_genres = conn.select_query_with_condition(query_literal='artist_id',
                                                                        table='artists_genres',
                                                                        column_to_match='artist_id',
                                                                        condition=artist_id)
    if not artist_present_in_artists_genres:
        artist_info = sp.artist(artist_id=artist_id)
        genres = artist_info['genres']
        artist_genre_columns = ('artist_id', 'genre')
        for genre in genres:
            artist_genre_values = (artist_id, genre)
            conn.insert_single_row(table='artists_genres', columns=artist_genre_columns,
                                   row=artist_genre_values)

    # insert song info into dynamic and archive tables
    # do not insert popularity, popularity refreshed in scheduled function
    table_dynamic_columns = ('song_id', 'artist_id', 'added_by', 'added_at')
    table_dynamic_row = (song_id, artist_id, added_by, added_at)
    conn.insert_single_row(table='dynamic', columns=table_dynamic_columns, row=table_dynamic_row)

    last_id = conn.select_query(query_literal="MAX(id)", table='archive')
    last_id = last_id[0][0] + 1

    table_archive_columns = ('id', 'song_id', 'artist_id', 'added_by', 'added_at')
    table_archive_row = (last_id, song_id, artist_id, added_by, added_at)
    conn.insert_single_row(table='archive', columns=table_archive_columns, row=table_archive_row)

    if commit_changes:
        conn.commit()
    else:
        conn.rollback()
    conn.terminate()


async def validate_song(track_id):
    song = sp.track(track_id=track_id)
    if int(song['duration_ms']) > 600000:  # catch if song greater than 600k ms (10 min)
        raise OverflowError('Track too long!')


def dyn_playlist_genres(limit: int = None):
    conn = DatabaseConnection()

    sql = """SELECT artists_genres.genre, COUNT(artists_genres.genre) FROM dynamic JOIN artists_genres ON 
    dynamic.artist_id = artists_genres.artist_id GROUP BY artists_genres.genre ORDER BY 
    COUNT(artists_genres.genre) DESC"""
    if limit is not None:
        sql += f" LIMIT {limit}"
    sql += ";"

    result = conn.select_query_raw(sql=sql)
    conn.terminate()
    formatted_result = {x[0]: x[1] for x in result}
    return formatted_result


def playlist_description_update(playlist_id: str, initial_desc: str):
    top_genres = dyn_playlist_genres(limit=10)
    desc = ''
    desc += initial_desc

    if len(top_genres) > 0:
        desc += 'Prominent genres include: '
        for genre, count in top_genres.items():
            desc += f'{genre}, '
        desc += 'and more!'

    description_length = len(desc)
    logger.debug(f'Updated length of playlist {playlist_id} description: {description_length}')

    if len(desc) < 300:  # need to ensure playlist description is 300 characters or fewer
        logger.debug(
            f'Playlist description length within valid range. Updating description of {playlist_id} playlist.')
        sp.playlist_change_details(playlist_id=playlist_id, description=desc)
    else:
        logger.warning(f'Description too long. Not updating {playlist_id} playlist description.')


def expired_track_removal():
    logger.debug("Fetching dynamic playlist info...")

    results = sp.playlist_items(playlist_id='5YQHb5wt9d0hmShWNxjsTs')
    tracks = results['items']
    while results['next']:
        results = sp.next(results)
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
        logger.warning('Preparing to update track popularities and check for expired songs. '
                       'Please do not exit the program during this time.')
        conn = DatabaseConnection()
        for track in track_list:
            # key is the track id
            for key, value in track.items():
                # updates popularity of tracks in dynamic playlist db
                raw_popularity_results = sp.track(track_id=key)
                popularity = raw_popularity_results['popularity']

                # update track popularity
                conn.update_query(table='dynamic', column_to_change='popularity', value=popularity,
                                  column_to_match='song_id', condition=key)

                date_split = value.split('-')
                time_difference = datetime.now() - datetime(year=int(date_split[0]),
                                                            month=int(date_split[1]),
                                                            day=int(date_split[2]))
                # song removal from dynamic playlist
                if time_difference > timedelta(days=14):  # set 2 weeks threshold for track removal
                    sp.playlist_remove_all_occurrences_of_items(playlist_id='5YQHb5wt9d0hmShWNxjsTs',
                                                                items=[key])
                    conn.delete_query(table='dynamic', column_to_match='song_id', condition=key)
                    logger.debug(f'Song {key} removed from playlist')
        if commit_changes:
            conn.commit()
        else:
            conn.rollback()
        conn.terminate()
    logger.info('Track popularities updated and expired songs checked.')


if __name__ == "__main__":
    pass
