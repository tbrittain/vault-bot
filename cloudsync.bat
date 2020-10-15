@ECHO OFF
ECHO -------------------------------------------------------------------------
ECHO Preparing to synchronize vault-bot/vaultbot_stats_table with Google Cloud
ECHO -------------------------------------------------------------------------

gsutil rsync -R D:/Github/vault-bot/vaultbot_stats_table gs://vaultbot.tbrittain.com

ECHO Cloud sync complete! Changes should appear soon @ vaultbot.tbrittain.com