import React from 'react'
import {
  Typography
} from '@material-ui/core'
import GenreViewer from './GenreViewer'

const GenreListContainer = () => {
  return (
    <div>
      <Typography
        variant='h1'
      >
        Genres
      </Typography>
      <Typography
        variant='subtitle1'
      >
        Total list of all the artists tracked by VaultBot
      </Typography>
      <GenreViewer />
    </div>
  )
}

export default GenreListContainer
