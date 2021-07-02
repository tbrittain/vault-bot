import React from 'react'
import songStyles from './SongStyles'
import {
  BottomNavigation,
  BottomNavigationAction
} from '@material-ui/core'
import InfoIcon from '@material-ui/icons/Info'
import MusicNoteIcon from '@material-ui/icons/MusicNote'

const SongNav = (props) => {
  const classes = songStyles()
  return (
    <BottomNavigation
      className={classes.navText}
    >
      <BottomNavigationAction
        label='About'
        value='about'
        icon={<MusicNoteIcon />}
      />
      <BottomNavigationAction
        label='Details'
        value='details'
        icon={<InfoIcon />}
      />
    </BottomNavigation>
  )
}

export default SongNav
