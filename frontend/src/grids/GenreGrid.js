import React from 'react'
import {
  GridList,
  GridListTile,
  Button
} from '@material-ui/core'
import MusicNoteIcon from '@material-ui/icons/MusicNote'
import { Link } from 'react-router-dom'
import gridStyles from './GridStyles'

const GenreGrid = (props) => {
  const classes = gridStyles()
  return (
    <div className={classes.gridContainer}>
      <GridList
        className={classes.gridList}
        cols={props.genres.length < 4 ? props.genres.length : 4}
      >
        {props.genres.map(genre => (
          <GridListTile
            key={genre}
            className={classes.tile}
          >
            <div className={classes.buttonContent}>
              <Button
                color='secondary'
                variant='contained'
                className={classes.button}
                component={Link}
                to={`/genres/${genre}`}
              >
                {genre}
                <MusicNoteIcon />
              </Button>
            </div>
          </GridListTile>
        ))}
      </GridList>
    </div>
  )
}

export default GenreGrid
