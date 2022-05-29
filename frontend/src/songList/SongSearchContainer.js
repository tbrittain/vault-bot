import React from 'react'
import songListStyles from './SongListStyles'
import { gql, useQuery } from '@apollo/client'
import SongSearchResult from './SongSearchResult'
import { Alert, Grid, Paper, Typography } from '@mui/material'

const QUERY = gql`
  query ($searchQuery: String!) {
    findTracksLike(searchQuery: $searchQuery) {
      name
      id
      art
      album
      artists {
        name
      }
    }
  }
`

const SongSearchContainer = (props) => {
  const classes = songListStyles()
  const { searchQuery } = props
  const { error, data } = useQuery(QUERY, {
    variables: {
      searchQuery,
    },
  })
  let formattedData
  if (data) {
    formattedData = data.findTracksLike
  }

  if (error) {
    return (
      <Alert severity="error">An error occurred during data retrieval :(</Alert>
    )
  }

  return (
    <Grid container spacing={1} className={classes.queryResultContainer}>
      {formattedData &&
        formattedData.map((song) => (
          <SongSearchResult
            key={song.id}
            name={song.name}
            id={song.id}
            art={song.art}
            artist={song.artists[0].name}
            album={song.album}
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

export default SongSearchContainer
