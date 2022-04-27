def create_schema(cur):
    cur.execute("""
    CREATE TABLE artists
    (
        id       varchar(255) NOT NULL,
        name     varchar(255),
        art      varchar(255),
        featured timestamp,
        CONSTRAINT artists_pkey
            PRIMARY KEY (id)
    );
    
    CREATE TABLE songs
    (
        id               varchar(255) NOT NULL,
        artist_id        varchar(255),
        name             varchar(255),
        length           numeric,
        tempo            numeric,
        danceability     numeric,
        energy           numeric,
        loudness         numeric,
        acousticness     numeric,
        instrumentalness numeric,
        liveness         numeric,
        valence          numeric,
        art              varchar(255),
        preview_url      varchar(255),
        album            varchar(255),
        CONSTRAINT songs_pkey
            PRIMARY KEY (id),
        CONSTRAINT songs_artist_id_fkey
            FOREIGN KEY (artist_id) REFERENCES artists
    );
    
    CREATE TABLE dynamic
    (
        song_id    varchar(255) NOT NULL,
        artist_id  varchar(255),
        added_by   varchar(255),
        added_at   timestamp,
        popularity numeric,
        CONSTRAINT dynamic_pkey
            PRIMARY KEY (song_id),
        CONSTRAINT dynamic_artist_id_fkey
            FOREIGN KEY (artist_id) REFERENCES artists,
        CONSTRAINT dynamic_song_id_fkey
            FOREIGN KEY (song_id) REFERENCES songs
    );
    
    CREATE TABLE archive
    (
        id        serial,
        song_id   varchar(255),
        artist_id varchar(255),
        added_by  varchar(255),
        added_at  timestamp,
        CONSTRAINT archive_pkey
            PRIMARY KEY (id),
        CONSTRAINT archive_artist_id_fkey
            FOREIGN KEY (artist_id) REFERENCES artists,
        CONSTRAINT archive_song_id_fkey
            FOREIGN KEY (song_id) REFERENCES songs
    );
    
    CREATE TABLE artists_genres
    (
        artist_id varchar(255) NOT NULL,
        genre     varchar      NOT NULL,
        CONSTRAINT artists_genres_pkey
            PRIMARY KEY (artist_id, genre),
        CONSTRAINT artists_genres_artist_id_fkey
            FOREIGN KEY (artist_id) REFERENCES artists
    );
    
    CREATE TABLE historical_genres
    (
        updated_at timestamp    NOT NULL,
        genre      varchar(255) NOT NULL,
        count      numeric      NOT NULL,
        CONSTRAINT historical_genres_pkey
            PRIMARY KEY (updated_at, genre, count)
    );
    
    CREATE TABLE historical_tracking
    (
        updated_at   timestamp,
        pdi          numeric,
        popularity   numeric,
        danceability numeric,
        energy       numeric,
        valence      numeric,
        song_length  numeric,
        tempo        numeric,
        novelty      numeric,
        id           integer NOT NULL,
        CONSTRAINT historical_tracking_pkey
            PRIMARY KEY (id)
    );
    """)


def create_migration_table(cur):
    cur.execute("""
    CREATE TABLE IF NOT EXISTS migration (
      id uuid PRIMARY KEY,
      description text NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    """)


def get_existing_tables(cur) -> set:
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    return set([table[0] for table in cur.fetchall()])

