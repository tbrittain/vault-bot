import random
from .db import DatabaseConnection
from .spotify_commands import dyn_playlist_genres
from .vb_utils import logger
from .config import environment
from datetime import datetime, timedelta, date
import math

iso_format = "%Y-%m-%d %H:%M"

if environment == "dev":
    commit_changes = False
elif environment == "prod" or environment == "prod_local":
    commit_changes = True


def playlist_snapshot_coordinator():
    conn = DatabaseConnection()
    most_recent_time = conn.get_most_recent_historical_update()
    logger.debug(f"Most recent historical update: {most_recent_time}")
    last_update_genres, last_update_tracking = conn.get_most_recent_historical_data()

    # check to ensure update only occurs every n hours
    if (datetime.now() - most_recent_time) >= timedelta(hours=2):
        logger.debug("Historical data preparing to be updated...")

        pdi = playlist_diversity_index()
        logger.debug(f"Current playlist PDI: {round(pdi, 3)}")

        playlist_len, song_len, tempo, pop, dance, energy, valence = historical_average_features()

        now = datetime.now()
        timestamp_now = now.strftime(iso_format)

        novelty = dynamic_playlist_novelty()
        logger.debug(f"Current playlist novelty: {round(novelty, 3)}")

        # add historical tracking data
        historical_columns = ('updated_at', 'pdi', 'popularity', 'danceability', 'energy', 'valence', 'song_length',
                              'tempo', 'novelty')
        historical_values = (timestamp_now, pdi, song_len, tempo, pop, dance, energy, valence, novelty)
        tracking_check_if_update_needed = []

        # TODO: need to go back through existing historical_tracking and historical_genres data and remove
        # redundant, duplicated data
        for i in range(1, len(last_update_tracking)):
            tracking_check_if_update_needed.append(
                float(last_update_tracking[i]) == float(historical_values[i])
            )

        if False in tracking_check_if_update_needed:
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
        if commit_changes:
            conn.commit()
        else:
            conn.rollback()
    conn.terminate()


# this function should also update the number of tracks since that data will be easily available to it
# idea: pull dynamic playlist data, put rows into pandas df, then calculate averages
def historical_average_features():
    conn = DatabaseConnection()
    sql_query = "COUNT(dynamic.*), AVG(songs.length), AVG(songs.tempo), AVG(dynamic.popularity), " \
                "AVG(songs.danceability), AVG(songs.energy), AVG(songs.valence)"
    dynamic_averages = conn.select_query_with_join(query_literal=sql_query, table='songs',
                                                   join_type='INNER', join_table='dynamic',
                                                   join_condition='songs.id = dynamic.song_id')
    dynamic_averages = dynamic_averages[0]
    conn.terminate()
    return dynamic_averages[0], dynamic_averages[1], dynamic_averages[2], dynamic_averages[3], dynamic_averages[4], \
           dynamic_averages[5], dynamic_averages[6]


def dynamic_playlist_novelty():
    conn = DatabaseConnection()
    sql = """SELECT dynamic.song_id, COUNT(archive.song_id) AS count FROM dynamic INNER JOIN archive ON 
    dynamic.song_id = archive.song_id GROUP BY dynamic.song_id HAVING COUNT(archive.song_id) = 1; """
    unique_songs = conn.select_query_raw(sql=sql)
    existing_songs = conn.select_query(query_literal="song_id", table="dynamic")

    conn.terminate()
    return len(unique_songs) / len(existing_songs)


def playlist_diversity_index():
    conn = DatabaseConnection()
    sql = """SELECT artists_genres.genre, COUNT(artists_genres.genre) 
    FROM artists_genres INNER JOIN dynamic ON artists_genres.artist_id = 
    dynamic.artist_id GROUP BY artists_genres.genre ORDER BY 
    COUNT(artists_genres.genre) DESC;"""
    genre_counts = conn.select_query_raw(sql=sql)
    genre_counts = [x[1] for x in genre_counts]

    conn.terminate()

    if len(genre_counts) > 0:
        pdi_sum = 0
        for genre_count in genre_counts:
            genre_calc = 1 + ((math.log(1 / genre_count)) / 5)
            pdi_sum += genre_calc
        pdi_sum = pdi_sum / len(genre_counts)

        return pdi_sum
    else:
        return 0


def featured_artist():
    conn = DatabaseConnection()
    last_update_sql = """SELECT featured FROM artists WHERE featured IS NOT NULL ORDER BY featured DESC LIMIT 1;"""
    last_update = conn.select_query_raw(sql=last_update_sql)
    last_update = last_update[0][0].date()
    date_today = datetime.utcnow().date()
    if date_today != last_update:
        logger.debug('Selecting a new featured artist')
        viable_artists_sql = """SELECT artists.id, artists.name, COUNT(songs.id) FROM artists JOIN songs
        ON artists.id = songs.artist_id GROUP BY artists.id, artists.name HAVING COUNT(songs.id) >= 3
        ORDER BY COUNT(songs.id) DESC;"""
        viable_artists = conn.select_query_raw(sql=viable_artists_sql)
        viable_artists = [x[0] for x in viable_artists]
        selected_artist = random.choice(viable_artists)

        update_selected_artist_sql = f"""UPDATE artists SET featured = NOW()::timestamp 
        WHERE id = '{selected_artist}';"""
        conn.update_query_raw(sql=update_selected_artist_sql)
        if environment == 'dev':
            conn.rollback()
        else:
            conn.commit()
    conn.terminate()


if __name__ == "__main__":
    featured_artist()
