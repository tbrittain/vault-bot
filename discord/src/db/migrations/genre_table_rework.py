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
    
    --#region View remediation
    UPDATE genres
    SET is_whitelisted = TRUE
    WHERE genres.name = 'pop rap'
       OR genres.name = 'edm'
       OR genres.name = 'tropical house'
       OR genres.name = 'uk dance'
       OR genres.name = 'deep groove house'
       OR genres.name = 'bass house'
       OR genres.name = 'electronic trap'
       OR genres.name = 'la pop'
       OR genres.name = 'metropopolis'
       OR genres.name = 'pop edm'
       OR genres.name = 'big room'
       OR genres.name = 'vocal house'
       OR genres.name = 'moombahton'
       OR genres.name = 'pop dance'
       OR genres.name = 'trap latino'
       OR genres.name = 'grime'
       OR genres.name = 'disco house';
    
    CREATE VIEW v_party_playlist(id, count) AS
    SELECT s.id,
           count(a.song_id) AS count
    FROM songs s
             JOIN archive a ON s.id = a.song_id
             JOIN artists_songs ON s.id = artists_songs.song_id
             JOIN artists a2 ON artists_songs.artist_id = a2.id
             JOIN artists_genres ON a2.id = artists_genres.artist_id
             JOIN genres g on artists_genres.genre_id = g.id
    WHERE g.is_whitelisted = TRUE
      AND s.danceability > 0.55
      AND s.energy > 0.76
      AND s.length < 4.25
      AND s.tempo > 115
      AND s.is_blacklisted = FALSE
      AND a2.is_blacklisted = FALSE
    GROUP BY s.name, s.id
    ORDER BY (count(a.song_id)) DESC
    LIMIT 100;
    
    DROP VIEW v_party_unfiltered_playlist;
    CREATE VIEW v_party_unfiltered_playlist(id, count) AS
    SELECT s.id,
           count(a.song_id) AS count
    FROM songs s
             JOIN archive a ON s.id = a.song_id
             JOIN artists_songs ON s.id = artists_songs.song_id
             JOIN artists a2 ON artists_songs.artist_id = a2.id
    WHERE s.danceability > 0.8
      AND s.energy > 0.5
      AND s.length < 4.5
      AND s.length < 4.5
      AND s.is_blacklisted = FALSE
      AND a2.is_blacklisted = FALSE
    GROUP BY s.name, s.id
    ORDER BY (count(a.song_id)) DESC
    LIMIT 100;
    
    DROP VIEW v_energy_playlist;
    CREATE VIEW v_energy_playlist(id, count) AS
    SELECT s.id,
           count(a.song_id) AS count
    FROM songs s
             JOIN archive a ON s.id = a.song_id
             JOIN artists_songs ON s.id = artists_songs.song_id
             JOIN artists a2 ON artists_songs.artist_id = a2.id
    WHERE s.energy > 0.925
      AND loudness > -6
      AND tempo > 115
      AND s.is_blacklisted = FALSE
      AND a2.is_blacklisted = FALSE
    GROUP BY s.name, s.id
    ORDER BY (count(a.song_id)) DESC
    LIMIT 100;
    
    DROP VIEW v_chill_playlist;
    CREATE VIEW v_chill_playlist(id, count) AS
    SELECT s.id,
           count(a.song_id) AS count
    FROM songs s
             JOIN archive a ON s.id = a.song_id
             JOIN artists_songs ON s.id = artists_songs.song_id
             JOIN artists a2 ON artists_songs.artist_id = a2.id
    WHERE s.energy < 0.35
      AND s.acousticness > 0.1
      AND s.is_blacklisted = FALSE
      AND a2.is_blacklisted = FALSE
    GROUP BY s.name, s.id
    ORDER BY (count(a.song_id)) DESC
    LIMIT 100;
    
    DROP VIEW v_light_playlist;
    CREATE VIEW v_light_playlist(id, count) AS
    SELECT s.id,
           count(archive.song_id) AS count
    FROM songs s
             JOIN archive ON s.id = archive.song_id
             JOIN artists_songs ON s.id = artists_songs.song_id
             JOIN artists a2 ON artists_songs.artist_id = a2.id
    WHERE s.valence > 0.9
      AND s.is_blacklisted = FALSE
      AND a2.is_blacklisted = FALSE
    GROUP BY s.name, s.id
    ORDER BY (count(archive.song_id)) DESC
    LIMIT 100;
    
    DROP VIEW v_moody_playlist;
    CREATE VIEW v_moody_playlist(id, count) AS
    SELECT s.id,
           count(a.song_id) AS count
    FROM songs s
             JOIN archive a ON s.id = a.song_id
             JOIN artists_songs ON s.id = artists_songs.song_id
             JOIN artists a2 ON artists_songs.artist_id = a2.id
    WHERE s.valence < 0.1
      AND s.is_blacklisted = FALSE
      AND a2.is_blacklisted = FALSE
    GROUP BY s.name, s.id
    ORDER BY (count(a.song_id)) DESC
    LIMIT 100;
    
    DROP VIEW v_top_50_playlist;
    CREATE VIEW v_top_50_playlist(id, count) AS
    SELECT s.id,
           count(a.song_id) AS count
    FROM songs s
             JOIN archive a ON s.id = a.song_id
             JOIN artists_songs ON s.id = artists_songs.song_id
             JOIN artists a2 ON artists_songs.artist_id = a2.id
    WHERE s.is_blacklisted = FALSE
      AND a2.is_blacklisted = FALSE
    GROUP BY s.name, s.id
    ORDER BY (count(a.song_id)) DESC
    LIMIT 50;
    --#endregion
    
    INSERT INTO migration (id, description)
    VALUES ('{MIGRATION_ID}',
    'Added dedicated genres table, genres Party playlist whitelist, ' ||
    'and overall Song/Artist aggregate playlist blacklist. Modified all ' ||
    'views to utilize these new fields where applicable.');
    """)
