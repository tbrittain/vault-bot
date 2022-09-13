MIGRATION_ID = "da7c30b0-f260-4070-9ea6-880e8c82f7e9"


def migration_008(cur):
    cur.execute(f"""
    CREATE TABLE duplicate_song_lookup
    (
        source_song_id VARCHAR(255) UNIQUE NOT NULL PRIMARY KEY,
        target_song_id VARCHAR(255) NOT NULL,
        CONSTRAINT dsl_source_song_id_fkey
            FOREIGN KEY (source_song_id) REFERENCES songs (id),
        CONSTRAINT dsl_target_song_id_fkey
            FOREIGN KEY (target_song_id) REFERENCES songs (id)
    );
    
    -- By default, populate this lookup with default songs ids
    INSERT INTO duplicate_song_lookup (source_song_id, target_song_id)
    SELECT id, id
    FROM songs;

    CREATE VIEW v_songs AS
    SELECT dsl.target_song_id AS id,
           name,
           length,
           tempo,
           danceability,
           energy,
           loudness,
           acousticness,
           instrumentalness,
           liveness,
           valence,
           art,
           preview_url,
           album,
           is_blacklisted
    FROM songs s
             JOIN duplicate_song_lookup dsl ON s.id = dsl.source_song_id AND s.id = dsl.target_song_id;
             
    CREATE VIEW v_archive AS
    SELECT id, dsl.target_song_id AS song_id, added_by, added_at
    FROM archive a
             JOIN duplicate_song_lookup dsl ON a.song_id = dsl.source_song_id;
             
     -- TODO: Drop and re-create other views here (yay)
    
    INSERT INTO migration (id, description)
    VALUES ('{MIGRATION_ID}', 'Created duplicate song lookup table and v_songs and v_archive views.');
    """)
