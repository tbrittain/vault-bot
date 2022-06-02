MIGRATION_ID = "1ee2cbd9-9f03-4ad1-974b-7219a17cd49f"


def migration_003(cur):
    cur.execute("SELECT MAX(Id) FROM archive")

    # only want to run this if there are existing records in the archive table
    max_id = cur.fetchone()[0]
    if max_id is None:
        return

    cur.execute("""
    SELECT c.relname
    FROM pg_class c
    WHERE c.relkind = 'S'
      AND c.relname LIKE '%archive%';
    """)
    archive_sequence_name = cur.fetchone()[0]

    cur.execute(f"""
    ALTER SEQUENCE {archive_sequence_name} RESTART WITH {max_id + 1};
    """)

    cur.execute(f"""
    INSERT INTO migration (id, description)
    VALUES ('{MIGRATION_ID}', 'Restarted archive sequence');
    """)

