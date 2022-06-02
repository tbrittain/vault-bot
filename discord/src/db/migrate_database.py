import logging

from .migrations.selects_refactor import MIGRATION_ID as SELECTS_REFACTOR_MIGRATION_ID
from .migrations.artist_song_link_table import MIGRATION_ID as ARTIST_SONG_LINK_TABLE_MIGRATION_ID
from .migrations.archive_serial_pkey_fix import MIGRATION_ID as ARCHIVE_SERIAL_PKEY_FIX_MIGRATION_ID


def migrate_database(cur, logger: logging.Logger):
    cur.execute("SELECT id FROM migration")
    migration_ids = [row[0] for row in cur.fetchall()]

    if SELECTS_REFACTOR_MIGRATION_ID not in migration_ids:
        logger.info("Running migration 001")
        from .migrations.selects_refactor import migration_001
        migration_001(cur)
        logger.info("Migration 001 complete")

    if ARTIST_SONG_LINK_TABLE_MIGRATION_ID not in migration_ids:
        logger.info("Running migration 002")
        from .migrations.artist_song_link_table import migration_002
        migration_002(cur)
        logger.info("Migration 002 complete")

    if ARCHIVE_SERIAL_PKEY_FIX_MIGRATION_ID not in migration_ids:
        logger.info("Running migration 003")
        from .migrations.archive_serial_pkey_fix import migration_003
        migration_003(cur)
        logger.info("Migration 003 complete")
