import json
from datetime import datetime, timedelta
from os import getenv, path
from random import choice
from typing import List
from uuid import uuid4

import discord.ext.commands
import psycopg2
import spotipy
from spotipy import SpotifyException
from spotipy.cache_handler import CacheHandler
from spotipy.oauth2 import SpotifyOAuth
from thefuzz import fuzz

from .database_connection import DatabaseConnection, access_secret_version
from .discord_responses import AFFIRMATIVES
from .vb_utils import get_logger

logger = get_logger(__name__)
base_dir = path.dirname(path.dirname(path.abspath(__file__)))

environment = getenv("ENVIRONMENT")
if environment == "dev":
    CLIENT_ID = getenv("SPOTIFY_CLIENT_ID")
    CLIENT_SECRET = getenv("SPOTIFY_CLIENT_SECRET")
    REDIRECT_URI = getenv("SPOTIFY_REDIRECT_URI")
    TOKEN = getenv("SPOTIFY_CACHE")

    DYNAMIC_PLAYLIST_ID = getenv("DYNAMIC_PLAYLIST_ID")

    if None in [CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, TOKEN]:
        logger.fatal("Missing Spotify credentials", exc_info=True)
        exit(1)

    if None in [DYNAMIC_PLAYLIST_ID]:
        logger.fatal("Missing Dynamic playlist ID", exc_info=True)
        exit(1)

elif environment == "prod":
    project_id = getenv("GOOGLE_CLOUD_PROJECT_ID")
    if project_id is None:
        logger.fatal("No Google Cloud project ID found. Please set the GOOGLE_CLOUD_PROJECT_ID environment "
                     "variable.", exc_info=True)
        exit(1)

    CLIENT_ID = access_secret_version(secret_id="vb-spotify-client-id",
                                      project_id=project_id)
    CLIENT_SECRET = access_secret_version(secret_id="vb-spotify-client-secret",
                                          project_id=project_id)
    REDIRECT_URI = access_secret_version(secret_id="db-spotify-redirect-uri",
                                         project_id=project_id)
    TOKEN = access_secret_version('vb-spotify-cache', project_id)

    DYNAMIC_PLAYLIST_ID = '5YQHb5wt9d0hmShWNxjsTs'
else:
    logger.fatal("No environment variable set. Please set the ENVIRONMENT environment variable.", exc_info=True)
    exit(1)


class MemoryCacheHandler(CacheHandler):
    def __init__(self, token_info=None):
        """
        Parameters:
            * token_info: The token info to store in memory. Can be None.
        """
        self.token_info = token_info

    def get_cached_token(self):
        return self.token_info

    def save_token_to_cache(self, token_info):
        logger.debug('Rewriting token info to memory')
        self.token_info = token_info
        if environment == "dev":
            with open('token.json', 'w') as f:
                json.dump(token_info, f)


cache_handler = MemoryCacheHandler(token_info=json.loads(TOKEN))

SPOTIFY_SCOPE = "playlist-modify-public user-library-read playlist-modify-private"
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI,
                                               scope=SPOTIFY_SCOPE,
                                               cache_handler=cache_handler))
emoji_responses = AFFIRMATIVES


def get_spotify_playlist_songs(playlist_id: str) -> list:
    """
    Retrieves all results from playlist by parsing through paginated results
    @param playlist_id: Spotify ID of the playlist
    """
    results = sp.playlist_items(playlist_id=playlist_id)
    if results['total'] > 0:
        tracks = results['items']
        while results['next']:
            results = sp.next(results)
            tracks.extend(results['items'])
        return tracks
    else:
        return []


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


def get_songs_in_playlist():
    conn = DatabaseConnection()
    song_ids = conn.select_query(query_literal="song_id", table="dynamic")
    song_ids = [x[0] for x in song_ids]
    conn.terminate()
    return song_ids


async def get_song_id_from_user_input(song_input) -> str:
    song = sp.track(track_id=song_input)
    logger.debug(f'Converted input {song_input} to {song["id"]}')

    return song['id']


