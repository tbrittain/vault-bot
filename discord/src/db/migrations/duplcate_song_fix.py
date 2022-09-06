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
    
    -- TODO: ADD NEW SONG AND ARCHIVE VIEWS IN HERE
    
    INSERT INTO migration (id, description)
    VALUES ('{MIGRATION_ID}', 'Created duplicate song lookup table');
    """)
