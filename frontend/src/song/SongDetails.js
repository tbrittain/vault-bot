import React, { useState } from 'react'
import SwipeableViews from 'react-swipeable-views'
import {
  Paper,
  Avatar,
  Typography,
  Box,
  AppBar,
  Tabs,
  Tab,
  useTheme,
  Button
} from '@material-ui/core'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import AlbumSongs from './AlbumSongs'
import SongChars from './SongCharacteristics'
import songStyles from './SongStyles'
import TabPanel from '../tabpanel/TabPanel'

const SongDetails = (props) => {
  const classes = songStyles()
  const theme = useTheme()
  const songLink = `spotify:track:${props.id}`

  const [value, setValue] = useState(0)
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  const handleChangeIndex = (index) => {
    setValue(index)
  }

  const playSound = () => {
    try {
      const soundFile = document.getElementById('songPreview')
      soundFile.play()
    } catch (err) { console.error(err) }
  }

  const stopSound = () => {
    try {
      const soundFile = document.getElementById('songPreview')
      soundFile.pause()
      soundFile.currentTime = 0
    } catch (err) { console.error(err) }
  }

  return (
    <Paper
      elevation={3}
      className={classes.outerContainer}
    >
      <AppBar
        position='static'
        className={classes.navBar}
      >
        {props.songPreview &&
          <audio
            src={props.songPreview}
            id='songPreview'
            loop
          />}
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label='Song details navbar'
          centered
        >
          <Tab
            label='Details'
          />
          <Tab
            label='Characteristics'
          />
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel
          value={value}
          index={0}
        >
          <div className={classes.innerContainer}>
            <div className={classes.containerItem}>
              {props.songPreview &&
                <Avatar
                  id='albumArt'
                  className={props.songPreview ? `${classes.albumArt} ${classes.albumArtRotate}` : classes.albumArt}
                  alt={props.album + ' album art'}
                  src={props.art}
                  variant='circle'
                  onMouseEnter={playSound}
                  onMouseLeave={stopSound}
                />}
              {!props.songPreview &&
                <Avatar
                  id='albumArt'
                  className={props.songPreview ? `${classes.albumArt} ${classes.albumArtRotate}` : classes.albumArt}
                  alt={props.album + ' album art'}
                  src={props.art}
                  variant='circle'
                />}
            </div>
            <div className={`${classes.containerItem} ${classes.songDescription}`}>
              <Typography
                variant='h4'
                style={{
                  lineHeight: 'inherit'
                }}
              >
                {props.name} <Box component='span' fontWeight='300'>by</Box> {props.artistName}
              </Typography>
              <Typography
                variant='h6'
                style={{
                  lineHeight: 'inherit',
                  paddingTop: 10
                }}
              >
                <Box component='span' fontWeight='300'>from the album</Box> {props.album}
              </Typography>
              <Button
                variant='contained'
                component='a'
                href={songLink}
                style={{
                  marginTop: 10,
                  backgroundColor: 'rgb(35, 207, 95)',
                  color: 'white'
                }}
              >
                Open on Spotify
                <OpenInNewIcon
                  style={{
                    paddingLeft: 4
                  }}
                />
              </Button>
            </div>
          </div>
          <div className={classes.innerContainer}>
            <AlbumSongs
              artistId={props.artistId}
              album={props.album}
            />
          </div>
        </TabPanel>
        <TabPanel
          value={value}
          index={1}
        >
          <SongChars
            details={props.details}
            songName={props.name}
          />
        </TabPanel>
      </SwipeableViews>
    </Paper>
  )
}

export default SongDetails
