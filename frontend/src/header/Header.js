import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  ButtonGroup
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import headerStyles from './HeaderStyles'

function Header () {
  const classes = headerStyles()
  return (
    <header className={classes.header}>
      <AppBar
        position='fixed'
        className={classes.headerContainer}
      >
        <Toolbar>
          <Typography
            variant='h6'
            className={classes.title}
            component={Link}
            to='/'
          >
            <i>VaultBot</i>
          </Typography>
          <ButtonGroup
            variant='text'
            color='primary'
            aria-label='text primary button group'
            size='large'
          >
            <Button
              color='inherit'
              className={classes.menuButton}
              component={Link}
              to='/songs'
            >
              Songs
            </Button>
            <Button
              color='inherit'
              className={classes.menuButton}
              component={Link}
              to='/artists'
            >
              Artists
            </Button>
            <Button
              color='inherit'
              className={classes.menuButton}
              component={Link}
              to='/genres'
            >
              Genres
            </Button>
          </ButtonGroup>
        </Toolbar>
      </AppBar>
    </header>
  )
}

export default Header
