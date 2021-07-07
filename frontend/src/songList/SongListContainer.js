import React from 'react'
import {
  Typography
} from '@material-ui/core'
import SongViewer from './SongViewer'

const SongListContainer = () => {
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
