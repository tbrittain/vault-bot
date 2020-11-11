#!C:\Program Files\R\R-4.0.3\bin\Rscript.exe --vanilla --default-packages=rmarkdown

# Title     : render rmd
# Objective : Renders Rmarkdown files into their corresponding HTML outputs for use on vaultbot.tbrittain.com
# Created by: Trey
# Created on: 10/16/2020

library(rmarkdown)

# had to use external pandoc installation instead of one that comes with RStudio
# also have to use absolute paths here
Sys.setenv(RSTUDIO_PANDOC='C:/Users/Trey/AppData/Local/Pandoc')

# index.html - interactive table
rmarkdown::render(input = "D:/Github/vault-bot/interactive_table.Rmd",
                  output_format = "html_document",
                  quiet = TRUE,
                  output_file = "D:/Github/vault-bot/vaultbot_stats_table/index.html" )

rmarkdown::render(input = "D:/Github/vault-bot/highscores.Rmd",
                  output_format = "html_document",
                  quiet = TRUE,
                  output_file = "D:/Github/vault-bot/vaultbot_stats_table/highscores.html" )

rmarkdown::render(input = "D:/Github/vault-bot/advanced_stats.Rmd",
                  output_format = "html_document",
                  quiet = TRUE,
                  output_file = "D:/Github/vault-bot/vaultbot_stats_table/advanced.html" )