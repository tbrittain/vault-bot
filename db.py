import psycopg2
from dotenv import load_dotenv
import os
import json
import spotify_commands

load_dotenv()
db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")


# one-time use to transfer the json to postgresql
def json_transfer():
    con = psycopg2.connect(
        database='vaultbot',
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


def db_song_add(song_id, user):
    con = psycopg2.connect(
        database='vaultbot',
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

    # inserting string into db dynamic
    cur.execute(f"""INSERT INTO dynamic (song_id, artist, song, album, added_by, added_at, song_length, tempo,
    danceability, energy, loudness, acousticness, instrumentalness, liveness, valence) VALUES ('{song_id}', '{artist}',
    '{song}', '{album}', '{added_by}', '{added_at}', {song_length}, {tempo}, {dance}, {energy}, {loudness}, {acoustic},
    {instrument}, {liveness}, {valence})""")

    # inserting string into db archive
    cur.execute(f"""INSERT INTO archive (song_id, artist, song, album, added_by, added_at, song_length, tempo,
    danceability, energy, loudness, acousticness, instrumentalness, liveness, valence) VALUES ('{song_id}', '{artist}',
    '{song}', '{album}', '{added_by}', '{added_at}', {song_length}, {tempo}, {dance}, {energy}, {loudness}, {acoustic},
    {instrument}, {liveness}, {valence})""")

    con.commit()

    cur.close()
    con.close()


def db_purge_stats(song_id):
    con = psycopg2.connect(
        database='vaultbot',
        user=db_user,
        password=db_pass,
        port=5432)

    # database query as cur
    cur = con.cursor()

    cur.execute(f"DELETE FROM dynamic WHERE song_id = '{song_id}'")

    con.commit()

    cur.close()
    con.close()


if __name__ == "__main__":
    db_song_add('4Gu4dC05SyYDOhqOpK1jbL', 'Trey')
    db_purge_stats('4Gu4dC05SyYDOhqOpK1jbL')
