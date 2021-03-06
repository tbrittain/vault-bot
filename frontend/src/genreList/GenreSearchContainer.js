import React from 'react'
import genreListStyles from './GenreListStyles'
import { useQuery, gql } from '@apollo/client'
import {
  Grid,
  Typography,
  Paper
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import GenreSearchResult from './GenreSearchResult'

const QUERY = gql`
  query ($searchQuery: String!){
    findGenresLike(searchQuery: $searchQuery) {
      genre
    }
  }
`

const GenreSearchContainer = (props) => {
  const classes = genreListStyles()
  const { searchQuery } = props
  const { error, data } = useQuery(
    QUERY,
    {
      variables: {
        searchQuery
      }
    }
  )
  let formattedData
  if (data) {
    formattedData = data.findGenresLike
  }

  if (error) {
    return (
      <Alert severity='error'>An error occurred during data retrieval :(</Alert>
    )
  }

  return (
    <Grid
      container
      spacing={1}
      className={classes.queryResultContainer}
    >
      {formattedData &&
        formattedData.map(genre => (
          <GenreSearchResult
            key={genre.genre}
            name={genre.genre}
            searchQuery={searchQuery}
          />
        ))}
      {formattedData && formattedData.length === 0 &&
        <Grid
          item
          className={classes.songResultNoneFound}
        >
          <Paper
            style={{
              padding: 10
            }}
          >
            <Typography
              variant='subtitle1'
            >
              No results found :(
            </Typography>
          </Paper>
        </Grid>}
    </Grid>
  )
}

export default GenreSearchContainer
