#!C:\Program Files\R\R-4.0.3\bin\Rscript.exe --vanilla --default-packages=RPostgres,tibble,data.table,GGally,ggplot2,dplyr,DBI
# important that the path above is added to system path
library(tibble)
library(data.table)
library(GGally)
library(ggplot2)
library(dplyr)
library(RPostgres)
library(DBI)

# Title     : Stats_graphics
# Objective : Display advanced song statistics through ggplot
# Created by: Trey
# Created on: 10/8/2020

readRenviron(".env")
db_user <- Sys.getenv("DB_USER")
db_pass <- Sys.getenv("DB_PASS")
db <- 'vaultbot'
db_port <- 5432
db_host <- 'localhost'

con<-dbConnect(RPostgres::Postgres(), dbname=db, host=db_host, port=db_port, user=db_user, password=db_pass)

# use following command to diagnose whether connection to PostgreSQL has been established
#dbListTables(con)

# example query below, was not needed due to being able to simply view table, see next execution
# query db dynamic's raw results and save results as variable, then clear query
#dyn_playlist_query <- RPostgres::dbGetQuery(con, "SELECT * FROM dynamic;")
#result <- RPostgres::dbFetch(dyn_playlist_query)
#RPostgres::dbClearResult(dyn_playlist_query)

# view entire dynamic table
total_df <- RPostgres::dbReadTable(con, "dynamic")

# disconnect from db
RPostgres::dbDisconnect(con)
# rename columns
names(total_df)[2] <- "Artist"
names(total_df)[3] <- "Album"
names(total_df)[4] <- "User"
names(total_df)[5] <- "Date"
names(total_df)[6] <- "Length"
names(total_df)[7] <- "Tempo"
names(total_df)[8] <- "Danceability"
names(total_df)[9] <- "Energy"
names(total_df)[10] <- "Loudness"
names(total_df)[11] <- "Acousticness"
names(total_df)[12] <- "Instrumentalness"
names(total_df)[13] <- "Liveness"
names(total_df)[14] <- "Valence"
names(total_df)[15] <- "Song"

# keeps track of number of songs
song_count <- nrow(total_df)

# add new column of corrected_user, being the normal username if their track count > 3
# else, overwrite username as "other"
# this will allow for data to be colored according to user

# determine user counts
user_counts <- aggregate(data.frame(count = total_df$User), list(value = total_df$User), length)
names(user_counts)[1] <- "User"

# merge user counts with original df for user_corrected
total_df <- merge(x=total_df, y=user_counts, by="User")

# replace users with few songs added with "other"
total_df$Corrected_user <- replace(total_df$User, total_df$count < 3, NA)
total_df <- na.omit(total_df)
# cant get this to work, just going to omit NAs
# total_df$Corrected_user[which(is.na(total_df$Corrected_user))] <- "Other"


p <- ggpairs(total_df, title = "Energized Attribute Pairwise Comparisons",
        columns = c("Tempo", "Danceability", "Energy", "Loudness", "Valence", "Corrected_user"),
        mapping = ggplot2::aes(colour = as.character(Corrected_user), alpha = 0.2), legend = 1,
             # change points to smooth for a best fit line, need to work on aesthetics tho
        lower = (list(continuous = wrap("points", alpha = 0.6, size = 0.5),
                      discrete = wrap("facetbar", alpha = 0.5))),
        diag = list(continuous =wrap("densityDiag", alpha = 0.3),
                    discrete = wrap("barDiag", alpha = 0.5)),
        upper = list(continuous = wrap(ggally_cor, display_grid = FALSE, size=2))) +
        theme(panel.grid.major = element_blank()) +
        theme(axis.text.x.bottom = element_text(angle = 90, vjust = 0.5, hjust=1))
        #scale_fill_brewer(palette="Set2")

#getPlot(p, 5, 5) + guides(fill=FALSE)
#getPlot(p, 5, 5) + guides(fill=FALSE)

plots <- list()
for (i in 1:6){
  plots <- c(plots, lapply(1:p$nrow, function(j) getPlot(p, i = i, j = j)))
}

title_today <- format(Sys.time(), "%c")
plot_title <- sprintf("Energized Attribute Pairwise Comparisons (%d songs as of %s)",
                      song_count, title_today)

ggmatrix(plots,
         nrow = p$nrow,
         ncol=6,
         xAxisLabels = p$xAxisLabels,
         yAxisLabels = p$yAxisLabels,
         title=plot_title) +
  theme(axis.text.x.bottom = element_text(angle = 90, vjust = 0.5, hjust=1, size=8)) +
  theme(axis.text.y = element_text(angle = 30, vjust = 0, hjust=1, size=8))
  #scale_fill_brewer(palette="Set2")

ggsave(filename = "D:/Github/vault-bot/embeds/dynamic_plot.jpg", plot = last_plot(), width = 10, height = 10)
