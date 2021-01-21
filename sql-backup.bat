@ECHO OFF
ECHO ------------------------------------------------
ECHO Preparing to backup Vaultbot PostgreSQL database
ECHO ------------------------------------------------

SET file_name=%1
SET PGPASSWORD=**PASSWORD**

ECHO SQL database backing up to %file_name% directory in D:\Github\vault-bot\sql_backups\

pg_dump -h localhost -p 5432 -U postgres -F d -f D:\Github\vault-bot\sql_backups\%file_name% vaultbot

ECHO Vaultbot SQL database backed up!
