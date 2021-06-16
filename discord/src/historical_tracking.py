from db import DatabaseConnection, dyn_arc_song_retrieve
from datetime import datetime, timedelta
import spotify_commands
import pandas as pd
from vb_utils import logger, color_text, TerminalColors
import math

# store format for standardization
iso_format = "%Y-%m-%d %H:%M"


def playlist_snapshot_coordinator():
    conn = DatabaseConnection()
    most_recent_time = conn.get_most_recent_historical_update()

    # check to ensure update only occurs every n hours
    if (datetime.now() - most_recent_time) >= timedelta(hours=2):
        logger.debug("Historical data preparing to be updated...")

        pdi = new_pdi()
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
        conn.commit()
    # terminate connection after (if) data committed
    conn.terminate()


# this function should also update the number of tracks since that data will be easily available to it
# idea: pull dynamic playlist data, put rows into pandas df, then calculate averages
def historical_average_features():
    # order of data returned:
    columns = ["song_length", "tempo", "popularity", "danceability", "energy", "valence"]
    playlist_df = pd.DataFrame(columns=columns)

    playlist_data = db.dynamic_playlist_data()
    for song in playlist_data:
        try:
            song_dict = {
                "song_length": float(song[0]),
                "tempo": float(song[1]),
                "popularity": float(song[2]),
                "danceability": float(song[3]),
                "energy": float(song[4]),
                "valence": float(song[5])
            }
            song_df = pd.DataFrame(song_dict, index=[0])
            playlist_df = pd.concat([playlist_df, song_df])

        # TypeError occurs when troubleshooting and added songs do not have their popularity assigned yet
        # but under normal circumstances should NOT happen, as this function will be called after
        # popularities have been added
        except TypeError:
            pass

    return len(playlist_df), playlist_df["song_length"].mean(), playlist_df["tempo"].mean(), \
           playlist_df["popularity"].mean(), playlist_df["danceability"].mean(), \
           playlist_df["energy"].mean(), playlist_df["valence"].mean()


def dynamic_playlist_novelty():
    dyn_song_ids, arc_song_ids = dyn_arc_song_retrieve()
    dyn_songs = []
    arc_songs = []
    novel_songs = 0

    dyn_track_count = len(dyn_song_ids)

    for song in dyn_song_ids:
        song_dict = {
            "id": song[0],
            "timestamp": song[1]
        }
        dyn_songs.append(song_dict)

    for song in arc_song_ids:
        song_dict = {
            "id": song[0],
            "timestamp": song[1]
        }
        arc_songs.append(song_dict)

    for item in dyn_songs:
        del arc_songs[arc_songs.index(item)]

    for item in dyn_songs:
        if item['timestamp'] in [i['timestamp'] for i in arc_songs]:
            logger.error(color_text(message=f"Error removing song {item['id']} from count"
                                            "for playlist novelty calculation",
                                    color=TerminalColors.FAIL))

    for song in [i['id'] for i in dyn_songs]:
        if song not in [i['id'] for i in arc_songs]:
            novel_songs += 1

    return novel_songs / dyn_track_count


# TODO: this will need to be refactored for the normalized db
def get_top_genres():
    genres = spotify_commands.playlist_genres("5YQHb5wt9d0hmShWNxjsTs")
    top_10_pairs = {k: genres[k] for k in list(genres)[:10]}

    return top_10_pairs


# TODO: this will need to be refactored for the normalized db
def new_pdi():
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
    print(new_pdi())
