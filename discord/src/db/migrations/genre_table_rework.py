MIGRATION_ID = "3b15083d-b80a-412d-89be-7f4fa23d38a9"


def migration_005(cur):
    cur.execute(f"""
    --#region New genres playlist
    CREATE TABLE genres
    (
        id             UUID                NOT NULL PRIMARY KEY,
        name           varchar(255) UNIQUE NOT NULL,
        -- is_whitelisted for Party playlist use
        -- See #232 https://github.com/tbrittain/vault-bot/issues/232
        is_whitelisted BOOL                NOT NULL DEFAULT FALSE
    );
    
    WITH unique_genres (name) AS (SELECT DISTINCT genre
                                  FROM artists_genres)
    INSERT
    INTO genres (id, name)
    SELECT DISTINCT gen_random_uuid(), name
    FROM unique_genres;
    
    ALTER TABLE artists_genres
        ADD COLUMN genre_id UUID,
        ADD CONSTRAINT FK_artists_genres_genre
            FOREIGN KEY (genre_id) REFERENCES genres (id);
    
    UPDATE artists_genres ag
    SET genre_id = g.id
    FROM genres g
    WHERE ag.genre = g.name;
    
    -- Due to dependent object
    DROP VIEW v_party_playlist;
    
    ALTER TABLE artists_genres
        DROP genre;
    --#endregion
    
    --#region Song/Artist aggregate playlist blacklist
    -- Blacklisted as in never selected for Aggregate playlists
    -- See #231 https://github.com/tbrittain/vault-bot/issues/231
    ALTER TABLE artists
    ADD is_blacklisted BOOL NOT NULL DEFAULT FALSE;
    
    ALTER TABLE songs
    ADD is_blacklisted BOOL NOT NULL DEFAULT FALSE;
    --#endregion
    
    INSERT INTO migration (id, description)
    VALUES ('{MIGRATION_ID}', 'Added dedicated genres table, genres Party playlist whitelist, and overall Song/Artist 
    aggregate playlist blacklist');
    """)
