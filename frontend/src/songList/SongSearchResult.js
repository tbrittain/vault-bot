import React, { useEffect } from 'react'
import songListStyles from './SongListStyles'
import { useQuery, gql } from '@apollo/client'
import {
  CircularProgress,
  Typography
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'

const QUERY = gql`
  query ($searchQuery: String!) {
    findTracksLike(searchQuery: $searchQuery) {
      name
      id
      art
      artistId
      artist {
        name
      }
    }
  }
`

const SongSearchResult = (props) => {
  const { searchQuery } = props
  const { loading, error, data } = useQuery(
    QUERY,
    {
      variables: {
        searchQuery
      }
    }
  )
  console.log(data)
  return (
    <div>
      {loading &&
        <CircularProgress />}
      {error &&
        <Alert severity='error'>An error occurred during data retrieval :(</Alert>}
      {data &&
        <Typography variant='h6'>Data retrieved</Typography>}
    </div>
  )
}

export default SongSearchResult
