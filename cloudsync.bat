@ECHO OFF
ECHO -------------------------------------------------------------------------
ECHO Preparing to synchronize vault-bot/vaultbot_stats_table with Google Cloud
ECHO -------------------------------------------------------------------------

gsutil -m rsync -R -x ".*\.txt$|.*\.cache$" D:/Github/vault-bot/vaultbot_stats_table gs://vaultbot.tbrittain.com

ECHO Cloud sync complete! Changes should appear soon @ vaultbot.tbrittain.com