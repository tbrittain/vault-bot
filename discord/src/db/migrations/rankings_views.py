MIGRATION_ID = "5683f219-58df-4755-8a3e-ac84516a741a"


def migration_002(cur):
    cur.execute(f"""
        CREATE VIEW v_rankings_songs AS
        SELECT ar.song_id,
               ar.artist_id,
               COUNT(ar.song_id) AS num_times_added,
               ROW_NUMBER() OVER (ORDER BY COUNT(ar.song_id) DESC) AS rank
        FROM archive ar
        GROUP BY ar.song_id, ar.artist_id
        ORDER BY rank;
        
        CREATE VIEW v_rankings_artists AS
        SELECT a.id AS artist_id,
               COUNT(s.id) AS num_songs,
               ROW_NUMBER() OVER (ORDER BY COUNT(s.id) DESC) AS rank
        FROM artists a
        LEFT JOIN songs s ON s.artist_id = a.id
        GROUP BY a.id
        ORDER BY rank;
        
        CREATE VIEW v_rankings_genres AS
        SELECT DISTINCT genre,
                        COUNT(*)                                   AS num_artists,
                        ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) AS rank
        FROM artists_genres
        GROUP BY genre
        ORDER BY rank;
        
        INSERT INTO migration (id, description) VALUES ('{MIGRATION_ID}', 'Create rankings views for artists, songs, and genres');
        """)