def get_song_details(song_id, user):
    s = sp.track(track_id=song_id)

    artists_details = []
    for artist in s['artists']:
        artist_details = {
            'name': artist['name'],
            'id': artist['id'],
        }

        # get artist art, not always present
        try:
            artist_info = sp.artist(artist_id=artist['id'])
            artist_art = artist_info['images'][0]['url']
            artist_details['artist_art'] = artist_art
        except IndexError:
            pass

        artists_details.append(artist_details)

    details = {'name': (s['name']),
               'album': (s['album']['name']),
               'added_by': user,
               'added_at': str(datetime.now()),
               'song_length': (float(s['duration_ms']) / 60000),
               'album_art': s['album']['images'][0]['url'],
               'artists': artists_details,
               }

    # add preview url if present
    if s['preview_url']:
        details['preview_url'] = s['preview_url']

    # get audio features of song
    audio_analysis = sp.audio_features(s['id'])[0]

    details['tempo'] = (audio_analysis['tempo'])
    details['danceability'] = (audio_analysis['danceability'])
    details['energy'] = (audio_analysis['energy'])
    details['loudness'] = (audio_analysis['loudness'])
    details['acousticness'] = (audio_analysis['acousticness'])
    details['instrumentalness'] = (audio_analysis['instrumentalness'])
    details['liveness'] = (audio_analysis['liveness'])
    details['valence'] = (audio_analysis['valence'])

    return details


def add_song_to_db(song_id, user):
    conn = DatabaseConnection()

    details = get_song_details(song_id=song_id, user=user)

    song_name = details['name']
    album = details['album']
    added_by = details['added_by']
    added_at = details['added_at']
    song_length = details['song_length']
    tempo = details['tempo']
    dance = details['danceability']
    energy = details['energy']
    loudness = details['loudness']
    acoustic = details['acousticness']
    instrument = details['instrumentalness']
    liveness = details['liveness']
    valence = details['valence']
    album_art = details['album_art']
    preview_url = None

    if 'preview_url' in list(details.keys()):
        preview_url = details['preview_url']

    # artists-related info
    for artist in details['artists']:
        artist_name = artist['name']
        artist_id = artist['id']
        artist_art = None
        if 'artist_art' in list(artist.keys()):
            artist_art = artist['artist_art']

        existing_artist = conn.select_query_with_condition(query_literal='id', table='artists',
                                                           column_to_match='id', condition=artist_id)

        artist_present = len(existing_artist) > 0
        columns = ('id', 'name', 'art') if artist_art else ('id', 'name')
        row = (artist_id, artist_name, artist_art) if artist_art else (artist_id, artist_name)
        if not artist_present:
            conn.insert_single_row(table='artists', columns=columns, row=row)
        elif artist_art is not None:
            conn.update_query(column_to_change="art", column_to_match="id", condition=artist_id,
                              value=artist_art, table="artists")

    # song-related info
    existing_song = conn.select_query_with_condition(query_literal='id', table='songs',
                                                     column_to_match='id', condition=song_id)

    song_present = len(existing_song) > 0
    if not song_present:
        table_songs_columns = ('id', 'name', 'length', 'tempo', 'danceability', 'energy', 'loudness',
                               'acousticness', 'instrumentalness', 'liveness', 'valence', 'art', 'preview_url', 'album')
        table_songs_row = (song_id, song_name, song_length, tempo, dance, energy, loudness, acoustic, instrument,
                           liveness, valence, album_art, preview_url, album)
        conn.insert_single_row(table='songs', columns=table_songs_columns, row=table_songs_row)
        # by default, insert the song as a reference to itself in the lookup
        conn.insert_single_row(table='duplicate_song_lookup', columns=('source_song_id', 'target_song_id'),
                               row=(song_id, song_id))

    else:
        conn.update_query(column_to_change="art", column_to_match="id",
                          condition=song_id, value=album_art, table="songs")
        if preview_url is not None:
            conn.update_query(column_to_change="preview_url", column_to_match="id",
                              condition=song_id, value=preview_url, table="songs")
        else:
            conn.update_query_raw(f"""
            UPDATE songs SET preview_url = NULL WHERE id = '{song_id}'
            """)

    for artist in details['artists']:
        artist_id = artist['id']

        spotify_genres = sp.artist(artist_id=artist_id)["genres"]
        if len(spotify_genres) > 0:
            existing_artist_genres_sql = f"""
            SELECT g.name
            FROM genres g
                     JOIN artists_genres ag on g.id = ag.genre_id
            WHERE ag.artist_id = '{artist_id}'
            """
            existing_artist_genres = [x[0] for x in
                                      conn.select_query_raw(sql=existing_artist_genres_sql)]

            for genre in spotify_genres:
                existing_genre = conn.select_query_with_condition(query_literal='id', table='genres',
                                                                  column_to_match='name', condition=genre)

                if not existing_genre:
                    genre_id = conn.insert_single_row(table='genres', columns=('id', 'name'),
                                                      row=(str(uuid4()), genre), return_column_name="id")
                else:
                    genre_id = existing_genre[0]

                if genre not in existing_artist_genres:
                    conn.insert_single_row(table='artists_genres', columns=('artist_id', 'genre_id'),
                                           row=(artist_id, genre_id))

        existing_artist_songs = [x[0] for x in
                                 conn.select_query_with_condition(query_literal='artist_id', table='artists_songs',
                                                                  column_to_match='song_id', condition=song_id)]
        if artist_id not in existing_artist_songs:
            conn.insert_single_row(table='artists_songs', columns=('artist_id', 'song_id'),
                                   row=(artist_id, song_id))

    # insert song info into dynamic and archive tables
    # do not insert popularity, as popularity is refreshed in scheduled function
    user_handle = f"{added_by.display_name}#{added_by.discriminator}"

    table_dynamic_columns = ('song_id', 'added_by', 'added_at')
    table_dynamic_row = (song_id, user_handle, added_at)
    conn.insert_single_row(table='dynamic', columns=table_dynamic_columns, row=table_dynamic_row)

    table_archive_columns = ('song_id', 'added_by', 'added_at')
    table_archive_row = (song_id, user_handle, added_at)
    conn.insert_single_row(table='archive', columns=table_archive_columns, row=table_archive_row)

    conn.commit()
    conn.terminate()


