import React from 'react'
import songListStyles from './SongListStyles'
import { useQuery, gql } from '@apollo/client'
import {
  Grid,
  Typography,
  Paper
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import SongSearchResult from './SongSearchResult'

const QUERY = gql`
  query ($searchQuery: String!) {
    findTracksLike(searchQuery: $searchQuery) {
      name
      id
      art
      album
      artist {
        name
      }
    }
  }
`

const SongSearchContainer = (props) => {
  const classes = songListStyles()
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
    formattedData = data.findTracksLike
  }

  return (
    <Grid
      container
      spacing={1}
      className={classes.queryResultContainer}
    >
      {error &&
        <Alert severity='error'>An error occurred during data retrieval :(</Alert>}
      {formattedData &&
        formattedData.map(song => (
          <SongSearchResult
            key={song.id}
            name={song.name}
            id={song.id}
            art={song.art}
            artist={song.artist.name}
            album={song.album}
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

export default SongSearchContainer
