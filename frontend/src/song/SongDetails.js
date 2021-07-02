import React, { useEffect } from 'react'
import { Paper, Avatar, Typography, Box } from '@material-ui/core'
import songStyles from './SongStyles'
import SongNav from './SongNav'

// TODO: use state to switch between the song about section + song details section
// may want to split this return method into two separate components
// https://material-ui.com/api/bottom-navigation/

const SongDetails = (props) => {
  const classes = songStyles()
  const playSound = () => {
    const soundFile = document.getElementById('songPreview')
    soundFile.play()
  }
  const stopSound = () => {
    const soundFile = document.getElementById('songPreview')
    soundFile.pause()
    soundFile.currentTime = 0
  }
  useEffect(() => {
    if (props.songPreview) {
      console.log(document.getElementById('albumArt'))
      document.getElementById('albumArt')
        .addEventListener('mouseover', playSound)
      document.getElementById('albumArt')
        .addEventListener('mouseout', stopSound)
    }
  }, [props])
  return (
    <Paper
      elevation={3}
      className={classes.outerContainer}
    >
      <div className={classes.innerContainer}>
        <div className={classes.containerItem}>
          <Avatar
            id='albumArt'
            className={props.songPreview ? `${classes.albumArt} ${classes.albumArtRotate}` : classes.albumArt}
            alt={props.album + ' album art'}
            src={props.art}
            variant='circle'
          />
        </div>
        {props.songPreview &&
          <audio
            src={props.songPreview}
            id='songPreview'
            loop
          />}
        <div className={`${classes.containerItem} ${classes.songDescription}`}>
          <Typography variant='h4'>{props.name} <Box component='span' fontWeight='300'>by</Box> {props.artistName}</Typography>
          <Typography variant='h6'><Box component='span' fontWeight='300'>from the album</Box> {props.album}</Typography>
        </div>
      </div>
      <div className={classes.songCharsContainer}>
        <SongNav />
      </div>
    </Paper>
  )
}

export default SongDetails
