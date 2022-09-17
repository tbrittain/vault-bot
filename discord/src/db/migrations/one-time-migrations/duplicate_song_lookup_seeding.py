from os import getenv
from pprint import pprint
from typing import List

import psycopg2
from alive_progress import alive_bar
from thefuzz import fuzz

DB_USER = getenv("DB_USER")
DB_PASS = getenv("DB_PASS")
DB_PORT = getenv("DB_PORT")
DB_NAME = getenv("DB_NAME")
DB_HOST = getenv("DB_HOST")

if None in [DB_USER, DB_PASS, DB_PORT, DB_NAME, DB_HOST]:
    print("Missing database credentials")
    exit(1)


def balance_duplicate_song_lookup(song_id: str, conn):
    def mark_source_songs_as_duplicates(_conn, target_song_id: str, source_song_ids: List[str]):
        formatted_source_song_ids = ", ".join(source_song_ids)

        sql = f"""
        UPDATE duplicate_song_lookup
        SET target_song_id = '{target_song_id}'
        WHERE source_song_id = ANY(
        '{{{formatted_source_song_ids}}}'
        )
        """
        _cur = _conn.cursor()
        _cur.execute(sql)
        _cur.close()

    print(f"\nBeginning mapping on song with ID {song_id}")

    cur = conn.cursor()
    cur.execute(f"""
        SELECT s.id,
               s.name,
               s.length,
               s.tempo,
               s.album,
               s.preview_url,
               s.acousticness,
               s.danceability,
               s.liveness,
               s.instrumentalness,
               s.valence
        FROM songs s
                 JOIN artists_songs "as" on s.id = "as".song_id
        WHERE "as".artist_id = ANY (SELECT as2.artist_id
                                    FROM artists_songs as2
                                    WHERE as2.song_id = '{song_id}')
        GROUP BY s.id;
    """)
    potential_duplicates = cur.fetchall()
    cur.close()

    print(f"\n{len(potential_duplicates)} found")
    pprint(potential_duplicates)

    # meaning we only got our original song back
    if len(potential_duplicates) == 1:
        print("\nOnly one potential duplicate (i.e. the source song) found, returning")
        return [song_id]

    initial = next(x for x in potential_duplicates if x[0] == song_id)
    initial_is_remix = initial[1].lower().__contains__('remix')

    print("\nInitial (source song):")
    pprint(initial)
    print(f"Initial is remix?: {initial_is_remix}")

    rest = [x for x in potential_duplicates if x[0] != song_id]

    filtered = list(filter(lambda x: abs(x[2] - initial[2]) < 0.1 and
                                     abs(x[3] - initial[3]) < 5, rest))

    print("\nFiltered by length and tempo")
    pprint(filtered)
    if len(filtered) == 0:
        print("No duplicates present, returning")
        return [song_id]

    filtered = [x for x in filtered if x[1].lower().__contains__('remix')] if initial_is_remix \
        else [x for x in filtered if not x[1].lower().__contains__('remix')]

    print(f"""\nFiltered out {"remixes" if not initial_is_remix else "non-remixes"}""")
    pprint(filtered)

    if len(filtered) == 0:
        print("No duplicates present, returning")
        return [song_id]

    # then, out of those results, filter those down to those with significant name similarity
    filtered = list(filter(lambda x: fuzz.ratio(x[1], initial[1]) > 90, filtered))

    print("\nFiltered by song name under 90% fuzzy substring similarity")
    pprint(filtered)

    if len(filtered) == 0:
        print("No duplicates present, returning")
        return [song_id]

    # then filter down to results that share significant similarity with regard to song characteristics
    filtered = list(filter(lambda x: abs(x[6] - initial[6]) < 0.1 and
                                     abs(x[7] - initial[7]) < 0.1 and
                                     abs(x[8] - initial[8]) < 0.1 and
                                     abs(x[9] - initial[9]) < 0.1 and
                                     abs(x[10] - initial[10]) < 0.1, filtered))

    print("\nFiltered by 10% deviation from source song characteristics")
    pprint(filtered)

    if len(filtered) == 0:
        print("No duplicates present, returning")
        return [song_id]

    # once we are at this point, then we can assume that all the results left represent the same songs.
    # then (if more than one result) we need to select which song is the one we want to be that target
    # song for all of these duplicate results
    # priority: 1. the result(s) that have a song preview

    print("\nFiltered songs now represent the same songs as the initial")
    print("Identifying the best song to set all duplicates to map to")
    print("Testing if any song are the only one with a song preview")

    combined = filtered
    combined.append(initial)
    all_combined_song_ids: List[str] = [x[0] for x in combined]
    filtered = list(filter(lambda x: x[5] is not None, combined))
    if len(filtered) == 1:
        print(f"Song with ID {filtered[0][0]} is only one with preview, setting as target song")
        mark_source_songs_as_duplicates(conn, filtered[0][0], all_combined_song_ids)
        return all_combined_song_ids
    elif len(filtered) == 0:
        print("No potential songs have a preview")
        # reset filtered, since none of the potential target songs will have a song preview
        filtered = combined
    else:
        print("Multiple songs have previews")
        # the else case above would indicate that there are multiple songs with song previews,
        # so we retain the result saved in the filtered variable

    # 2. if in different albums, the result that has the most songs in that same album
    # (which will require another trip to the database)
    print("\nDetermining which song has the most sibling songs in the same album")
    song_id_album_count = {}
    for song_row in filtered:
        escaped_album_name = song_row[4].replace("'", "''")

        cur = conn.cursor()
        cur.execute(f"""
        SELECT s.id, s.name, s.album
        FROM songs s
                 JOIN artists_songs "as" on s.id = "as".song_id
        WHERE "as".artist_id = ANY (SELECT as2.artist_id
                                    FROM artists_songs as2
                                    WHERE as2.song_id = '{song_row[0]}')
        AND s.album = '{escaped_album_name}'
        GROUP BY s.id;
        """)
        album_songs = cur.fetchall()
        cur.close()

        album_songs = list(filter(lambda x: x[0] not in all_combined_song_ids, album_songs))
        song_id_album_count[song_row[0]] = len(album_songs)

    print("Results:")
    pprint(song_id_album_count)

    # grab the first element returned for max_album_count_song_id, regardless of whether
    # there are more than 1, since if we get to this point, the songs that are left are
    # by all accounts identical in all the ways that we care about
    max_album_count_song_id = max(song_id_album_count, key=lambda x: song_id_album_count[x])

    print(f"Setting target song to {max_album_count_song_id}")

    mark_source_songs_as_duplicates(conn, max_album_count_song_id, all_combined_song_ids)

    return all_combined_song_ids


def main():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST
    )

    cur = conn.cursor()
    cur.execute("SELECT id FROM songs")
    all_song_ids = [x[0] for x in cur.fetchall()]
    cur.close()

    cache = []
    print("Beginning duplicate song mapping")
    print(f"Starting with {len(all_song_ids)} total potential duplicates")

    # all_song_ids = ['04WUbtvYkOpPVZWFYokO6J', '1U5KLauD740gADxs1pAEyh', '1U5KLauD740gADxs1pAEyh',
    #                 '2DrVfBmyN5B9T5SjNbQwGy', '0kLrrh7Z1gySNTunBH790J']

    with alive_bar(len(all_song_ids)) as bar:
        for song_id in all_song_ids:
            if song_id in cache:
                print(f"\nSong with ID {song_id} already cached, skipping")
                bar()
                continue

            updated_source_song_ids = balance_duplicate_song_lookup(song_id, conn)
            print(f"\nAdding {len(updated_source_song_ids)} songs to the cache")
            cache.extend(updated_source_song_ids)
            bar()

    conn.commit()
    conn.close()


if __name__ == '__main__':
    main()
