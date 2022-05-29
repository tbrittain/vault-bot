from datetime import datetime, timedelta
from os import getenv
from random import choice

from dateutil import tz

from .database_connection import DatabaseConnection
from .spotify_commands import sp, get_full_playlist
from .vb_utils import get_logger, array_chunks

logger = get_logger(__name__)
environment = getenv("ENVIRONMENT")

if environment == "dev":
    PARTY_PLAYLIST_ID = getenv("PARTY_PLAYLIST_ID")
    TOP_50_PLAYLIST_ID = getenv("TOP_50_PLAYLIST_ID")
    CHILL_PLAYLIST_ID = getenv("CHILL_PLAYLIST_ID")
    LIGHT_PLAYLIST_ID = getenv("LIGHT_PLAYLIST_ID")
    MOODY_PLAYLIST_ID = getenv("MOODY_PLAYLIST_ID")
    GENRE_PLAYLIST_ID = getenv("GENRE_PLAYLIST_ID")
    PARTY_UNFILTERED_PLAYLIST_ID = getenv("PARTY_UNFILTERED_PLAYLIST_ID")
elif environment == "prod":
    PARTY_PLAYLIST_ID = "6ksVLVljYiEUpjSoDh8z0w"
    TOP_50_PLAYLIST_ID = "1b04aMKreEwigG4ivcZNJm"
    CHILL_PLAYLIST_ID = "65PiacgUM34qS9EtNgbr5r"
    LIGHT_PLAYLIST_ID = "5gsgXQu45m0W06WkmWXQBY"
    MOODY_PLAYLIST_ID = "0jiEtmsU9wRGrAVf7O5YeT"
    GENRE_PLAYLIST_ID = "5MDgnMXhfdmxpsCfHz1ioL"
    PARTY_UNFILTERED_PLAYLIST_ID = "6chmLTkj3RZVBPoen7mCs8"


def selects_playlists_coordinator():
    logger.info("Beginning generation of aggregate playlists")
    conn = DatabaseConnection()

    if not songs_and_artists_exist(conn=conn):
        logger.info("No songs and artists exist in the database, skipping generation of aggregate playlists")
        conn.terminate()
        return

    party_playlist_sql = "SELECT * FROM v_party_playlist;"
    top_50_playlist_sql = "SELECT * FROM v_top_50_playlist;"
    chill_playlist_sql = "SELECT * FROM v_chill_playlist;"
    light_playlist_sql = "SELECT * FROM v_light_playlist;"
    moody_playlist_sql = "SELECT * FROM v_moody_playlist;"
    party_unfiltered_playlist_sql = "SELECT * FROM v_party_unfiltered_playlist;"

    genres = get_viable_genres(conn=conn)
    if len(genres) == 0:
        logger.info("No viable genres found, skipping generation of genre playlist")
    else:
        selected_genre = choice(genres)

        genre_playlist_sql = f"""
        SELECT songs.id
        FROM songs
        JOIN artists_songs ON artists_songs.song_id = songs.id
        JOIN artists ON artists.id = artists_songs.artist_id
        JOIN artists_genres ON artists_genres.artist_id = artists.id
        WHERE artists_genres.genre = '{selected_genre}';
        """

        # formatting time for display in genre playlist description
        from_timezone = tz.gettz('UTC')
        local_timezone = tz.gettz('America/Chicago')

        utc = datetime.utcnow()
        utc = utc.replace(tzinfo=from_timezone)
        cst = utc.astimezone(tz=local_timezone)
        cst = cst + timedelta(hours=12)

        weekday = cst.strftime("%A")
        day = cst.strftime("%B %d")
        time = cst.strftime("%H:%M %Z")

        time_formatted = f'{weekday}, {day} at {time}'

        description = f"A randomly selected genre tracked by VaultBot. " \
                      f"Currently: {str.title(selected_genre)}. Next update: {time_formatted}"

        sp.playlist_change_details(playlist_id=GENRE_PLAYLIST_ID, description=description)
        update_playlist(playlist_id=GENRE_PLAYLIST_ID, playlist_sql=genre_playlist_sql, conn=conn)

        logger.info(f"Updating aggregate playlist Genre (id: {GENRE_PLAYLIST_ID})")
        logger.info(f"New genre: {selected_genre}, selected out of {len(genres)} viable genres")

    logger.info(f"Updating aggregate playlist Party (id: {PARTY_PLAYLIST_ID})")
    update_playlist(playlist_id=PARTY_PLAYLIST_ID, playlist_sql=party_playlist_sql, conn=conn)

    logger.info(f"Updating aggregate playlist Party Unfiltered (id: {PARTY_UNFILTERED_PLAYLIST_ID})")
    update_playlist(playlist_id=PARTY_UNFILTERED_PLAYLIST_ID, playlist_sql=party_unfiltered_playlist_sql, conn=conn)

    logger.info(f"Updating aggregate playlist Top 50 (id: {TOP_50_PLAYLIST_ID})")
    update_playlist(playlist_id=TOP_50_PLAYLIST_ID, playlist_sql=top_50_playlist_sql, conn=conn)

    logger.info(f"Updating aggregate playlist Chill (id: {CHILL_PLAYLIST_ID})")
    update_playlist(playlist_id=CHILL_PLAYLIST_ID, playlist_sql=chill_playlist_sql, conn=conn)

    logger.info(f"Updating aggregate playlist Cheerful (id: {LIGHT_PLAYLIST_ID})")
    update_playlist(playlist_id=LIGHT_PLAYLIST_ID, playlist_sql=light_playlist_sql, conn=conn)

    logger.info(f"Updating aggregate playlist Moody (id: {MOODY_PLAYLIST_ID})")
    update_playlist(playlist_id=MOODY_PLAYLIST_ID, playlist_sql=moody_playlist_sql, conn=conn)

    conn.terminate()
    logger.info("Aggregate playlist generation complete!")


