MIGRATION_ID = "5683f219-58df-4755-8a3e-ac84516a741a"


def migration_006(cur):
    cur.execute(f"""
    CREATE MATERIALIZED VIEW v_rankings_songs AS
    WITH song_counts (song_id, count, rank) AS
             (SELECT song_id,
                     COUNT(song_id),
                     ROW_NUMBER() OVER (ORDER BY COUNT(song_id) DESC) AS rank
              FROM archive
              GROUP BY song_id)
    SELECT s.id                        AS song_id,
           s.name                      AS song_name,
           sc.count                    AS num_times_added,
           sc.rank                     AS rank
    FROM songs s
             JOIN song_counts sc ON sc.song_id = s.id
    GROUP BY s.id, s.name, sc.count, sc.rank
    ORDER BY num_times_added DESC, rank;
    
    CREATE MATERIALIZED VIEW v_rankings_artists AS
    WITH artists_unique_songs (artist_id, num_unique_songs, rank) AS
             (SELECT a.id,
                     COUNT(s.id)                                AS num_unique_songs,
                     ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS num_unique_songs_rank
              FROM artists a
                       JOIN artists_songs "as" ON a.id = "as".artist_id
                       JOIN songs s ON s.id = "as".song_id
              GROUP BY a.id),
         artists_non_unique_songs (artist_id, num_non_unique_songs, rank) AS
             (SELECT a.id,
                     COUNT(s.id)                                AS num_non_unique_songs,
                     ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS num_non_unique_songs_rank
              FROM artists a
                       JOIN artists_songs "as" ON a.id = "as".artist_id
                       JOIN songs s ON s.id = "as".song_id
                       JOIN archive a2 ON s.id = a2.song_id
              GROUP BY a.id)
    SELECT a.id,
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
                       JOIN songs s ON "as".song_id = s.id
              GROUP BY g.id)
    SELECT g.id,
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
    VALUES ('{MIGRATION_ID}', 'Create rankings views for artists, songs, and genres');
    """)
