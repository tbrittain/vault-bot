MIGRATION_ID = "c87fd6bd-9b8d-4f53-888d-e3d3bb834c43"


def migration_001(cur):
    cur.execute(f"""
    CREATE VIEW v_party_playlist AS
    SELECT songs.id, COUNT(archive.song_id)
    FROM songs
             JOIN archive ON songs.id =
                             archive.song_id
             JOIN artists ON songs.artist_id = artists.id
             JOIN artists_genres ON artists.id =
                                    artists_genres.artist_id
    WHERE artists_genres.genre = ANY (
        '{{pop rap, edm, house, tropical house, uk dance, deep groove house,
        bass house, electronic trap, la pop, metropopolis, pop edm, big room,
        vocal house, moombahton, pop dance, trap latino, grime,
        disco house}}'
        )
      AND songs.danceability > 0.55
      AND songs.energy > 0.76
      AND songs.length < 4.25
      AND songs.tempo > 115
    GROUP BY songs.name, songs.id
    ORDER BY COUNT(archive.song_id) DESC
    LIMIT 100;
    
    CREATE VIEW v_top_50_playlist AS
    SELECT songs.id, COUNT(archive.song_id)
    FROM songs
             JOIN archive
                  ON songs.id = archive.song_id
    GROUP BY songs.name, songs.id
    ORDER BY COUNT(archive.song_id) DESC
    LIMIT 50;
    
    CREATE VIEW v_chill_playlist AS
    SELECT songs.id, COUNT(archive.song_id)
    FROM songs
             JOIN archive ON songs.id =
                             archive.song_id
    WHERE songs.energy < 0.35
      AND songs.acousticness > 0.1
    GROUP BY songs.name, songs.id
    ORDER BY COUNT(archive.song_id) DESC
    LIMIT 100;
    
    CREATE VIEW v_light_playlist AS
    SELECT songs.id, COUNT(archive.song_id)
    FROM songs
             JOIN archive ON songs.id
        = archive.song_id
    WHERE songs.valence > 0.9
    GROUP BY songs.name, songs.id
    ORDER BY COUNT(archive.song_id) DESC
    LIMIT 100;
    
    CREATE VIEW v_moody_playlist AS
    SELECT songs.id, COUNT(archive.song_id)
    FROM songs
             JOIN archive ON songs.id
        = archive.song_id
    WHERE songs.valence < 0.1
    GROUP BY songs.name, songs.id
    ORDER BY COUNT(archive.song_id) DESC
    LIMIT 100;
    
    CREATE VIEW v_party_unfiltered_playlist AS
    SELECT songs.id, COUNT(archive.song_id)
    FROM songs
             JOIN archive
                  ON songs.id = archive.song_id
             JOIN artists ON songs.artist_id = artists.id
             JOIN artists_genres ON artists.id
                                        = artists_genres.artist_id AND songs.danceability > 0.8 AND songs.energy > 0.5
        AND songs.length < 4.5
    GROUP BY songs.name, songs.id
    ORDER BY COUNT(archive.song_id) DESC
    LIMIT 100;
    
    INSERT INTO migration (id, description)
    VALUES ('{MIGRATION_ID}', 'Added views for aggregate playlist generation');
""")
