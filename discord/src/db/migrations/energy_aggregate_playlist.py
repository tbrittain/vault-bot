MIGRATION_ID = "b85e34c4-4f61-4de6-b4e4-78ab6e0e9109"


def migration_004(cur):
    cur.execute(f"""
    CREATE VIEW v_energy_playlist AS
    SELECT songs.id, COUNT(archive.song_id)
    FROM songs
             JOIN archive ON songs.id = archive.song_id
             JOIN artists_songs ON songs.id = artists_songs.song_id
             JOIN artists ON artists_songs.artist_id = artists.id
             JOIN artists_genres ON artists.id = artists_genres.artist_id
    WHERE songs.energy > 0.925
    GROUP BY songs.name, songs.id
    ORDER BY COUNT(archive.song_id) DESC
    LIMIT 100;
    
    INSERT INTO migration (id, description)
    VALUES ('{MIGRATION_ID}', 'Added energy playlist view');
    """)
