import React from 'react'
import {
  GridList,
  GridListTile,
  Button,
  Typography,
  useTheme
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import gridStyles from './GridStyles'
import genreToMuiColor from '../utils/genreToMuiColor'

const GenreGrid = (props) => {
  const classes = gridStyles()
  const theme = useTheme()
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
              style={{
                height: 'fit-content'
              }}
            >
              <div className={classes.buttonContent}>
                <Button
                  // color='secondary'
                  variant='contained'
                  size='small'
                  className={classes.button}
                  component={Link}
                  to={`/genres/${genre}`}
                  style={{
                    backgroundColor: genreToMuiColor(genre),
                    lineHeight: 'inherit',
                    justifyContent: 'left'
                  }}
                >
                  <div
                    style={{
                      width: '85%'
                    }}
                  >
                    <Typography
                      variant='body1'
                      style={{
                        textAlign: 'left',
                        color: theme.palette.getContrastText(genreToMuiColor(genre))
                      }}
                    >
                      {genre}
                    </Typography>
                  </div>
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
