from datetime import datetime, timedelta
from math import log
from random import choice

from .database_connection import DatabaseConnection
from .spotify_commands import dyn_playlist_genres
from .vb_utils import get_logger

logger = get_logger(__name__)


def playlist_snapshot_coordinator():
    conn = DatabaseConnection()
    most_recent_time = conn.get_most_recent_historical_update()
    logger.debug(f"Most recent historical update: {most_recent_time}")

    # check to ensure update only occurs every n hours
    if (datetime.utcnow() - most_recent_time) < timedelta(hours=2):
        conn.terminate()
        return

    # only update if there are songs in the dynamic table
    rows = conn.select_query_raw(sql="SELECT COUNT(*) FROM dynamic")
    if rows[0][0] == 0:
        conn.terminate()
        logger.debug("No songs in dynamic table, not updating historical snapshot")
        return

    last_update_tracking = conn.get_most_recent_historical_data()

    logger.debug("Historical data preparing to be updated...")

    pdi = playlist_diversity_index()
    logger.debug(f"Current playlist PDI: {round(pdi, 3)}")

    playlist_len, song_len, tempo, pop, dance, energy, valence = historical_average_features()

    timestamp_now = datetime.utcnow().isoformat()

    novelty = dynamic_playlist_novelty()
    logger.debug(f"Current playlist novelty: {round(novelty, 3)}")

    pkey_sql = """
    SELECT id FROM historical_tracking
    ORDER BY updated_at DESC
    LIMIT 1;
    """
    most_recent_h_track_pkey = conn.select_query_raw(pkey_sql)
    if len(most_recent_h_track_pkey) == 0:
        most_recent_h_track_pkey = 0
    else:
        most_recent_h_track_pkey = most_recent_h_track_pkey[0][0]

    # add historical tracking data
    historical_columns = ('updated_at', 'pdi', 'song_length', 'tempo', 'popularity', 'danceability',
                          'energy', 'valence', 'novelty', 'id')
    historical_values = (timestamp_now, pdi, song_len, tempo, pop, dance,
                         energy, valence, novelty, most_recent_h_track_pkey + 1)
    tracking_check_if_update_needed = []

    # compare existing aggregates and compare with last update
    if len(last_update_tracking) > 0:
        for i in range(1, len(last_update_tracking)):
            tracking_check_if_update_needed.append(
                float(last_update_tracking[i]) == float(historical_values[i])
            )

    if False in tracking_check_if_update_needed:
        logger.debug("Logging historical data now...")
        conn.insert_single_row(table='historical_tracking', columns=historical_columns, row=historical_values)

        # using historical_tracking info as a proxy for whether genres need updating actually
        top_10_genres = dyn_playlist_genres(limit=10)

        # adds total number of songs as a genre
        total_genre_columns = ('updated_at', 'genre', 'count')
        total_genre_values = (timestamp_now, 'total', playlist_len)
        conn.insert_single_row(table='historical_genres', columns=total_genre_columns, row=total_genre_values)

        # add each genre
        for genre, count in top_10_genres.items():
            individual_genre_values = (timestamp_now, genre, count)
            conn.insert_single_row(table='historical_genres', columns=total_genre_columns,
                                   row=individual_genre_values)
    else:
        logger.info("Current playlist data matches last historical update, not logging")

    conn.commit()
    conn.terminate()


def historical_average_features():
    conn = DatabaseConnection()
    sql_query = "COUNT(dynamic.*), AVG(songs.length), AVG(songs.tempo), AVG(dynamic.popularity), " \
                "AVG(songs.danceability), AVG(songs.energy), AVG(songs.valence)"
    dynamic_averages = conn.select_query_with_join(query_literal=sql_query, table='songs',
                                                   join_type='INNER', join_table='dynamic',
                                                   join_condition='songs.id = dynamic.song_id')
    dynamic_averages = dynamic_averages[0]
    conn.terminate()
    return dynamic_averages[0], dynamic_averages[1], dynamic_averages[2], dynamic_averages[3], \
           dynamic_averages[4], dynamic_averages[5], dynamic_averages[6]


def dynamic_playlist_novelty():
    conn = DatabaseConnection()
    sql = """
    SELECT dynamic.song_id, COUNT(archive.song_id) AS count
    FROM dynamic
    INNER JOIN archive ON dynamic.song_id = archive.song_id
    GROUP BY dynamic.song_id
    HAVING COUNT(archive.song_id) = 1;
    """
    unique_songs = conn.select_query_raw(sql=sql)
    existing_songs = conn.select_query(query_literal="song_id", table="dynamic")

    conn.terminate()
    return len(unique_songs) / len(existing_songs)


def playlist_diversity_index():
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
    genre_counts = conn.select_query_raw(sql=sql)
    genre_counts = [x[1] for x in genre_counts]

    conn.terminate()

    if len(genre_counts) > 0:
        pdi_sum = 0
        for genre_count in genre_counts:
            genre_calc = 1 + ((log(1 / genre_count)) / 5)
            pdi_sum += genre_calc
        pdi_sum = pdi_sum / len(genre_counts)

        return pdi_sum
    else:
        return 0


def set_featured_artist():
    conn = DatabaseConnection()
    last_update_sql = """
    SELECT featured_date
    FROM featured_artists
    ORDER BY featured_date DESC
    LIMIT 1;
    """
    last_update = conn.select_query_raw(sql=last_update_sql)

    if len(last_update) == 0:
        last_update = datetime(1970, 1, 1)
    else:
        last_update = last_update[0][0].date()
    date_today = datetime.utcnow().date()

    if date_today != last_update:
        logger.debug('Selecting a new featured artist')
        viable_artists_sql = """
        SELECT artists.id, artists.name, COUNT(s.id)
        FROM artists
                 JOIN artists_songs "as" ON artists.id = "as".artist_id
                 JOIN songs s ON "as".song_id = s.id
                 JOIN archive a on s.id = a.song_id
        GROUP BY artists.id, artists.name
        HAVING COUNT(a.id) >= 3
        ORDER BY COUNT(a.id) DESC;
        """
        viable_artists = conn.select_query_raw(sql=viable_artists_sql)

        if len(viable_artists) == 0:
            logger.debug('No viable artists to set as featured')
            conn.terminate()
            return

        viable_artists = [x[0] for x in viable_artists]
        selected_artist = choice(viable_artists)

        insert_selected_featured_artist_sql = f"""
        INSERT INTO featured_artists (artist_id, featured_date)
        VALUES ('{selected_artist}', NOW()::timestamp)
        """
        conn.raw_query(insert_selected_featured_artist_sql)
        conn.commit()

    conn.terminate()


def refresh_rankings():
    conn = DatabaseConnection()

    conn.raw_query("REFRESH MATERIALIZED VIEW v_rankings_songs;")
    conn.raw_query("REFRESH MATERIALIZED VIEW v_rankings_artists;")
    conn.raw_query("REFRESH MATERIALIZED VIEW v_rankings_genres;")

    conn.commit()
    conn.terminate()
