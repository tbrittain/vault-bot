from db import DatabaseConnection
import os
import config
from dotenv import load_dotenv
import pandas as pd
import numpy as np
import spotify_commands
from alive_progress import alive_bar

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if config.environment == "dev":
    load_dotenv(f'{base_dir}/dev.env')
elif config.environment == "prod":
    test_db_user = os.getenv("DB_USER")
    test_db_pass = os.getenv("DB_PASS")
    test_db_host = os.getenv("DB_HOST")
    test_db_port = os.getenv("DB_PORT")
    test_db_name = os.getenv("DB_NAME")
    if None in [test_db_user, test_db_pass, test_db_host, test_db_port, test_db_name]:
        print("Invalid environment setting in docker-compose.yml, exiting")
        exit()
elif config.environment == "prod_local":
    load_dotenv(f'{base_dir}/prod_local.env')
else:
    print("Invalid environment setting, exiting")
    exit()
db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")
db_port = os.getenv("DB_PORT")
new_db_name = os.getenv("DB_NAME")
db_host = os.getenv("DB_HOST")
old_db_name = os.getenv("SECONDARY_DB_NAME")


def load_csv_to_df(file_path: str) -> pd.DataFrame:
    return pd.read_csv(file_path, na_values=np.NaN)


def copy_from_csv():
    """
    Old Vaultbot database tables were exported to CSVs (since they were relatively small),
    and modified in Excel to reformat the data to comply with the normalized database
    """
    artists_data = load_csv_to_df(file_path=f"{base_dir}\\artists.csv")
    songs_data = load_csv_to_df(file_path=f"{base_dir}\\songs.csv")
    dynamic_data = load_csv_to_df(file_path=f"{base_dir}\\dynamic.csv")
    archive_data = load_csv_to_df(file_path=f"{base_dir}\\archive.csv")
    historical_genres_data = load_csv_to_df(file_path=f"{base_dir}\\historical_genres.csv")
    historical_tracking_data = load_csv_to_df(file_path=f"{base_dir}\\historical_tracking.csv")

    conn = DatabaseConnection()

    artists_rows = conn.insert_copy_bulk_data(table='artists', df=artists_data)
    print(f"Artist rows copied: {artists_rows}")

    songs_rows = conn.insert_copy_bulk_data(table='songs', df=songs_data)
    print(f"Song rows copied: {songs_rows}")

    dynamic_rows = conn.insert_copy_bulk_data(table='dynamic', df=dynamic_data)
    print(f"Dynamic rows copied: {dynamic_rows}")

    archive_rows = conn.insert_copy_bulk_data(table='archive', df=archive_data)
    print(f"Archive rows copied: {archive_rows}")

    historical_genres_rows = conn.insert_copy_bulk_data(table='historical_genres', df=historical_genres_data)
    print(f"Historical genres rows copied: {historical_genres_rows}")

    historical_tracking_rows = conn.insert_copy_bulk_data(table='historical_tracking', df=historical_tracking_data)
    print(f"Historical tracking rows copied: {historical_tracking_rows}")

    conn.commit()
    conn.terminate()


def update_arts_and_preview_urls():
    """
    Copied data requires some updates to fill in missing data, such as art and preview URLs for song data,
    and art URL for artists data
    """
    conn = DatabaseConnection()

    # update art and preview_url for each song
    song_ids = conn.select_query(query_literal="id", table="songs")
    limit = 1000000  # used for testing and troubleshooting
    songs_updated = arts_updated = song_previews_updated = 0
    with alive_bar(total=len(song_ids), title="Updating songs") as bar:
        for song in song_ids:
            song_id = song[0]
            song_info = spotify_commands.get_track_info(track_id=song_id, user=None)
            keys = list(song_info.keys())

            if 'artist_art' in keys:
                song_art = song_info['album_art']
                conn.update_query(table='songs', column_to_change='art', value=song_art,
                                  column_to_match='id', condition=song_id)
                arts_updated += 1

            if 'preview_url' in keys:
                song_preview = song_info['preview_url']
                conn.update_query(table='songs', column_to_change='preview_url', value=song_preview,
                                  column_to_match='id', condition=song_id)
                song_previews_updated += 1

            songs_updated += 1
            bar()
            limit -= 1
            if limit <= 0:
                break
    print(f"Total songs updated: {songs_updated}\nArts updated: {arts_updated}\n"
          f"Song previews updated: {song_previews_updated}")

    # save artist genres for artists_genres table
    artist_genres = []

    # update art for each artist
    limit = 1000000  # used for testing and troubleshooting
    artist_arts_updated = 0
    artist_ids = conn.select_query(query_literal="id", table="artists")
    with alive_bar(total=len(artist_ids), title="Updating artists") as bar:
        for artist in artist_ids:
            artist_id = artist[0]
            artist_art = None
            try:
                artist_info = spotify_commands.sp.artist(artist_id)
                artist_art = artist_info['images'][0]['url']
            except IndexError:
                pass

            artist_genres.append({
                'artist_id': artist_id,
                'genres': artist_info['genres']
            })
            if artist_art is not None:
                conn.update_query(table='artists', column_to_change='art', value=artist_art,
                                  column_to_match='id', condition=artist_id)

            artist_arts_updated += 1
            bar()
            limit -= 1
            if limit <= 0:
                break
    print(f"Artist arts updated: {artist_arts_updated}")

    # generate artists_genres table data
    artist_genre_pairs_added = 0
    with alive_bar(total=len(artist_genres), title="Inserting data into artists_genres table") as bar:
        for artist in artist_genres:
            artist_id = artist['artist_id']
            genres = artist['genres']
            artist_genre_columns = ('artist_id', 'genre')
            for genre in genres:
                artist_genre_values = (artist_id, genre)

                conn.insert_single_row(table='artists_genres', columns=artist_genre_columns,
                                       row=artist_genre_values)
                artist_genre_pairs_added += 1
            bar()

    print(f"Rows added to artists_genres: {artist_genre_pairs_added}")

    conn.commit()
    conn.terminate()


if __name__ == '__main__':
    update_arts_and_preview_urls()
