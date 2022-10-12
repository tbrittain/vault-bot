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
             
    CREATE VIEW v_dynamic AS
    SELECT dsl.target_song_id AS song_id, added_by, added_at, popularity
    FROM dynamic d
             JOIN duplicate_song_lookup dsl ON d.song_id = dsl.source_song_id;

    DROP VIEW v_chill_playlist;
    CREATE VIEW v_chill_playlist(id, count) AS
    SELECT s.id,
           count(a.song_id) AS count
    FROM v_songs s
             JOIN v_archive a ON s.id = a.song_id
             JOIN artists_songs ON s.id = artists_songs.song_id
             JOIN artists a2 ON artists_songs.artist_id = a2.id
    WHERE s.energy < 0.35
      AND s.acousticness > 0.1
      AND s.is_blacklisted = false
      AND a2.is_blacklisted = false
    GROUP BY s.name, s.id
    ORDER BY (count(a.song_id)) DESC
    LIMIT 100;
    
    DROP VIEW v_energy_playlist;
    CREATE VIEW v_energy_playlist(id, count) AS
    SELECT s.id,
           count(a.song_id) AS count
    FROM v_songs s
             JOIN v_archive a ON s.id = a.song_id
             JOIN artists_songs ON s.id = artists_songs.song_id
             JOIN artists a2 ON artists_songs.artist_id = a2.id
    WHERE s.energy > 0.925
      AND s.loudness > -6
      AND s.tempo > 115
      AND s.is_blacklisted = false
      AND a2.is_blacklisted = false
    GROUP BY s.name, s.id
    ORDER BY (count(a.song_id)) DESC
    LIMIT 100;
    
    DROP VIEW v_light_playlist;
    CREATE VIEW v_light_playlist(id, count) AS
    SELECT s.id,
           count(a.song_id) AS count
    FROM v_songs s
             JOIN v_archive a ON s.id = a.song_id
             JOIN artists_songs ON s.id = artists_songs.song_id
             JOIN artists a2 ON artists_songs.artist_id = a2.id
    WHERE s.valence > 0.9
      AND s.is_blacklisted = false
      AND a2.is_blacklisted = false
    GROUP BY s.name, s.id
    ORDER BY (count(a.song_id)) DESC
    LIMIT 100;
    
    DROP VIEW v_moody_playlist;
    CREATE VIEW v_moody_playlist(id, count) AS
    SELECT s.id,
           count(a.song_id) AS count
    FROM v_songs s
             JOIN v_archive a ON s.id = a.song_id
             JOIN artists_songs ON s.id = artists_songs.song_id
             JOIN artists a2 ON artists_songs.artist_id = a2.id
    WHERE s.valence < 0.1
      AND s.is_blacklisted = false
      AND a2.is_blacklisted = false
    GROUP BY s.name, s.id
    ORDER BY (count(a.song_id)) DESC
    LIMIT 100;
    
    DROP VIEW v_party_playlist;
    CREATE VIEW v_party_playlist(id, count) AS
    SELECT s.id,
           count(a.song_id) AS count
    FROM v_songs s
             JOIN v_archive a ON s.id = a.song_id
             JOIN artists_songs ON s.id = artists_songs.song_id
             JOIN artists a2 ON artists_songs.artist_id = a2.id
             JOIN artists_genres ON a2.id = artists_genres.artist_id
             JOIN genres g ON artists_genres.genre_id = g.id
    WHERE g.is_whitelisted = true
      AND s.danceability > 0.55
      AND s.energy > 0.76
      AND s.length < 4.25
      AND s.tempo > 115
      AND s.is_blacklisted = false
      AND a2.is_blacklisted = false
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
      AND s.is_blacklisted = false
      AND a2.is_blacklisted = false
    GROUP BY s.name, s.id
    ORDER BY (count(a.song_id)) DESC
    LIMIT 100;
    
    DROP MATERIALIZED VIEW v_rankings_songs;
    CREATE MATERIALIZED VIEW v_rankings_songs AS
    WITH song_counts (song_id, count, rank) AS
             (SELECT song_id,
                     COUNT(song_id),
                     ROW_NUMBER() OVER (ORDER BY COUNT(song_id) DESC) AS rank
              FROM v_archive
              GROUP BY song_id)
    SELECT s.id                        AS song_id,
           s.name                      AS song_name,
           sc.count                    AS num_times_added,
           sc.rank                     AS rank
    FROM v_songs s
             JOIN song_counts sc ON sc.song_id = s.id
    GROUP BY s.id, s.name, sc.count, sc.rank
    ORDER BY num_times_added DESC, rank;
    
    DROP MATERIALIZED VIEW v_rankings_artists;
    CREATE MATERIALIZED VIEW v_rankings_artists AS
    WITH artists_unique_songs (artist_id, num_unique_songs, rank) AS
             (SELECT a.id,
                     COUNT(s.id)                                AS num_unique_songs,
                     ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS num_unique_songs_rank
              FROM artists a
                       JOIN artists_songs "as" ON a.id = "as".artist_id
                       JOIN v_songs s ON s.id = "as".song_id
              GROUP BY a.id),
         artists_non_unique_songs (artist_id, num_non_unique_songs, rank) AS
             (SELECT a.id,
                     COUNT(s.id)                                AS num_non_unique_songs,
                     ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS num_non_unique_songs_rank
              FROM artists a
                       JOIN artists_songs "as" ON a.id = "as".artist_id
                       JOIN v_songs s ON s.id = "as".song_id
                       JOIN v_archive a2 ON s.id = a2.song_id
              GROUP BY a.id)
    SELECT a.id      AS artist_id,
           a.name,
           aus.num_unique_songs,
           aus.rank  AS num_unique_songs_rank,
           anus.num_non_unique_songs,
           anus.rank AS num_non_unique_songs_rank
    FROM artists a
             JOIN artists_unique_songs aus
                  ON aus.artist_id = a.id
             JOIN artists_non_unique_songs anus -- unintentional, i promise lol
                  ON anus.artist_id = a.id
    ORDER BY num_unique_songs DESC, num_non_unique_songs DESC;
    
    DROP MATERIALIZED VIEW v_rankings_genres;
    CREATE MATERIALIZED VIEW v_rankings_genres AS
    WITH genre_rank_by_artists (genre_id, num_artists, rank) AS
             (SELECT g.id,
                     COUNT(a.id)                                AS num_artists,
                     ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS num_artists_rank
              FROM genres g
                       JOIN artists_genres ag ON g.id = ag.genre_id
                       JOIN artists a ON a.id = ag.artist_id
              GROUP BY g.id),
         genre_rank_by_songs (genre_id, num_songs, rank) AS
             (SELECT g.id,
                     COUNT(s.id)                                AS num_songs,
                     ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS num_songs_rank
              FROM genres g
                       JOIN artists_genres ag ON g.id = ag.genre_id
                       JOIN artists a ON a.id = ag.artist_id
                       JOIN artists_songs "as" ON a.id = "as".artist_id
                       JOIN v_songs s ON "as".song_id = s.id
              GROUP BY g.id)
    SELECT g.id      AS genre_id,
           g.name,
           grba.num_artists,
           grba.rank AS num_artists_rank,
           grbs.num_songs,
           grbs.rank AS num_songs_rank
    FROM genres g
             JOIN genre_rank_by_artists grba
                  ON g.id = grba.genre_id
             JOIN genre_rank_by_songs grbs
                  ON g.id = grbs.genre_id
    ORDER BY num_artists DESC, num_songs DESC;
    
    INSERT INTO migration (id, description)
    VALUES ('{MIGRATION_ID}', 'Created duplicate song lookup table and v_songs, v_archive, and v_dynamic views.');
    """)
