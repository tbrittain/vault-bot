#!C:\Program Files\R\R-4.0.3\bin\Rscript.exe --vanilla --default-packages=RPostgres,tibble,reactable,htmltools,dplyr,DBI

library(tibble)
library(reactable)
library(htmltools)
library(dplyr)
library(RPostgres)
library(DBI)

# Title     : interactive_table
# Objective : display songs in the playlist in an interactive table
# Created by: Trey
# Created on: 10/11/2020

# TODO: convert to Rmarkdown file
# https://stackoverflow.com/questions/49904943/run-rmarkdown-with-arguments-on-the-command-line
# https://bookdown.org/yihui/rmarkdown/notebook.html#saving-and-sharing
# https://bookdown.org/yihui/rmarkdown/html-document.html

# TODO: create new date column with only day dates
# TODO: remove 2nd decimal place on loudness column if loudness =< -10

readRenviron(".env")
db_user <- Sys.getenv("DB_USER")
db_pass <- Sys.getenv("DB_PASS")
db <- 'vaultbot'
db_port <- 5432
db_host <- 'localhost'

con<-dbConnect(RPostgres::Postgres(), dbname=db, host=db_host, port=db_port, user=db_user, password=db_pass)

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
names(total_df)[15] <- "Tracks"
names(total_df)[16] <- "Popularity"

# gets rid of data with fewer than 3 user observations
#user_counts <- aggregate(data.frame(count = total_df$User), list(value = total_df$User), length)
#names(user_counts)[1] <- "User"
#
## merge user counts with original df for user_corrected
#total_df <- merge(x=total_df, y=user_counts, by="User")
#
## replace users with few songs added with "other"
#total_df$Corrected_user <- replace(total_df$User, total_df$count < 3, NA)
#total_df <- na.omit(total_df)

# variables for use in title
title_today <- format(Sys.time(), "%c")
song_count <- nrow(total_df)


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
                           "Date", "Popularity","Length", "Tempo", "Danceability",
                           "Energy", "Loudness", "Valence")]

# round df values
table_data$Length <- round(table_data$Length, digits = 2)
table_data$Loudness <- round(table_data$Loudness, digits = 2)
table_data$Tempo <- round(table_data$Tempo, digits = 1)
table_data$Danceability <- round(table_data$Danceability, digits = 3)
table_data$Energy <- round(table_data$Energy, digits = 3)
table_data$Valence <- round(table_data$Valence, digits = 3)

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

plot_title <- sprintf("Overall view of every song present in the playlist (%d songs as of %s). Updates every hour!",
                      song_count, title_today)

