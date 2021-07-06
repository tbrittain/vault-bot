import React from 'react'
import {
  Grid,
  Typography
} from '@material-ui/core'
import SongViewer from './SongViewer'
import songListStyles from './SongListStyles'

const SongListContainer = () => {
  const classes = songListStyles()
  return (
    <div>
      <Typography
        variant='h1'
      >
        Songs
      </Typography>
      <Typography
        variant='subtitle1'
      >
        Total list of all the songs tracked by VaultBot
      </Typography>
      <SongViewer />
    </div>
  )
}

export default SongListContainer
