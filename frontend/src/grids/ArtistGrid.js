import React from 'react'
import {
  Paper
} from '@material-ui/core'
import ArtistPreview from './ArtistPreview'
import gridStyles from './GridStyles'

const ArtistGrid = (props) => {
  const classes = gridStyles()
  const { artists } = props

  return (
    <Paper
      elevation={3}
      className={classes.artistGrid}
    >
      {artists.map(artist => (
        <ArtistPreview
          key={artist.id}
          id={artist.id}
          name={artist.name}
          art={artist.art}
        />
      ))}
    </Paper>
  )
}

export default ArtistGrid
