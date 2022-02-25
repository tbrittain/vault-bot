import React, { useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import headerStyles from './HeaderStyles'
import VaultBotLogo from '../assets/VaultBotLogo.svg'
import { ColorModeContext } from '../themes/ThemeToggler'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  ClickAwayListener,
  Fade,
  IconButton,
  Paper,
  Popper,
  Slider,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material'

function Header() {
  const classes = headerStyles()
  const colorMode = useContext(ColorModeContext)
  const theme = useTheme()

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)
  const id = open ? 'volume-popover' : undefined

  useEffect(() => {
    console.log(`open: ${open}`)
    console.log(`anchorEl: ${anchorEl}`)
  }, [open, anchorEl])

  // TODO: https://www.w3schools.com/jsref/prop_audio_volume.asp
  // https://mui.com/components/slider/

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
            <IconButton
              sx={{ ml: 1 }}
              color="inherit"
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <VolumeUpIcon />
            </IconButton>
            <ClickAwayListener
              onClickAway={() => {
                console.log('ClickAwayListener') // FIXME
                setAnchorEl(null)
              }}
            >
              <Popper
                placement="bottom-start"
                disablePortal={false}
                modifiers={{
                  flip: {
                    enabled: true,
                  },
                  preventOverflow: {
                    enabled: true,
                    boundariesElement: 'scrollParent',
                  },
                }}
                open={open}
                anchorEl={anchorEl}
                transition
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={350}>
                    <Paper elevation={0}>
                      <Slider
                        id={id}
                        orientation="vertical"
                        defaultValue={0.5}
                        valueLabelDisplay="auto"
                        step={0.1}
                        marks
                        min={0}
                        max={1}
                      />
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </ClickAwayListener>
          </ButtonGroup>
        </Toolbar>
      </AppBar>
    </header>
  )
}

export default Header
