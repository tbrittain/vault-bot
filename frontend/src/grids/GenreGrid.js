import React from 'react'
import {
  GridList,
  GridListTile,
  Button,
  Typography
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import gridStyles from './GridStyles'

const GenreGrid = (props) => {
  const classes = gridStyles()
  return (
    <div className={classes.gridContainer}>
      {typeof props.genres !== 'undefined' &&
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
                  style={{
                    lineHeight: 'inherit'
                  }}
                >
                  <Typography
                    variant='body1'
                  >
                    {genre}
                  </Typography>
                </Button>
              </div>
            </GridListTile>
          ))}
        </GridList>}
      {typeof props.genres === 'undefined' &&
        <Typography
          variant='subtitle1'
        >
          No genres present for this artist :(
        </Typography>}
    </div>
  )
}

export default GenreGrid
