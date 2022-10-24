MIGRATION_ID = "851b969c-68e2-41dd-9639-32c2c07f9f57"


def migration_009(cur):
    cur.execute(f"""
    ALTER TABLE songs
    ADD COLUMN is_explicit BOOLEAN DEFAULT FALSE;
    
    INSERT INTO migration (id, description)
    VALUES ('{MIGRATION_ID}', 'Added explicit bool to songs.');
    """)
