MIGRATION_ID = "851b969c-68e2-41dd-9639-32c2c07f9f57"


def migration_009(cur):
    cur.execute(f"""
    ALTER TABLE songs
    ADD COLUMN is_explicit BOOLEAN DEFAULT FALSE;
    
    CREATE TABLE albums
    (
        id VARCHAR(255),
        name VARCHAR(255),
        type VARCHAR(255),
        album_art_small VARCHAR(255),
        album_art_medium VARCHAR(255),
        album_art_large VARCHAR(255),
        release_date TIMESTAMP
    );
    
    CREATE TABLE albums_artists
    (
        album_id VARCHAR(255) NOT NULL REFERENCES albums,
        artist_id VARCHAR(255) NOT NULL REFERENCES artists
    );
    
    CREATE TABLE songs_albums
    (
        song_id VARCHAR(255) NOT NULL REFERENCES songs,
        album_id VARCHAR(255) NOT NULL REFERENCES albums
    );
    
    -- To drop or not to drop artists_songs here?
    
    INSERT INTO migration (id, description)
    VALUES ('{MIGRATION_ID}', 'Added explicit bool to songs, Added albums and albums_artists tables');
    """)
