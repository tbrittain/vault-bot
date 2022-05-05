import logging

from .migrations.selects_refactor import MIGRATION_ID as SELECTS_REFACTOR_MIGRATION_ID, migration_001
from .migrations.rankings_views import MIGRATION_ID as RANKINGS_VIEWS_MIGRATION_ID, migration_002


def migrate_database(cur, logger: logging.Logger):
    cur.execute("SELECT id FROM migration")
    migration_ids = [row[0] for row in cur.fetchall()]

    if SELECTS_REFACTOR_MIGRATION_ID not in migration_ids:
        logger.info("Running migration 001")
        migration_001(cur)
        logger.info("Migration 001 complete")

    if RANKINGS_VIEWS_MIGRATION_ID not in migration_ids:
        logger.info("Running migration 002")
        migration_002(cur)
        logger.info("Migration 002 complete")
