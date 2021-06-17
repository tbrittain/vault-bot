from db import DatabaseConnection
from datetime import datetime, timedelta
import spotify_commands
from vb_utils import logger
import math


iso_format = "%Y-%m-%d %H:%M"


def playlist_snapshot_coordinator():
    conn = DatabaseConnection()
    most_recent_time = conn.get_most_recent_historical_update()

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
        conn.insert_single_row(table='historical_tracking', columns=historical_columns, row=historical_values)

        top_10_genres = get_top_genres()

        # adds total as a genre
        total_genre_columns = ('timestamp', 'genre', 'count')
        total_genre_values = (timestamp_now, 'total', playlist_len)
        conn.insert_single_row(table='historical_genres', columns=total_genre_columns, row=total_genre_values)

        # add each genre
        for genre, count in top_10_genres.items():
            individual_genre_values = (timestamp_now, genre, count)
            conn.insert_single_row(table='historical_genres', columns=total_genre_columns, row=individual_genre_values)
        conn.rollback()
    # terminate connection after (if) data committed
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


# TODO: this will need to be refactored for the normalized db
def get_top_genres():
    genres = spotify_commands.playlist_genres("5YQHb5wt9d0hmShWNxjsTs")
    top_10_pairs = {k: genres[k] for k in list(genres)[:10]}

    return top_10_pairs


# TODO: this will need to be refactored for the normalized db
def playlist_diversity_index():
    dyn_playlist_data = db.dyn_artists_column_retrieve()

    # song[2] = artist ID, song[4] = artist genres
    # sum of occurrences of song[2] = number of songs per artist
    cleaned_data = [{song[2]: song[4]} for song in dyn_playlist_data]

    # need: sum occurrences of each GENRE as the sum of counts of each artist that falls under that genre

    genre_counts = {}
    for artist_occurrence in cleaned_data:
        for genres in artist_occurrence.values():
            for genre in genres:
                if genre:  # gets rid of empty genre if present
                    if genre not in genre_counts:
                        genre_counts[genre] = 1
                    else:
                        genre_counts[genre] += 1

    if len(genre_counts) > 0:
        pdi_sum = 0
        for genre_count in genre_counts.values():
            genre_calc = 1 + ((math.log(1 / genre_count)) / 5)
            pdi_sum += genre_calc
        pdi_sum = pdi_sum / len(genre_counts)

        return pdi_sum
    else:
        return 0


if __name__ == "__main__":
    pass
