from os import getenv
from random import choice

from .database_connection import DatabaseConnection
from .spotify_commands import sp, get_spotify_playlist_songs
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
    ENERGY_PLAYLIST_ID = getenv("ENERGY_PLAYLIST_ID")
    SHIFT_PLAYLIST_ID = getenv("SHIFT_PLAYLIST_ID")
elif environment == "prod":
    PARTY_PLAYLIST_ID = "6ksVLVljYiEUpjSoDh8z0w"
    TOP_50_PLAYLIST_ID = "1b04aMKreEwigG4ivcZNJm"
    CHILL_PLAYLIST_ID = "65PiacgUM34qS9EtNgbr5r"
    LIGHT_PLAYLIST_ID = "5gsgXQu45m0W06WkmWXQBY"
    MOODY_PLAYLIST_ID = "0jiEtmsU9wRGrAVf7O5YeT"
    GENRE_PLAYLIST_ID = "5MDgnMXhfdmxpsCfHz1ioL"
    PARTY_UNFILTERED_PLAYLIST_ID = "6chmLTkj3RZVBPoen7mCs8"
    ENERGY_PLAYLIST_ID = "6tvj9N8XItXNAw5t9D2e86"
    SHIFT_PLAYLIST_ID = "4Se66d3h8equYrj7W6msdT"


