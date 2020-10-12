#!C:\Program Files\R\R-3.5.1\bin\Rscript.exe --vanilla --default-packages=jsonlite,tibble,reactable,htmltools,dplyr,shiny,rsconnect

library(rsconnect)
library(shiny)
library(jsonlite)
library(tibble)
library(reactable)
library(htmltools)
library(dplyr)

# Title     : interactive_table
# Objective : display songs in the playlist in an interactive table
# Created by: Trey
# Created on: 10/11/2020

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
names(total_df)[2] <- "Tracks"
names(total_df)[3] <- "Album"
names(total_df)[4] <- "User"
names(total_df)[5] <- "Date"
names(total_df)[6] <- "Length"
names(total_df)[7] <- "Tempo"
names(total_df)[8] <- "Danceability"
names(total_df)[9] <- "Energy"
names(total_df)[10] <- "Loudness"
names(total_df)[11] <- "Acoustic"
names(total_df)[12] <- "Instrumental"
names(total_df)[13] <- "Liveness"
names(total_df)[14] <- "Valence"
#
#user_counts <- aggregate(data.frame(count = total_df$User), list(value = total_df$User), length)
#names(user_counts)[1] <- "User"
#
## merge user counts with original df for user_corrected
#total_df <- merge(x=total_df, y=user_counts, by="User")
#
## replace users with few songs added with "other"
#total_df$Corrected_user <- replace(total_df$User, total_df$count < 3, NA)
#total_df <- na.omit(total_df)


title_today <- format(Sys.time(), "%c")
song_count <- nrow(total_df)

# color gradient for heatmap
GnYlRd <- function(x) rgb(colorRamp(c("#63be7b", "#ffeb84", "#f87274"))(x), maxColorValue = 255)

options(reactable.theme = reactableTheme(
  color = "hsl(233, 9%, 87%)",
  backgroundColor = "hsl(233, 9%, 19%)",
  borderColor = "hsl(233, 9%, 22%)",
  stripedColor = "hsl(233, 12%, 22%)",
  highlightColor = "hsl(233, 12%, 24%)",
  inputStyle = list(backgroundColor = "hsl(233, 9%, 25%)"),
  selectStyle = list(backgroundColor = "hsl(233, 9%, 25%)"),
  pageButtonHoverStyle = list(backgroundColor = "hsl(233, 9%, 25%)"),
  pageButtonActiveStyle = list(backgroundColor = "hsl(233, 9%, 28%)")
))

# copy data from original df
table_data <- total_df[, c("User", "Artist", "Album", "Tracks",
                           "Date", "Length", "Tempo", "Danceability",
                           "Energy", "Loudness", "Valence")]

# round df values
table_data$Length <- round(table_data$Length, digits = 2)
table_data$Loudness <- round(table_data$Loudness, digits = 2)
table_data$Tempo <- round(table_data$Tempo, digits = 1)
table_data$Danceability <- round(table_data$Danceability, digits = 3)
table_data$Energy <- round(table_data$Energy, digits = 3)
table_data$Valence <- round(table_data$Valence, digits = 3)

# table_data$Loudness <- abs(table_data$Loudness)

# bar chart function for use in reactable colDef function
bar_chart <- function(label, width = "100%", height = "16px", fill = "#00bfc4", background = NULL) {
  bar <- div(style = list(background = fill, width = width, height = height))
  chart <- div(style = list(flexGrow = 1, marginLeft = "8px", background = background), bar)
  div(style = list(display = "flex", alignItems = "center"), label, chart)
}
# tooltip function
with_tooltip <- function(value, tooltip) {
  tags$abbr(style = "text-decoration: underline; text-decoration-style: dotted; cursor: help",
            title = tooltip, value)
}