def remove_song_from_db(song_id):
    conn = DatabaseConnection()

    conn.delete_query(table='dynamic', column_to_match='song_id', condition=song_id)
    logger.debug(f'Song {song_id} removed from dynamic table')

    conn.commit()
    conn.terminate()


async def add_song_to_playlist(song_id):
    sp.playlist_add_items(DYNAMIC_PLAYLIST_ID, [song_id, ])


def remove_song_from_playlist(song_id: str):
    sp.playlist_remove_all_occurrences_of_items(DYNAMIC_PLAYLIST_ID, [song_id, ])


def remove_songs_from_playlist(song_ids: list[str]):
    sp.playlist_remove_all_occurrences_of_items(playlist_id=DYNAMIC_PLAYLIST_ID,
                                                items=song_ids)


def balance_duplicate_song_lookup(song_id: str):
    def mark_source_songs_as_duplicates(_conn: DatabaseConnection, target_song_id: str, source_song_ids: List[str]):
        formatted_source_song_ids = ", ".join(source_song_ids)

        sql = f"""
        UPDATE duplicate_song_lookup
        SET target_song_id = '{target_song_id}'
        WHERE source_song_id = ANY(
        '{{{formatted_source_song_ids}}}'
        )
        """
        _conn.raw_query(sql)
        _conn.commit()

    conn = DatabaseConnection()
    potential_duplicates = conn.select_query_raw(f"""
        SELECT s.id,
               s.name,
               s.length,
               s.tempo,
               s.album,
               s.preview_url,
               s.acousticness,
               s.danceability,
               s.liveness,
               s.instrumentalness,
               s.valence
        FROM songs s
                 JOIN artists_songs "as" on s.id = "as".song_id
        WHERE "as".artist_id = ANY (SELECT as2.artist_id
                                    FROM artists_songs as2
                                    WHERE as2.song_id = '{song_id}')
        GROUP BY s.id;
    """)

    # meaning we only got our original song back
    if len(potential_duplicates) == 1:
        conn.terminate()
        return

    initial = next(x for x in potential_duplicates if x[0] == song_id)
    initial_is_remix = initial[1].lower().__contains__('remix')

    rest = [x for x in potential_duplicates if x[0] != song_id]

    filtered = list(filter(lambda x: abs(x[2] - initial[2]) < 0.17 and
                                     abs(x[3] - initial[3]) < 5, rest))

    if len(filtered) == 0:
        conn.terminate()
        return

    filtered = [x for x in filtered if x[1].lower().__contains__('remix')] if initial_is_remix \
        else [x for x in filtered if not x[1].lower().__contains__('remix')]

    if len(filtered) == 0:
        conn.terminate()
        return

    # then, out of those results, filter those down to those with significant name similarity
    filtered = list(filter(lambda x: fuzz.ratio(x[1], initial[1]) > 90, filtered))

    if len(filtered) == 0:
        conn.terminate()
        return

    # then filter down to results that share significant similarity with regard to song characteristics
    filtered = list(filter(lambda x: abs(x[6] - initial[6]) < 0.2 and
                                     abs(x[7] - initial[7]) < 0.1 and
                                     abs(x[8] - initial[8]) < 0.1 and
                                     abs(x[9] - initial[9]) < 0.1 and
                                     abs(x[10] - initial[10]) < 0.2, filtered))

    if len(filtered) == 0:
        conn.terminate()
        return

    # once we are at this point, then we can assume that all the results left represent the same songs.
    # then (if more than one result) we need to select which song is the one we want to be that target
    # song for all of these duplicate results
    # priority: 1. the result(s) that have a song preview
    combined = filtered
    combined.append(initial)
    all_combined_song_ids = [x[0] for x in combined]
    filtered = list(filter(lambda x: x[5] is not None, combined))
    if len(filtered) == 1:
        mark_source_songs_as_duplicates(conn, filtered[0][0], all_combined_song_ids)
        conn.terminate()
        return
    elif len(filtered) == 0:
        # reset filtered, since none of the potential target songs will have a song preview
        filtered = combined
    # the else case above would indicate that there are multiple songs with song previews,
    # so we retain the result saved in the filtered variable

    # 2. if in different albums, the result that has the most songs in that same album
    # (which will require another trip to the database)
    song_id_album_count = {}
    for song_row in filtered:
        escaped_album_name = song_row[4].replace("'", "''")

        album_songs = conn.select_query_raw(f"""
        SELECT s.id, s.name, s.album
        FROM songs s
                 JOIN artists_songs "as" on s.id = "as".song_id
        WHERE "as".artist_id = ANY (SELECT as2.artist_id
                                    FROM artists_songs as2
                                    WHERE as2.song_id = '{song_row[0]}')
        AND s.album = '{escaped_album_name}'
        GROUP BY s.id;
        """)

        album_songs = list(filter(lambda x: x[0] not in all_combined_song_ids, album_songs))
        song_id_album_count[song_row[0]] = len(album_songs)

    # grab the first element returned for max_album_count_song_id, regardless of whether
    # there are more than 1, since if we get to this point, the songs that are left are
    # by all accounts identical in all the ways that we care about
    max_album_count_song_id = max(song_id_album_count, key=lambda x: song_id_album_count[x])
    mark_source_songs_as_duplicates(conn, max_album_count_song_id, all_combined_song_ids)
    conn.terminate()


