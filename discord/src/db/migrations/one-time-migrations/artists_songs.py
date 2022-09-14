import json
from os import getenv
from pprint import pprint

import psycopg2
import spotipy
from alive_progress import alive_bar
from spotipy import CacheHandler, SpotifyOAuth

DB_USER = getenv("DB_USER")
DB_PASS = getenv("DB_PASS")
DB_PORT = getenv("DB_PORT")
DB_NAME = getenv("DB_NAME")
DB_HOST = getenv("DB_HOST")

if None in [DB_USER, DB_PASS, DB_PORT, DB_NAME, DB_HOST]:
    print("Missing database credentials")
    exit(1)

CLIENT_ID = getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = getenv("SPOTIFY_REDIRECT_URI")
TOKEN = getenv("SPOTIFY_CACHE")

if None in [CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, TOKEN]:
    print("Missing Spotify credentials")
    exit(1)


class MemoryCacheHandler(CacheHandler):
    def __init__(self, token_info=None):
        """
        Parameters:
            * token_info: The token info to store in memory. Can be None.
        """
        self.token_info = token_info

    def get_cached_token(self):
        return self.token_info

    def save_token_to_cache(self, token_info):
        print('Rewriting token info to memory')
        self.token_info = token_info


cache_handler = MemoryCacheHandler(token_info=json.loads(TOKEN))

SPOTIFY_SCOPE = "playlist-modify-public user-library-read playlist-modify-private"
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=CLIENT_ID,
                                               client_secret=CLIENT_SECRET,
                                               redirect_uri=REDIRECT_URI,
                                               scope=SPOTIFY_SCOPE,
                                               cache_handler=cache_handler))


def retroactive_artists_songs_update():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST
    )

    cur = conn.cursor()
    cur.execute("SELECT id FROM songs")
    rows = cur.fetchall()
    cur.close()

    print("Updating songs...")
    new_artists_added = []
    new_genres_added = []
    song_associations_added = 0

    with alive_bar(len(rows)) as bar:
        for row in rows:
            song_id = row[0]
            cur = conn.cursor()

            s = sp.track(track_id=song_id)
            artists_details = []
            for artist in s['artists']:
                artist_details = {
                    'name': artist['name'],
                    'id': artist['id'],
                }

                try:
                    artist_info = sp.artist(artist_id=artist['id'])
                    artist_art = artist_info['images'][0]['url']
                    artist_details['artist_art'] = artist_art
                except IndexError:
                    pass

                artists_details.append(artist_details)

            for artist in artists_details:
                artist_id = artist['id']
                artist_name = artist['name']
                artist_art = None
                try:
                    artist_art = artist['artist_art']
                except KeyError:
                    pass

                cur.execute("""
                SELECT id FROM artists
                WHERE id = %s
                """, (artist_id,))

                if cur.rowcount == 0:
                    cur.execute("""
                    INSERT INTO artists (id, name, art)
                    VALUES (%s, %s, %s)
                    """, (artist_id, artist_name, artist_art))
                    new_artists_added.append(artist_name)
                else:
                    cur.execute("""
                    UPDATE artists
                    SET art = %s
                    WHERE id = %s
                    """, (artist_art, artist_id))

                # get genres for the artist
                spotify_genres = sp.artist(artist_id=artist_id)["genres"]
                if (len(spotify_genres) > 0):
                    cur.execute("""
                    SELECT DISTINCT genre FROM artists_genres
                    WHERE artist_id = %s
                    """, (artist_id,))
                    existing_artist_genres = [x[0] for x in cur.fetchall()]

                    for genre in spotify_genres:
                        if genre not in existing_artist_genres:
                            cur.execute("""
                            INSERT INTO artists_genres (artist_id, genre)
                            VALUES (%s, %s)
                            """, (artist_id, genre))
                            if genre not in new_genres_added:
                                new_genres_added.append(genre)

                # get artists_songs for the artist
                cur.execute("""
                SELECT song_id FROM artists_songs
                WHERE artist_id = %s
                """, (artist_id,))
                existing_artist_songs = [x[0] for x in cur.fetchall()]
                if song_id not in existing_artist_songs:
                    cur.execute("""
                    INSERT INTO artists_songs (artist_id, song_id)
                    VALUES (%s, %s)
                    """, (artist_id, song_id))
                    song_associations_added += 1

            cur.close()
            bar()

    conn.commit()
    conn.close()
    pprint(new_artists_added)
    pprint(new_genres_added)
    print("Added {} new artists and {} new genres".format(len(new_artists_added), len(new_genres_added)))
    print("Added {} new song associations".format(song_associations_added))


if __name__ == '__main__':
    retroactive_artists_songs_update()
