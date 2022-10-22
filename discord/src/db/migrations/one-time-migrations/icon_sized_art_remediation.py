from os import getenv

import psycopg2
from alive_progress import alive_bar

DB_USER = getenv("DB_USER")
DB_PASS = getenv("DB_PASS")
DB_PORT = getenv("DB_PORT")
DB_NAME = getenv("DB_NAME")
DB_HOST = getenv("DB_HOST")

if None in [DB_USER, DB_PASS, DB_PORT, DB_NAME, DB_HOST]:
    print("Missing database credentials")
    exit(1)


def main():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST
    )

    cur = conn.cursor()

    # This migration is necessary because Spotify changed the response type that comes back from the call to the
    # songs API to have the icon-sized album art to the first image in the images values, while before the full-size
    # album art was in this first position. This update must have occurred somewhere in between October 12th and
    # October 15th, 2022
    cur.execute("""
    SELECT s.*
    FROM songs s
             JOIN archive a ON s.id = a.song_id
    WHERE a.added_at BETWEEN '2022-10-15' AND NOW()
    """)
    song_ids = [x[0] for x in cur.fetchall()]
    cur.close()

    print("Beginning album art size remediation")
    print(f"Starting with {len(song_ids)} songs with recently updated album arts")

    with alive_bar(len(song_ids)) as bar:
        for song_id in song_ids:
            pass

    conn.rollback()
    conn.close()


if __name__ == '__main__':
    main()
