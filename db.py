from io import StringIO
import pandas as pd
import psycopg2
import psycopg2.errors
from dotenv import load_dotenv
import os
import spotify_commands
import config
import io_functions

base_dir = os.getcwd()
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
db_name = os.getenv("DB_NAME")
db_host = os.getenv("DB_HOST")


def db_song_add(song_id, user):
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    # database query as cur
    cur = con.cursor()

    song_dict = spotify_commands.get_track_info(track_id=song_id, user=user)

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

    if album.__contains__("'"):
        album = album.replace("'", "''")
    if artist.__contains__("'"):
        artist = artist.replace("'", "''")
    if song.__contains__("'"):
        song = song.replace("'", "''")

    # inserting string into table dynamic
    cur.execute(f"""INSERT INTO dynamic (song_id, artist, song, album, added_by, added_at, song_length, tempo,
    danceability, energy, loudness, acousticness, instrumentalness, liveness, valence, artist_id) VALUES ('{song_id}', '{artist}',
    '{song}', '{album}', '{added_by}', '{added_at}', {song_length}, {tempo}, {dance}, {energy}, {loudness}, {acoustic},
    {instrument}, {liveness}, {valence}, '{artist_id}')""")

    genres = spotify_commands.artist_genres(artist_id=artist_id)
    # also add values to dyn_artists table
    cur.execute(f"""INSERT INTO dyn_artists (song_id, song, artist_id, artist, added_by, artist_genres) VALUES 
    ('{song_id}', '{song}', '{artist_id}', '{artist}', '{added_by}', ARRAY{genres})""")

    # inserting string into table archive
    cur.execute(f"""INSERT INTO archive (song_id, artist, song, album, added_by, added_at, song_length, tempo,
    danceability, energy, loudness, acousticness, instrumentalness, liveness, valence, artist_id) VALUES ('{song_id}', '{artist}',
    '{song}', '{album}', '{added_by}', '{added_at}', {song_length}, {tempo}, {dance}, {energy}, {loudness}, {acoustic},
    {instrument}, {liveness}, {valence}, '{artist_id}')""")

    con.commit()

    cur.close()
    con.close()


def db_purge_stats(song_id):
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    # database query as cur
    cur = con.cursor()

    cur.execute(f"DELETE FROM dynamic WHERE song_id = '{song_id}'")
    cur.execute(f"DELETE FROM dyn_artists WHERE song_id = '{song_id}'")

    con.commit()

    cur.close()
    con.close()


def popularity_update(track_id):
    raw_results = spotify_commands.sp.track(track_id=track_id)
    popularity = raw_results['popularity']

    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    cur = con.cursor()
    cur.execute(f"UPDATE dynamic SET popularity = {popularity} WHERE song_id = '{track_id}'")

    con.commit()
    cur.close()
    con.close()


def arts_for_website():
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    cur = con.cursor()

    cur.execute("SELECT artist_id FROM dyn_artists")
    rows = cur.fetchall()

    path = os.getcwd()

    unique_artist_ids = []
    for r in rows:
        if r[0] not in unique_artist_ids:
            unique_artist_ids.append(r[0])
    try:
        os.mkdir('vaultbot_stats_table/artist_images')  # tries to make new album art directory
    except FileExistsError:  # fails because already exists
        pass
    os.chdir('vaultbot_stats_table/artist_images')

    print(f'Downloading new artist arts to {os.getcwd()}')

    for artist_id in unique_artist_ids:
        print(f'Downloading art for artist ID {artist_id}')
        io_functions.artist_arts(artist_id=artist_id)

    print(f'Artist arts finished downloading')
    os.chdir(path)
    cur.close()
    con.close()


def dyn_artists_column_retrieve():
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    cur = con.cursor()

    cur.execute("SELECT song_id, song, artist_id, artist, artist_genres FROM dyn_artists")
    rows = cur.fetchall()

    cur.close()
    con.close()

    return rows


