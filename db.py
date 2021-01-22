import psycopg2
from dotenv import load_dotenv
import os
import json
import spotify_commands
import config
import io_functions

load_dotenv()
db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")
db_name = config.database_name


# Note: the functions that interact directly with the PostgreSQL synchronously, even though the majority of
# discord.py probably prefers asynchronous functioning. This is due to asynchronous queries of the database
# through the psycopg2 package to auto-commit changes to the db, which could cause incomplete changes to be applied
# to the entirety of the database, such as when iterating over it
# https://www.psycopg.org/docs/advanced.html#asynchronous-support

# TODO: add release date attribute to each track, and append db_song_add() to include release date

def json_transfer():
    """
    One-time use to transfer the json to postgresql
    """
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    # database query as cur
    cur = con.cursor()

    # json as data
    with open('stats-copy.json') as f:
        data = json.load(f)

    # iterate over dynamic fields first
    track_dict = data['playlists']['dynamic']['tracks']

    for track, values in track_dict.items():

        artist = values['artist']
        song = values['song']
        album = values['album']
        added_by = values['added_by']
        added_at = values['added_at']
        song_length = values['song_length']
        tempo = values['tempo']
        dance = values['danceability']
        energy = values['energy']
        loudness = values['loudness']
        acoustic = values['acousticness']
        instrument = values['instrumentalness']
        liveness = values['liveness']
        valence = values['valence']

        # handle when single apostrophes present by doubling them up for SQL
        if album.__contains__("'"):
            album = album.replace("'", "''")
        if artist.__contains__("'"):
            artist = artist.replace("'", "''")
        if song.__contains__("'"):
            song = song.replace("'", "''")

            # inserting string into db dynamic
        cur.execute(f"""INSERT INTO dynamic (song_id, artist, song, album, added_by, added_at, song_length, tempo,
    danceability, energy, loudness, acousticness, instrumentalness, liveness, valence) VALUES ('{track}', '{artist}', 
    '{song}', '{album}', '{added_by}', '{added_at}', {song_length}, {tempo}, {dance}, {energy}, {loudness}, {acoustic},
    {instrument}, {liveness}, {valence})""")

    # transfer archive data
    track_dict = data['playlists']['archive']['tracks']

    for track, values in track_dict.items():

        artist = values['artist']
        song = values['song']
        album = values['album']
        added_by = values['added_by']
        added_at = values['added_at']
        song_length = values['song_length']
        tempo = values['tempo']
        dance = values['danceability']
        energy = values['energy']
        loudness = values['loudness']
        acoustic = values['acousticness']
        instrument = values['instrumentalness']
        liveness = values['liveness']
        valence = values['valence']

        # handle when single apostrophes present by doubling them up for SQL
        if album.__contains__("'"):
            album = album.replace("'", "''")
        if artist.__contains__("'"):
            artist = artist.replace("'", "''")
        if song.__contains__("'"):
            song = song.replace("'", "''")

            # inserting string into db archive
        cur.execute(f"""INSERT INTO archive (song_id, artist, song, album, added_by, added_at, song_length, tempo,
    danceability, energy, loudness, acousticness, instrumentalness, liveness, valence) VALUES ('{track}', '{artist}', 
    '{song}', '{album}', '{added_by}', '{added_at}', {song_length}, {tempo}, {dance}, {energy}, {loudness}, {acoustic},
    {instrument}, {liveness}, {valence})""")

    con.commit()

    cur.close()
    con.close()


def db_retroactive_attribute_sync():
    """
    run this function once for a given spotify song attribute to add it to dynamic and archive tables
    once column has been created with null values
    works properly for now since archive and dynamic playlists are identical, but once turn over begins
    then it will need to be modified to separately pull song_id from both tables independently
    """
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    cur = con.cursor()

    cur.execute("SELECT artist_id FROM dyn_artists")
    rows = cur.fetchall()

    unique_artist_ids = []
    for r in rows:
        if r[0] not in unique_artist_ids:
            unique_artist_ids.append(r[0])

    # use song_id as unique identifier to append new attribute to in sql
    id_attribute_list = []
    for artist_id in unique_artist_ids:
        artist_genres = {}

        # gotta reformat genres because some genres have apostrophes or are quotation strings vs apostrophe strings
        # and sql can only accept apostrophe varchars
        genres = spotify_commands.sp.artist(artist_id)['genres']
        genres = str(genres)
        genres = genres.replace("'", "")
        genres = genres.replace('"', "")
        genres = genres.replace('[', "")
        genres = genres.replace(']', "")
        genres = genres.split(', ')

        artist_genres[artist_id] = genres
        id_attribute_list.append(artist_genres)

    for artist_genre_dict in id_attribute_list:
        for artist_id, genre_array in artist_genre_dict.items():
            cur.execute(
                f"""UPDATE dyn_artists SET artist_genres = ARRAY{genre_array} WHERE artist_id = '{artist_id}'""")

    con.commit()
    cur.close()
    con.close()


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


if __name__ == "__main__":
    playlist_data = dynamic_playlist_data()
    for song in playlist_data:
        print(song)
