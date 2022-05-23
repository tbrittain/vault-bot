MIGRATION_ID = "71f5c122-fe9e-49ca-851d-85836daf019e"


def migration_002(cur):
    cur.execute(f"""
    CREATE TABLE artists_songs
    (
        artist_id INTEGER,
        song_id   INTEGER,
        FOREIGN KEY (artist_id) REFERENCES artists (id),
        FOREIGN KEY (song_id) REFERENCES songs (id),
        PRIMARY KEY (artist_id, song_id)
    );
    
    INSERT INTO artists_songs (artist_id, song_id)
    SELECT id AS song_id,
           artist_id
    FROM songs;
    
    ALTER TABLE songs
    DROP COLUMN artist_id;
    
    INSERT INTO migration (id, description)
    VALUES ('{MIGRATION_ID}', 'Added artist_songs link table');
""")