async def validate_song_and_add(ctx: discord.ext.commands.Context, song_url_or_id):
    try:
        converted_song_id = await get_song_id_from_user_input(song_url_or_id)
    except SpotifyException:
        await ctx.channel.send(f"Please send me a valid Spotify link and I will try"
                               f"to add it to the playlists, {ctx.author.mention}!")
        return

    try:
        await validate_song(converted_song_id)
    except OverflowError:
        await ctx.channel.send(f"Cannot add songs longer than 10 minutes "
                               f"to playlist, {ctx.author.mention}!")
        return
    except FileExistsError:
        await ctx.channel.send(f"Track already exists in dynamic playlist, "
                               f"{ctx.author.mention}! I'm not gonna re-add it!")
        return

    unexpected_error_response = "An unexpected error occurred and the song was not " \
                                "added to the playlists. Please try again."

    try:
        await add_song_to_playlist(converted_song_id)
    except SpotifyException:
        await ctx.channel.send(unexpected_error_response)
        return

    try:
        add_song_to_db(converted_song_id, ctx.author)
    except psycopg2.Error:
        remove_song_from_playlist(converted_song_id)
        await ctx.channel.send(unexpected_error_response)
        return

    balance_duplicate_song_lookup(converted_song_id)

    logger.debug(f'Song of ID {converted_song_id} added to playlists '
                 f'by {ctx.author} via private message')
    await ctx.channel.send(
        f'Track has been added to the community playlists! {choice(emoji_responses)}')


