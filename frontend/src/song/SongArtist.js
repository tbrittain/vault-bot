import React from 'react'
import songStyles from './SongStyles'
import { Paper, Avatar, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'
import GenreGrid from '../grids/GenreGrid'

const SongArtist = (props) => {
  const classes = songStyles()
  return (
    <Paper
      elevation={3}
      className={classes.artistContainer}
    >
      <div className={classes.containerItem}>
        <Avatar
          alt={props.name}
          src={props.art}
          className={classes.artistArt}
          component={Link}
          to={`/artists/${props.id}`}
        />
        <Typography
          variant='h6'
          className={classes.artistName}
          component={Link}
          to={`/artists/${props.id}`}
          style={{
            lineHeight: 'inherit'
          }}
        >
          {props.name}
        </Typography>
      </div>
      <div className={`${classes.containerItem} ${classes.genreContainer}`}>
        <Typography
          variant='h6'
        >
          Genres
        </Typography>
        <GenreGrid
          genres={props.genres}
        />
      </div>
    </Paper>
  )
}

export default SongArtist