def selects_playlists_coordinator():
    logger.info("Beginning generation of aggregate playlists")
    conn = DatabaseConnection()

    if not songs_and_artists_exist(conn=conn):
        logger.info("No songs and artists exist in the database, skipping generation of aggregate playlists")
        conn.terminate()
        return

    top_50_playlist_sql = """
    SELECT song_id AS id, num_times_added AS count
    FROM v_rankings_songs
    ORDER BY rank
    LIMIT 50
    """

    party_playlist_sql = "SELECT * FROM v_party_playlist;"
    chill_playlist_sql = "SELECT * FROM v_chill_playlist;"
    light_playlist_sql = "SELECT * FROM v_light_playlist;"
    moody_playlist_sql = "SELECT * FROM v_moody_playlist;"
    party_unfiltered_playlist_sql = "SELECT * FROM v_party_unfiltered_playlist;"
    energy_playlist_sql = "SELECT * FROM v_energy_playlist;"

    # region Genre playlist
    genres = get_viable_genres(conn=conn)
    if len(genres) == 0:
        logger.info("No viable genres found, skipping generation of genre playlist")
    else:
        selected_genre = choice(genres)

        genre_playlist_sql = f"""
        SELECT s.id
        FROM v_songs s
                 JOIN artists_songs "as" ON "as".song_id = s.id
                 JOIN artists a ON a.id = "as".artist_id
                 JOIN artists_genres ag ON ag.artist_id = a.id
                 JOIN genres g on g.id = ag.genre_id
        WHERE g.id = '{selected_genre[0]}'
          AND s.is_blacklisted = FALSE
          AND a.is_blacklisted = FALSE
        ORDER BY RANDOM()
        LIMIT 100;
        """

        description = f"A randomly selected genre tracked by VaultBot. " \
                      f"Currently: {str.title(selected_genre[1])}."

        sp.playlist_change_details(playlist_id=GENRE_PLAYLIST_ID, description=description)
        update_playlist(playlist_id=GENRE_PLAYLIST_ID, playlist_sql=genre_playlist_sql, conn=conn)

        logger.info(f"Updating aggregate playlist Genre (id: {GENRE_PLAYLIST_ID})")
        logger.info(f"New genre: {selected_genre[1]}, selected out of {len(genres)} viable genres")
    # endregion

    # region Shift playlist
    viable_characteristics = get_viable_characteristics(conn=conn)

    first_characteristic = choice(viable_characteristics)
    viable_characteristics.remove(first_characteristic)
    second_characteristic = choice(viable_characteristics)

    ranges = []
    for characteristic in [first_characteristic, second_characteristic]:
        summary_statistics = get_summary_statistics(conn=conn, characteristic=characteristic)

        quartile = choice(["Q1", "Q2", "Q3", "Q4"])
        if quartile == "Q1":
            ranges.append([summary_statistics["minimum"], summary_statistics["Q1"]])
        elif quartile == "Q2":
            ranges.append([summary_statistics["Q1"], summary_statistics["mean"]])
        elif quartile == "Q3":
            ranges.append([summary_statistics["mean"], summary_statistics["Q3"]])
        elif quartile == "Q4":
            ranges.append([summary_statistics["Q3"], summary_statistics["maximum"]])

    shift_playlist_sql = f"""
    SELECT MIN(s.id)
    FROM v_songs s
             JOIN artists_songs "as" ON "as".song_id = s.id
             JOIN artists a ON a.id = "as".artist_id
             JOIN artists_genres ag ON ag.artist_id = a.id
             JOIN genres g on g.id = ag.genre_id
    WHERE s.{first_characteristic} BETWEEN {ranges[0][0]} AND {ranges[0][1]}
        AND s.{second_characteristic} BETWEEN {ranges[1][0]} AND {ranges[1][1]}
        AND s.is_blacklisted = FALSE
        AND a.is_blacklisted = FALSE
    GROUP BY s.name
    ORDER BY RANDOM()
    LIMIT 100;
    """

    first_characteristic_lower = f"{ranges[0][0] * 100:.1f}%"
    first_characteristic_upper = f"{ranges[0][1] * 100:.1f}%"
    second_characteristic_lower = f"{ranges[1][0] * 100:.1f}%"
    second_characteristic_upper = f"{ranges[1][1] * 100:.1f}%"
    if first_characteristic == "tempo":
        first_characteristic_lower = f"{ranges[0][0]:.0f} BPM"
        first_characteristic_upper = f"{ranges[0][1]:.0f} BPM"
    elif second_characteristic == "tempo":
        second_characteristic_lower = f"{ranges[1][0]:.0f} BPM"
        second_characteristic_upper = f"{ranges[1][1]:.0f} BPM"

    description = f"100 randomly selected songs tracked by VaultBot that have a {first_characteristic} " \
                  f"between {first_characteristic_lower} and {first_characteristic_upper} and a " \
                  f"{second_characteristic} between {second_characteristic_lower} and {second_characteristic_upper}."

    sp.playlist_change_details(playlist_id=SHIFT_PLAYLIST_ID, description=description)
    update_playlist(playlist_id=SHIFT_PLAYLIST_ID, playlist_sql=shift_playlist_sql, conn=conn)
    # endregion

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

    logger.info(f"Updating aggregate playlist Energy (id: {ENERGY_PLAYLIST_ID})")
    update_playlist(playlist_id=ENERGY_PLAYLIST_ID, playlist_sql=energy_playlist_sql, conn=conn)

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
    existing_tracks = get_spotify_playlist_songs(playlist_id=playlist_id)
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
    SELECT g.id, g.name, COUNT(s.id)
    FROM songs s
             JOIN artists_songs "as" ON "as".song_id = s.id
             JOIN artists a ON a.id = "as".artist_id
             JOIN artists_genres ag ON ag.artist_id = a.id
             JOIN genres g on ag.genre_id = g.id
    GROUP BY g.id, g.name
    HAVING COUNT(s.id) >= 20
       AND COUNT(DISTINCT a.id) >= 4
    ORDER BY COUNT(s.id) DESC;
    """

    return conn.select_query_raw(sql=sql)


def get_viable_characteristics(conn: DatabaseConnection) -> list:
    """
    Gets a list of song characteristics that are tracked in the songs table
    """
    sql = """
    SELECT
    column_name
    FROM
        information_schema.columns
    WHERE
        table_name = 'songs'
        AND data_type = 'numeric'
        AND column_name NOT IN ('length', 'loudness')
    """

    characteristics = conn.select_query_raw(sql=sql)
    return [x[0] for x in characteristics]


def get_summary_statistics(conn: DatabaseConnection, characteristic: str) -> dict:
    """
    Gets a summary of statistics a song characteristic
    """
    sql = f"""
    WITH RECURSIVE
    summary_stats AS
    (
     SELECT 
      ROUND(AVG({characteristic}), 2) AS mean,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY {characteristic}) AS median,
      MIN({characteristic}) AS min,
      MAX({characteristic}) AS max,
      MAX({characteristic}) - MIN({characteristic}) AS range,
      ROUND(STDDEV({characteristic}), 2) AS standard_deviation,
      ROUND(VARIANCE({characteristic}), 2) AS variance,
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY {characteristic}) AS q1,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY {characteristic}) AS q3
       FROM songs
    ),row_summary_stats AS
    (
    SELECT 
     1 AS sno, 
     'mean' AS statistic, 
     mean AS value 
      FROM summary_stats
    UNION
    SELECT 
     2, 
     'median', 
     median 
      FROM summary_stats
    UNION
    SELECT 
     3, 
     'minimum', 
     min 
      FROM summary_stats
    UNION
    SELECT 
     4, 
     'maximum', 
     max 
      FROM summary_stats
    UNION
    SELECT 
     5, 
     'range', 
     range 
      FROM summary_stats
    UNION
    SELECT 
     6, 
     'standard deviation', 
     standard_deviation 
      FROM summary_stats
    UNION
    SELECT 
     7, 
     'variance', 
     variance 
      FROM summary_stats
    UNION
    SELECT 
     9, 
     'Q1', 
     q1 
      FROM summary_stats
    UNION
    SELECT 
     10, 
     'Q3', 
     q3 
      FROM summary_stats
    UNION
    SELECT 
     11, 
     'IQR', 
     (q3 - q1) 
      FROM summary_stats
    UNION
    SELECT 
     12, 
     'skewness', 
     ROUND(3 * (mean - median)::NUMERIC / standard_deviation, 2) AS skewness 
      FROM summary_stats
    )SELECT * 
     FROM row_summary_stats
      ORDER BY sno;
    """

    summary_stats = conn.select_query_raw(sql=sql)
    return {x[1]: x[2] for x in summary_stats}


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