reactable(
  table_data,
  columns = list(
    User = colDef(align = "left",
                  style = list(fontFamily = "monospace", whiteSpace = "pre")),
    Artist = colDef(align = "left",
                    style = list(fontFamily = "monospace", whiteSpace = "pre")),
    Album = colDef(align = "left",
                    style = list(fontFamily = "monospace", whiteSpace = "pre")),
    Tracks = colDef(align = "left",
                    style = list(fontFamily = "monospace", whiteSpace = "pre")),
    Date = colDef(align = "left",
                  style = list(fontFamily = "monospace", whiteSpace = "pre")),
    Tracks = colDef(aggregate = "count",
                    align = "left",
                    style = list(fontFamily = "monospace", whiteSpace = "pre")),
    Length = colDef(aggregate = "mean",
                    align = "left",
                    filterable = FALSE,
                    cell = function(value){
                     width <- paste0(value / max(table_data$Length) * 100, "%")
                     value <- format(value, width = 5, justify = "right")
                     bar_chart(value, width = width,
                               background = "#e1e1e1",
                               fill = "#000000")
                  }, header = with_tooltip("Length", "Minutes in decimal form"),
                    style = list(fontFamily = "monospace", whiteSpace = "pre")),
    Tempo = colDef(aggregate = "mean",
                   align = "left",
                   filterable = FALSE,
                   format = colFormat(digits = 1),
                   cell = function(value){
                     width <- paste0(value / max(table_data$Tempo) * 100, "%")
                     value <- format(value, width = 5, justify = "right")
                     bar_chart(value, width = width,
                               background = "#e1e1e1",
                               fill = "#264653")
                  },
                   header = with_tooltip("Tempo", "Take with a grain of salt"),
                   style = list(fontFamily = "monospace", whiteSpace = "pre")),
    Danceability = colDef(aggregate = "mean",
                          align = "left",
                          format = colFormat(digits = 3),
                          filterable = FALSE,
                          cell = function(value){
                           width <- paste0(value / max(table_data$Danceability) * 100, "%")
                           value <- format(value, width = 5, justify = "right")
                           bar_chart(value, width = width,
                                            background = "#e1e1e1",
                                            fill = "#2a9d8f")
                  }, style = list(fontFamily = "monospace", whiteSpace = "pre")),
    Energy = colDef(aggregate = "mean",
                    align = "left",
                    format = colFormat(digits = 3),
                    filterable = FALSE,
                    cell = function(value){
                     width <- paste0(value / max(table_data$Energy) * 100, "%")
                     value <- format(value, width = 5, justify = "right")
                     bar_chart(value, width = width,
                                      background = "#e1e1e1",
                                      fill = "#e9c46a")
                  }, style = list(fontFamily = "monospace", whiteSpace = "pre")),
    Loudness = colDef(aggregate = "mean",
                      align = "left",
                      format = colFormat(digits = 2),
                      filterable = FALSE,
                      cell = function(value){
                       width <- paste0(abs(1 / (value / max(table_data$Loudness))) * 100, "%")
                       value <- format(value, width = 5, justify = "right")
                       bar_chart(value, width = width,
                                        background = "#e1e1e1",
                                        fill = "#f4a261")
                  }, style = list(fontFamily = "monospace", whiteSpace = "pre")),
    Valence = colDef(aggregate = "mean",
                     align = "left",
                     format = colFormat(digits = 3),
                     filterable = FALSE,
                     cell = function(value){
                       width <- paste0(value / max(table_data$Valence) * 100, "%")
                       value <- format(value, width = 5, justify = "right")
                       bar_chart(value, width = width,
                                 background = "#e1e1e1",
                                 fill = "#e76f51")
                  }, style = list(fontFamily = "monospace", whiteSpace = "pre"))
  ),
  style = list(fontFamily = "Work Sans, sans-serif", fontSize = "14px"),
  defaultSorted = "User",
  defaultColDef = colDef(headerClass = "bar-sort-header"),
  highlight = TRUE,
  compact = TRUE,
  striped = TRUE,
  searchable = TRUE,
  filterable = TRUE,
  wrap = FALSE,
  resizable = TRUE,
  defaultPageSize = 50,
  showPageSizeOptions = TRUE,
  pageSizeOptions = c(50, 100, 200),
  theme = reactableTheme(
    borderColor = "#dfe2e5",
    stripedColor = "#f6f8fa",
    highlightColor = "#f0f5f9",
    cellPadding = "8px 12px",
    style = list(fontFamily = "-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"),
    searchInputStyle = list(width = "100%")
  )
)

stop()
plot_title <- sprintf("Overall view of every song present in the playlist (%d songs as of %s)",
                      song_count, title_today)

# generate HTML
webpage <- div(class = "playlist-statistics",
  div(class = "playlist-header",
    h2(class = "playlist-title", "Dynamic Playlist Song Statistics"),
    plot_title
  ),
  tbl
)

# save HTML
htmltools::save_html(html=webpage,
                     file = "D:/Github/vault-bot/embeds/song_stats.html",
                     background = "white",
                     libdir = "D:/Github/vault-bot/embeds/song_stats")