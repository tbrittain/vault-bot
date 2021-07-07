import React from 'react'
import {
  Typography,
  Grid,
  Avatar,
  Paper,
  Box
} from '@material-ui/core'
import songListStyles from './SongListStyles'
import { Link } from 'react-router-dom'
import extractUnderline from '../utils/underline'

const SongSearchResult = (props) => {
  const classes = songListStyles()
  const { beginText, underline, endText } = extractUnderline(String(props.searchQuery), String(props.name))

  return (
    <Grid
      item
      spacing={2}
      component={Link}
      to={`/songs/${props.id}`}
      style={{
        textDecoration: 'none',
        width: '100%'
      }}
    >
      <Paper
        className={classes.songResultItem}
      >
        <div
          style={{
            padding: '0.5rem'
          }}
        >
          <Avatar
            alt={`${props.album} album art`}
            src={props.art}
            className={classes.searchResultArt}
          />
        </div>
        <div
          style={{
            margin: 'auto auto',
            textAlign: 'center',
            padding: '0.5rem'
          }}
        >
          <Typography
            variant='subtitle1'
            style={{
              textDecoration: 'none',
              lineHeight: 'inherit'
            }}
          >
            {beginText}<u>{underline}</u>{endText}
            <Box component='span' fontWeight='300'> by</Box> {props.artist}
          </Typography>
          <Typography
            variant='body2'
            style={{
              textDecoration: 'none'
            }}
          >
            <Box component='span' fontWeight='300'>from the album</Box> {props.album}
          </Typography>
        </div>
      </Paper>
    </Grid>
  )
}

export default SongSearchResult
