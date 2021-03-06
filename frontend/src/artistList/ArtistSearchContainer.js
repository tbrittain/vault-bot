import React from 'react'
import artistListStyles from './ArtistListStyles'
import { useQuery, gql } from '@apollo/client'
import {
  Grid,
  Typography,
  Paper
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import ArtistSearchResult from './ArtistSearchResult'

const QUERY = gql`
  query ($searchQuery: String!) {
    findArtistsLike(searchQuery: $searchQuery) {
      name
      id
      art
    }
  }
`

const ArtistSearchContainer = (props) => {
  const classes = artistListStyles()
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
    formattedData = data.findArtistsLike
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
        formattedData.map(artist => (
          <ArtistSearchResult
            key={artist.id}
            name={artist.name}
            id={artist.id}
            art={artist.art}
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

export default ArtistSearchContainer