async def validate_song(song_id):
    song = sp.track(track_id=song_id)
    if int(song['duration_ms']) > 600000:  # catch if song greater than 600k ms (10 min)
        raise OverflowError('Track too long!')

    existing_songs = get_songs_in_playlist()
    if song_id in existing_songs:
        logger.debug(f"{song_id} already exists in dynamic playlist, not adding")
        raise FileExistsError('Song already present in Dyn playlist! Not adding duplicate ID.')


def dyn_playlist_genres(limit: int = None):
    conn = DatabaseConnection()

    sql = """
    SELECT g.name, COUNT(g.name)
    FROM dynamic d
        JOIN songs s ON d.song_id = s.id
        JOIN artists_songs ON s.id = artists_songs.song_id
        JOIN artists_genres ON artists_songs.artist_id = artists_genres.artist_id
        JOIN genres g on artists_genres.genre_id = g.id
    GROUP BY g.name
    ORDER BY COUNT(g.name) DESC
    """
    if limit is not None:
        sql += f" LIMIT {limit}"
    sql += ";"

    result = conn.select_query_raw(sql=sql)
    conn.terminate()
    formatted_result = {x[0]: x[1] for x in result}
    return formatted_result


def update_playlist_description(playlist_id: str, initial_desc: str):
    top_genres = dyn_playlist_genres(limit=10)
    desc = initial_desc

    end_desc = 'and more!'

    if len(top_genres) > 0:
        desc += ' Prominent genres include: '
        for genre, count in top_genres.items():
            formatted_genre = f'{genre}, '
            if len(desc) + len(formatted_genre) > 300 - len(end_desc):
                break
            desc += formatted_genre
        desc += end_desc

    description_length = len(desc)
    logger.debug(f'Updated length of playlist {playlist_id} description: {description_length}')
    sp.playlist_change_details(playlist_id=playlist_id, description=desc)


def array_chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


def expired_track_removal():
    logger.debug("Fetching dynamic playlist info...")

    results = sp.playlist_items(playlist_id=DYNAMIC_PLAYLIST_ID)
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

        tracks_to_remove = []
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
                    tracks_to_remove.append(key)
                    conn.delete_query(table='dynamic', column_to_match='song_id', condition=key)
                    logger.debug(f'Song {key} removed from database')

        if len(tracks_to_remove) > 0:
            logger.debug(f"Preparing to remove {len(tracks_to_remove)} from dynamic playlist")
            if len(tracks_to_remove) > 100:
                logger.debug(f"Splitting tracks into chunks of 100")
                chunked_tracks_to_remove = list(array_chunks(tracks_to_remove, 100))
                for chunked_list in chunked_tracks_to_remove:
                    logger.debug(f"Removing {len(chunked_list)} tracks from dynamic")
                    remove_songs_from_playlist(chunked_list)

            else:
                logger.debug(f"Removing {len(tracks_to_remove)} tracks from dynamic")
                remove_songs_from_playlist(tracks_to_remove)

        # TODO: this should be combined with the playlist snapshot functionality from
        # Spotify to restore to the savepoint if there is some issue removing from the database
        logger.debug(f"Committing changes to database")
        conn.commit()
        conn.terminate()
    logger.info('Track popularities updated and expired songs checked.')


def force_refresh_cache():
    cache_handler.get_cached_token()