tbl <- reactable(
  table_data,
  columns = list(
    User = colDef(align = "left",
                  style = list(fontFamily = "monospace", whiteSpace = "pre"),
                  footer = "Average"),
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
    Popularity = colDef(aggregate = "mean",
                    align = "left",
                    filterable = FALSE,
                    cell = function(value){
                     width <- paste0(value / max(table_data$Popularity) * 100, "%")
                     value <- format(value, width = 5, justify = "right")
                     bar_chart(value, width = width,
                               background = "#e1e1e1",
                               fill = "#DF1313")
                  }, header = with_tooltip("Popularity", "Updates hourly"),
                    style = list(fontFamily = "monospace", whiteSpace = "pre"),
                    footer = JS("function(colInfo) {
                      var total = 0
                      var number_obsv = 0
                      colInfo.data.forEach(function(row) {
                      total += row[colInfo.column.id]
                      number_obsv += 1
                      })
                      var avg_value = total / number_obsv
                      return avg_value.toFixed(2)
                      }")),
    Length = colDef(aggregate = "mean",
                    align = "left",
                    filterable = FALSE,
                    cell = function(value){
                     width <- paste0(value / max(table_data$Length) * 100, "%")
                     value <- format(value, width = 5, justify = "right")
                     bar_chart(value, width = width,
                               background = "#e1e1e1",
                               fill = "#BD2637")
                  }, header = with_tooltip("Length", "Minutes in decimal form"),
                    style = list(fontFamily = "monospace", whiteSpace = "pre"),
                    footer = JS("function(colInfo) {
                      var total = 0
                      var number_obsv = 0
                      colInfo.data.forEach(function(row) {
                      total += row[colInfo.column.id]
                      number_obsv += 1
                      })
                      var avg_value = total / number_obsv
                      return avg_value.toFixed(2)
                      }")),
    Tempo = colDef(aggregate = "mean",
                   align = "left",
                   filterable = FALSE,
                   format = colFormat(digits = 1),
                   cell = function(value){
                     width <- paste0(value / max(table_data$Tempo) * 100, "%")
                     value <- format(value, width = 5, justify = "right")
                     bar_chart(value, width = width,
                               background = "#e1e1e1",
                               fill = "#9A395B")
                  },
                   header = with_tooltip("Tempo", "Take with a grain of salt"),
                   style = list(fontFamily = "monospace", whiteSpace = "pre"),
                   footer = JS("function(colInfo) {
                    var total = 0
                    var number_obsv = 0
                    colInfo.data.forEach(function(row) {
                    total += row[colInfo.column.id]
                    number_obsv += 1
                    })
                    var avg_value = total / number_obsv
                    return avg_value.toFixed(2)
                    }")),
    Danceability = colDef(aggregate = "mean",
                          align = "left",
                          format = colFormat(digits = 3),
                          filterable = FALSE,
                          cell = function(value){
                           width <- paste0(value / max(table_data$Danceability) * 100, "%")
                           value <- format(value, width = 5, justify = "right")
                           bar_chart(value, width = width,
                                            background = "#e1e1e1",
                                            fill = "#784C7F")
                          }, style = list(fontFamily = "monospace", whiteSpace = "pre"),
                          footer = JS("function(colInfo) {
                            var total = 0
                            var number_obsv = 0
                            colInfo.data.forEach(function(row) {
                            total += row[colInfo.column.id]
                            number_obsv += 1
                            })
                            var avg_value = total / number_obsv
                            return avg_value.toFixed(2)
                            }")),
    Energy = colDef(aggregate = "mean",
                    align = "left",
                    format = colFormat(digits = 3),
                    filterable = FALSE,
                    cell = function(value){
                     width <- paste0(value / max(table_data$Energy) * 100, "%")
                     value <- format(value, width = 5, justify = "right")
                     bar_chart(value, width = width,
                                      background = "#e1e1e1",
                                      fill = "#565FA2")
                  }, style = list(fontFamily = "monospace", whiteSpace = "pre"),
                    footer = JS("function(colInfo) {
                      var total = 0
                      var number_obsv = 0
                      colInfo.data.forEach(function(row) {
                      total += row[colInfo.column.id]
                      number_obsv += 1
                      })
                      var avg_value = total / number_obsv
                      return avg_value.toFixed(2)
                      }")),
    Loudness = colDef(aggregate = "mean",
                      align = "left",
                      format = colFormat(digits = 2),
                      filterable = FALSE,
                      cell = function(value){
                       width <- paste0(3/(value/median(table_data$Loudness)) * 15, "%")
                       value <- format(value, width = 5, justify = "right")
                       bar_chart(value, width = width,
                                        background = "#e1e1e1",
                                        fill = "#3372C6")
                  }, style = list(fontFamily = "monospace", whiteSpace = "pre"),
                      footer = JS("function(colInfo) {
                        var total = 0
                        var number_obsv = 0
                        colInfo.data.forEach(function(row) {
                        total += row[colInfo.column.id]
                        number_obsv += 1
                        })
                        var avg_value = total / number_obsv
                        return avg_value.toFixed(2)
                        }")),
    Valence = colDef(aggregate = "mean",
                     align = "left",
                     format = colFormat(digits = 3),
                     filterable = FALSE,
                     cell = function(value){
                       width <- paste0(value / max(table_data$Valence) * 100, "%")
                       value <- format(value, width = 5, justify = "right")
                       bar_chart(value, width = width,
                                 background = "#e1e1e1",
                                 fill = "#1185EA")
                  }, style = list(fontFamily = "monospace", whiteSpace = "pre"),
                      footer = JS("function(colInfo) {
                        var total = 0
                        var number_obsv = 0
                        colInfo.data.forEach(function(row) {
                        total += row[colInfo.column.id]
                        number_obsv += 1
                        })
                        var avg_value = total / number_obsv
                        return avg_value.toFixed(2)
                        }"))
  ),
  style = list(fontFamily = "monospace", whiteSpace = "pre", fontSize = "15px"),
  defaultSorted = list(Date = "desc"),
  defaultColDef = colDef(headerClass = "bar-sort-header"),
  highlight = TRUE,
  compact = TRUE,
  striped = TRUE,
  searchable = TRUE,
  filterable = TRUE,
  wrap = FALSE,
  resizable = TRUE,
  defaultPageSize = 25,
  showPageSizeOptions = TRUE,
  pageSizeOptions = c(25, 50, 100, 200),
  theme = reactableTheme(
    borderColor = "#dfe2e5",
    stripedColor = "#f6f8fa",
    highlightColor = "#f0f5f9",
    cellPadding = "8px 12px",
    style = list(fontFamily = "-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif"),
    searchInputStyle = list(width = "100%")
  )
)

# generate HTML
webpage <- div(class = "playlist-statistics",
  div(class = "playlist-header",
    h2(class = "playlist-title", "VaultBot Playlist Song Statistics"),
    plot_title
  ),
  tbl
)

# save HTML
htmltools::save_html(html=webpage,
                     file = "D:/Github/vault-bot/vaultbot_stats_table/index.html",
                     background = "white",
                     libdir = "D:/Github/vault-bot/vaultbot_stats_table")
