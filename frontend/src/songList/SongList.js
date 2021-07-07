import React, { useState, useEffect } from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  Grid,
  CircularProgress
} from '@material-ui/core'
import songListStyles from './SongListStyles'
import SongPreview from './SongPreview'
import SongListController from './SongListController'

const QUERY = gql`
  query($limit: Int!, $offset: Int!) {
    getTracks(limit: $limit, offset: $offset) {
      name
      id
      art
      artist {
        name
      }
      album
    }
  }
`

const SongList = () => {
  const classes = songListStyles()
  const [page, setPage] = useState(0)
  const [results, setResults] = useState(null)

  const resultLimit = 50
  const resultOffset = resultLimit * page

  const { loading, error, data, refetch } = useQuery(
    QUERY,
    {
      variables: {
        limit: resultLimit,
        offset: resultOffset
      }
    }
  )

  return (
    <div className={classes.totalSongResults}>
      <Grid
        container
        spacing={1}
      >
        {loading &&
          <CircularProgress />}
      </Grid>
      <div className={classes.resultsController}>
        <SongListController />
      </div>
    </div>
  )

}

export default SongList
