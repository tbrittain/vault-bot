import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import headerStyles from './HeaderStyles'
import VaultBotLogo from '../assets/VaultBotLogo.svg'
import { ColorModeContext } from '../themes/ThemeToggler'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material'

function Header() {
  const classes = headerStyles()
  const colorMode = useContext(ColorModeContext)
  const theme = useTheme()

  return (
    <header className={classes.header}>
      <AppBar position="fixed" className={classes.headerContainer}>
        <Toolbar className={classes.toolbar}>
          <Box component={Link} to="/" className={classes.titleContainer}>
            <img
              src={VaultBotLogo}
              alt="VaultBot logo"
              style={{
                height: '3.25rem',
              }}
            />
            <Typography
              variant="h6"
              className={classes.title}
              sx={{
                fontWeight: 'fontWeightBold',
              }}
            >
              <i
                style={{
                  fontWeight: theme.typography.fontWeightBold,
                }}
              >
                VaultBot
              </i>
            </Typography>
          </Box>
          <ButtonGroup
            variant="text"
            color="primary"
            aria-label="text primary button group"
            size="medium"
            className={classes.actionButtons}
          >
            <Button
              color="inherit"
              className={classes.menuButton}
              component={Link}
              to="/songs"
              sx={{
                fontWeight: 'fontWeightLight',
              }}
            >
              Songs
            </Button>
            <Button
              color="inherit"
              className={classes.menuButton}
              component={Link}
              to="/artists"
              sx={{
                fontWeight: 'fontWeightLight',
              }}
            >
              Artists
            </Button>
            <Button
              color="inherit"
              className={classes.menuButton}
              component={Link}
              to="/genres"
              sx={{
                fontWeight: 'fontWeightLight',
              }}
            >
              Genres
            </Button>
            <IconButton
              sx={{ ml: 1 }}
              onClick={colorMode.toggleColorMode}
              color="inherit"
            >
              {theme.palette.mode === 'dark' ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </IconButton>
          </ButtonGroup>
        </Toolbar>
      </AppBar>
    </header>
  )
}

export default Header
