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
        <Toolbar>
          <Box
            component={Link}
            to='/'
            style={{
              display: 'inline-flex',
              textDecoration: 'none'
            }}
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
            >
              <i>VaultBot</i>
            </Typography>
          </Box>
          <ButtonGroup
            variant='text'
            color='primary'
            aria-label='text primary button group'
            size='large'
            style={{
              position: 'absolute',
              float: 'right',
              right: 25
            }}
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
