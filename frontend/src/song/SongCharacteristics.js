import React from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  CircularProgress,
  Typography
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'

const QUERY = gql`
  query {
    getAvgTrackDetails {
      acousticness
      danceability
      energy
      instrumentalness
      length
      liveness
      loudness
      tempo
      valence
    }
  }
`
const SongChars = (props) => {
  const { loading, error, data } = useQuery(QUERY)

  return (
    <div>
      {loading &&
        <CircularProgress />}
      {error &&
        <Alert severity='error'>An error occurred during data retrieval :(</Alert>}
      {data &&
        <Typography>Average data retrieved</Typography>}
    </div>
  )
}

export default SongChars
