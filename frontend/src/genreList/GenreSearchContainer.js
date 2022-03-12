import React from 'react'
import genreListStyles from './GenreListStyles'
import { useQuery } from '@apollo/client'
import GenreSearchResult from './GenreSearchResult'
import { Alert, Grid, Paper, Typography } from '@mui/material'
import { GENRE_SEARCH_QUERY } from '../queries/genreQueries'

const GenreSearchContainer = (props) => {
  const classes = genreListStyles()
  const { searchQuery } = props
  const { error, data } = useQuery(GENRE_SEARCH_QUERY, {
    variables: {
      searchQuery,
    },
  })
  let formattedData
  if (data) {
    formattedData = data.findGenresLike
  }

  if (error) {
    return (
      <Alert severity="error">An error occurred during data retrieval :(</Alert>
    )
  }

  return (
    <Grid container spacing={1} className={classes.queryResultContainer}>
      {formattedData &&
        formattedData.map((genre) => (
          <GenreSearchResult
            key={genre.genre}
            name={genre.genre}
            searchQuery={searchQuery}
          />
        ))}
      {formattedData && formattedData.length === 0 && (
        <Grid item className={classes.songResultNoneFound}>
          <Paper
            style={{
              padding: 10,
            }}
          >
            <Typography variant="subtitle1">No results found :(</Typography>
          </Paper>
        </Grid>
      )}
    </Grid>
  )
}

export default GenreSearchContainer
