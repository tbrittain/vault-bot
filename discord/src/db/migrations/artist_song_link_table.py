MIGRATION_ID = "71f5c122-fe9e-49ca-851d-85836daf019e"


def migration_002(cur):
    cur.execute(f"""
    CREATE TABLE artists_songs
    (
        artist_id varchar(255),
        song_id   varchar(255),
        FOREIGN KEY (artist_id) REFERENCES artists (id),
        FOREIGN KEY (song_id) REFERENCES songs (id),
        PRIMARY KEY (artist_id, song_id)
    );
    
    INSERT INTO artists_songs (song_id, artist_id)
    SELECT id AS song_id,
           artist_id
    FROM songs;
    
    DROP VIEW v_party_playlist;
    CREATE VIEW v_party_playlist AS
    SELECT songs.id, COUNT(archive.song_id)
    FROM songs
             JOIN archive ON songs.id =
                             archive.song_id
             JOIN artists_songs ON songs.id =
                                   artists_songs.song_id
             JOIN artists ON artists_songs.artist_id = artists.id
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
    
    DROP VIEW v_party_unfiltered_playlist;
    CREATE VIEW v_party_unfiltered_playlist AS
    SELECT songs.id, COUNT(archive.song_id)
    FROM songs
             JOIN archive ON songs.id = archive.song_id
             JOIN artists_songs ON songs.id = artists_songs.song_id
             JOIN artists ON artists_songs.artist_id = artists.id
             JOIN artists_genres ON artists.id = artists_genres.artist_id
    WHERE songs.danceability > 0.8
      AND songs.energy > 0.5
      AND songs.length < 4.5
      AND songs.length < 4.5
    GROUP BY songs.name, songs.id
    ORDER BY COUNT(archive.song_id) DESC
    LIMIT 100;
    
    ALTER TABLE songs
    DROP COLUMN artist_id;
    
    ALTER TABLE dynamic
    DROP COLUMN artist_id;
    
    ALTER TABLE archive
    DROP COLUMN artist_id;
    
    INSERT INTO migration (id, description)
    VALUES ('{MIGRATION_ID}', 'Added artist_songs link table and refactored party playlist views');
""")