def dyn_arc_song_retrieve():
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    cur = con.cursor()

    cur.execute("SELECT song_id, added_at FROM dynamic")
    dyn_rows = cur.fetchall()

    cur.execute("SELECT song_id, added_at FROM archive")
    arc_rows = cur.fetchall()

    cur.close()
    con.close()

    return dyn_rows, arc_rows


def dyn_artists_artist_retrieve():
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    cur = con.cursor()

    cur.execute("SELECT artist_id FROM dyn_artists")
    rows = cur.fetchall()

    cur.close()
    con.close()

    return rows


def get_most_recent_historical_update():
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    cur = con.cursor()

    cur.execute(f"""SELECT * FROM historical_tracking ORDER BY updated_at desc LIMIT 1""")
    rows = cur.fetchall()

    cur.close()
    con.close()

    return rows


# for creating history of playlist
def dynamic_playlist_data():
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    cur = con.cursor()

    cur.execute("SELECT song_length, tempo, popularity, danceability, energy, valence FROM dynamic")
    rows = cur.fetchall()

    cur.close()
    con.close()

    return rows


def db_historical_add(timestamp, pdi, song_len, tempo, pop, dance, energy, valence, novelty):
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    # database query as cur
    cur = con.cursor()

    # inserting string into table dynamic
    cur.execute(f"""INSERT INTO historical_tracking (updated_at, pdi, popularity, danceability, energy, valence, 
song_length, tempo, novelty) VALUES ('{timestamp}', {pdi}, {pop}, {dance}, {energy}, {valence}, 
{song_len}, {tempo}, {novelty})""")

    con.commit()

    cur.close()
    con.close()


def db_historical_genre_add(timestamp, genre, count):
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    # database query as cur
    cur = con.cursor()

    # inserting string into table dynamic
    cur.execute(f"""INSERT INTO historical_genres (updated_at, genre, count) VALUES 
('{timestamp}', '{genre}', {count})""")

    con.commit()

    cur.close()
    con.close()


class DatabaseConnection:
    def __init__(self):
        self.conn = psycopg2.connect(dbname=db_name,
                                     user=db_user,
                                     password=db_pass,
                                     host=db_host,
                                     port=db_port)

    def terminate(self):
        self.conn.close()

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def select_query(self, query_literal: str, table: str) -> list:
        """Executing literals not recommended as query parameterization is better,
        but this method will not be exposed to any end users"""
        if len(query_literal) == 0:
            raise ValueError('Query must not be empty')
        elif len(table) == 0:
            raise ValueError('Table must not be empty')

        cur = self.conn.cursor()
        try:
            cur.execute(f"SELECT {query_literal} FROM {table}")
            rows = cur.fetchall()
        except Exception as e:
            error_code = psycopg2.errors.lookup(e.pgcode)
            raise error_code
        finally:
            cur.close()

        return rows

    def insert_copy_bulk_data(self, table: str, df: pd.DataFrame, columns: tuple) -> int:
        cur = self.conn.cursor()

        buffer = StringIO()
        df.to_csv(path_or_buf=buffer, header=False, index=False)
        # print(df.to_csv(header=False, index=False))
        buffer.seek(0)

        try:
            cur.copy_from(file=buffer, table=table, sep=",", columns=columns, null="")
        except Exception as e:
            error_code = psycopg2.errors.lookup(e.pgcode)
            raise error_code
        finally:
            cur.close()
        return df.count()[0]

    def insert_single_row(self, table: str, columns: tuple, row: tuple) -> bool:
        cur = self.conn.cursor()

        num_params = len(row)
        params = ""
        if num_params == 1:
            params += ""
        elif num_params == 2:
            params += "(%s,%s)"
        else:
            params += "(%s," + ((num_params - 2) * "%s,") + "%s)"

        formatted_columns = str(columns).replace("'", "").replace('"', '')

        try:
            cur.execute(f"""INSERT INTO {table} {formatted_columns} VALUES {params}""", row)
        except Exception as e:
            error_code = psycopg2.errors.lookup(e.pgcode)
            raise error_code
        finally:
            cur.close()
        return True


if __name__ == "__main__":
    pass
