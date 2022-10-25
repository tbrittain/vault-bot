import json
from os import getenv

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


def main():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST
    )

    cur = conn.cursor()

    cur.execute("SELECT * FROM songs")
    song_ids = [x[0] for x in cur.fetchall()]

    print("Beginning albums-songs seeding following schema remediation")
    print(f"Updating {len(song_ids)} song records")

    with alive_bar(len(song_ids)) as bar:
        for song_id in song_ids:
            s = sp.track(track_id=song_id)

            bar()

    cur.close()

    conn.rollback()
    conn.close()


if __name__ == '__main__':
    main()