def aggregate_tracks(conn: DatabaseConnection, sql: str) -> list:
    """
    @param conn: DatabaseConnection object
    @param sql: Raw SQL to execute
    @return: List of track IDs
    """
    tracks = conn.select_query_raw(sql=sql)
    return [x[0] for x in tracks]


def update_playlist(conn: DatabaseConnection, playlist_id: str, playlist_sql: str):
    # pull existing tracks
    existing_tracks = get_full_playlist(playlist_id=playlist_id)
    if len(existing_tracks) > 0:
        existing_tracks = [track['track']['id'] for track in existing_tracks]
    else:
        existing_tracks = None

    # compare existing tracks with aggregated tracks from playlist,
    # and remove existing track if not present in aggregate
    aggregated_tracks = aggregate_tracks(sql=playlist_sql, conn=conn)
    tracks_to_remove = []
    if existing_tracks is not None:
        for track_id in existing_tracks:
            if track_id not in aggregated_tracks:
                tracks_to_remove.append(track_id)

    if len(tracks_to_remove) > 0:
        logger.debug(f"Removing {len(tracks_to_remove)} tracks from playlist")
        if len(tracks_to_remove) > 100:
            logger.debug(f"Splitting tracks into chunks of 100")
            chunked_tracks_to_remove = list(array_chunks(tracks_to_remove, 100))
            for chunked_list in chunked_tracks_to_remove:
                logger.debug(f"Removing {len(chunked_list)} tracks")
                sp.playlist_remove_all_occurrences_of_items(playlist_id=playlist_id,
                                                            items=chunked_list)
        else:
            sp.playlist_remove_all_occurrences_of_items(playlist_id=playlist_id,
                                                        items=tracks_to_remove)
    else:
        logger.debug("No tracks require removal from playlist")

    # isolated aggregated tracks to only those that do not already exist in playlist
    # then only add those
    if existing_tracks is not None:
        for track_id in existing_tracks:
            try:
                aggregated_tracks.remove(track_id)
            except ValueError:  # track_id not present in aggregated_tracks
                pass
    # ensure that if no deletion occurred, no tracks are added

    if len(aggregated_tracks) > 0:
        logger.debug(f"Adding {len(aggregated_tracks)} replacement tracks to playlist")
        if len(aggregated_tracks) > 100:  # max 100 songs per request
            logger.debug(f"Splitting tracks into chunks of 100")
            chunked_aggregated_tracks = list(array_chunks(aggregated_tracks, 100))
            for chunked_list in chunked_aggregated_tracks:
                logger.debug(f"Adding {len(chunked_list)} tracks")
                sp.playlist_add_items(playlist_id=playlist_id, items=chunked_list)
        else:
            sp.playlist_add_items(playlist_id=playlist_id, items=aggregated_tracks)
    else:
        logger.debug("Skipping song addition since no songs require removal")


def get_viable_genres(conn: DatabaseConnection) -> list:
    """
    Retrieves genres containing a minimum of 20 songs from 4+ artists
    """
    sql = """
    SELECT artists_genres.genre, COUNT(songs.id)
    FROM songs
    JOIN artists_songs ON artists_songs.song_id = songs.id
    JOIN artists ON artists.id = artists_songs.artist_id
    JOIN artists_genres ON artists_genres.artist_id = artists.id
    GROUP BY artists_genres.genre
    HAVING COUNT(songs.id) >= 20
    AND COUNT(DISTINCT artists.id) >= 4
    ORDER BY COUNT(songs.id) DESC;
    """

    genres = conn.select_query_raw(sql=sql)
    return [x[0] for x in genres]


def songs_and_artists_exist(conn: DatabaseConnection) -> bool:
    """
    Checks that songs and artists tables exist in database
    """
    songs_sql = """SELECT COUNT(*) FROM songs;"""
    num_songs = conn.select_query_raw(sql=songs_sql)
    if num_songs[0][0] == 0:
        return False

    artists_sql = """SELECT COUNT(*) FROM artists;"""
    num_artists = conn.select_query_raw(sql=artists_sql)
    if num_artists[0][0] == 0:
        return False

    return True
