MIGRATION_ID = "0125f66d-688f-4c42-8f80-cb5346362519"


def migration_006(cur):
    cur.execute(f"""
    CREATE TABLE featured_artists
    (
        artist_id     VARCHAR(255) NOT NULL,
        featured_date TIMESTAMP    NOT NULL
    );
    
    ALTER TABLE featured_artists
        ADD CONSTRAINT FK_featured_artists_artists
            FOREIGN KEY (artist_id) REFERENCES artists (id);
    
    WITH existing_featured_artists (artist_id, featured_date) AS (SELECT id, featured
                                                                  FROM artists
                                                                  WHERE featured IS NOT NULL)
    INSERT
    INTO featured_artists (artist_id, featured_date)
    SELECT artist_id, featured_date
    FROM existing_featured_artists;
    
    CREATE TABLE featured_genres
    (
        genre_id      UUID      NOT NULL,
        featured_date TIMESTAMP NOT NULL
    );
    
    ALTER TABLE featured_genres
        ADD CONSTRAINT FK_featured_genres_genres
            FOREIGN KEY (genre_id) REFERENCES genres (id);
            
    ALTER TABLE artists
        DROP COLUMN featured;

    INSERT INTO migration (id, description)
    VALUES ('{MIGRATION_ID}', 'Added featured_artists and featured_genres tables');
    """)
