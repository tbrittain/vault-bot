#!C:\Program Files\R\R-3.5.1\bin\Rscript.exe --vanilla --default-packages=jsonlite,tibble,data.table,GGally,ggplot2,dplyr
# important that the path above is added to system path
library(jsonlite)
library(tibble)
library(data.table)
library(GGally)
library(ggplot2)
library(dplyr)

# Title     : Stats_graphics
# Objective : Display advanced song statistics through ggplot
# Created by: Trey
# Created on: 10/8/2020

# dynamic playlist info from json to df
stats_raw <- jsonlite::fromJSON("D:/Github/vault-bot/stats.json")
stats_df <- tibble::as_tibble(stats_raw$playlists$dynamic$tracks)

total_df <- data.frame(artist=character(), # init empty df with all relevant columns
                       song=character(),
                       album=character(),
                       added_by=character(),
                       added_at=character(),
                       song_length=character(),
                       tempo=character(),
                       danceability=character(),
                       energy=character(),
                       loudness=character(),
                       acousticness=character(),
                       instrumentalness=character(),
                       liveness=character(),
                       valence=character(),
                       stringsAsFactors=FALSE)

# had to iterate over the stats_df as the json conversion made each value
# actually a list of the key: value, so iterating like this gets rid of the key
for (song_attribute in stats_df){
  temp_df <- data.frame(song_attribute)
  total_df <- rbind(total_df, temp_df)
}
# rename columns
names(total_df)[1] <- "Artist"
names(total_df)[2] <- "Song"
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
        aes(colour = as.character(Corrected_user), alpha = 0.2),
        lower = (list(continuous = wrap("points", alpha = 0.8, size = 0.8),
                      discrete = wrap("facetbar", alpha = 0.5))),
        diag = list(continuous =wrap("densityDiag", alpha = 0.3),
                    discrete = wrap("barDiag", alpha = 0.5)),
        upper = list(continuous = wrap(ggally_cor, display_grid = FALSE, size=2))) +
        theme(panel.grid.major = element_blank()) +
        theme(axis.text.x.bottom = element_text(angle = 90, vjust = 0.5, hjust=1))

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

ggsave(filename = "D:/Github/vault-bot/embeds/dynamic_plot.jpg", plot = last_plot(), width = 10, height = 10)
