import os
import db
from datetime import time, date, datetime, timedelta
import spotify_commands
import pandas as pd

# store format for standardization
iso_format = "%Y-%m-%d %H:%M"


def playlist_snapshot_coordinator():
    most_recent = db.get_most_recent_historical_update()
    most_recent_time = most_recent[0][0]

    # check to ensure update only occurs every n hours
    if (datetime.now() - most_recent_time) > timedelta(hours=4):
        print("Historical data preparing to be updated...")

        pdi = spotify_commands.playlist_diversity_index("5YQHb5wt9d0hmShWNxjsTs")
        print(f"Current playlist PDI: {pdi}")

        playlist_len, song_len, tempo, pop, dance, energy, valence = historical_average_features()

        now = datetime.now()
        timestamp_now = now.strftime(iso_format)

        db.db_historical_add(timestamp=timestamp_now, pdi=pdi, song_len=song_len, tempo=tempo, pop=pop, dance=dance,
                             energy=energy, valence=valence)

        top_10_genres = get_top_genres()

        # adds total as a genre
        db.db_historical_genre_add(timestamp=timestamp_now, genre="total", count=playlist_len)

        for genre, count in top_10_genres.items():
            db.db_historical_genre_add(timestamp=timestamp_now, genre=genre, count=count)


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


def get_top_genres():
    # https://www.r-graph-gallery.com/stacked-area-graph.html

    genres = spotify_commands.playlist_genres("5YQHb5wt9d0hmShWNxjsTs")
    top_10_pairs = {k: genres[k] for k in list(genres)[:10]}

    return top_10_pairs


if __name__ == "__main__":
    playlist_snapshot_coordinator()
