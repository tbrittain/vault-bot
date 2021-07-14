import React from 'react'
import {
  Typography
} from '@material-ui/core'
import ArtistViewer from './ArtistViewer'

const ArtistListContainer = () => {
  return (
    <div>
      <Typography
        variant='h1'
      >
        Artists
      </Typography>
      <Typography
        variant='subtitle1'
      >
        Total list of all the artists tracked by VaultBot
      </Typography>
      <ArtistViewer />
    </div>
  )
}

export default ArtistListContainer
