import logging

from .migrations.archive_serial_pkey_fix import MIGRATION_ID as ARCHIVE_SERIAL_PKEY_FIX_MIGRATION_ID
from .migrations.artist_song_link_table import MIGRATION_ID as ARTIST_SONG_LINK_TABLE_MIGRATION_ID
from .migrations.energy_aggregate_playlist import MIGRATION_ID as ENERGY_AGGREGATE_PLAYLIST_MIGRATION_ID
from .migrations.genre_table_rework import MIGRATION_ID as GENRE_REWORK_MIGRATION_ID
from .migrations.rankings_views import MIGRATION_ID as RANKINGS_VIEWS_MIGRATION_ID
from .migrations.selects_refactor import MIGRATION_ID as SELECTS_REFACTOR_MIGRATION_ID


def run_migration(cur, logger: logging.Logger):
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

    if ENERGY_AGGREGATE_PLAYLIST_MIGRATION_ID not in migration_ids:
        logger.info("Running migration 004")
        from .migrations.energy_aggregate_playlist import migration_004
        migration_004(cur)
        logger.info("Migration 004 complete")

    if GENRE_REWORK_MIGRATION_ID not in migration_ids:
        logger.info("Running migration 005")
        from .migrations.genre_table_rework import migration_005
        migration_005(cur)
        logger.info("Migration 005 complete")

    if RANKINGS_VIEWS_MIGRATION_ID not in migration_ids:
        logger.info("Running migration 006")
        from .migrations.rankings_views import migration_006
        migration_006(cur)
        logger.info("Migration 006 complete")
