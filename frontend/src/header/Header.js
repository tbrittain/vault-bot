import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  ButtonGroup,
  Box
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import headerStyles from './HeaderStyles'
import VaultBotLogo from '../assets/VaultBotLogo.svg'

function Header () {
  const classes = headerStyles()
  return (
    <header className={classes.header}>
      <AppBar
        position='fixed'
        className={classes.headerContainer}
      >
        <Toolbar
          className={classes.toolbar}
        >
          <Box
            component={Link}
            to='/'
            className={classes.titleContainer}
          >
            <img
              src={VaultBotLogo}
              alt='VaultBot logo'
              style={{
                height: '3.25rem'
              }}
            />
            <Typography
              variant='h6'
              className={classes.title}
              style={{
                fontWeight: 800
              }}
            >
              <i
                style={{
                  fontWeight: 800
                }}
              >
                VaultBot
              </i>
            </Typography>
          </Box>
          <ButtonGroup
            variant='text'
            color='primary'
            aria-label='text primary button group'
            size='large'
            className={classes.actionButtons}
          >
            <Button
              color='inherit'
              className={classes.menuButton}
              component={Link}
              to='/songs'
              style={{
                padding: 5
              }}
            >
              Songs
            </Button>
            <Button
              color='inherit'
              className={classes.menuButton}
              component={Link}
              to='/artists'
              style={{
                padding: 5
              }}
            >
              Artists
            </Button>
            <Button
              color='inherit'
              className={classes.menuButton}
              component={Link}
              to='/genres'
              style={{
                padding: 5
              }}
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
