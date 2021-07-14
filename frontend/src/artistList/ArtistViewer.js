import React, { useState } from 'react'
import {
  Paper,
  AppBar,
  Toolbar,
  InputBase,
  Popper,
  Fade,
  ClickAwayListener
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import artistListStyles from './ArtistListStyles'
import ArtistSearchContainer from './ArtistSearchContainer'
import ArtistList from './ArtistList'

const ArtistViewer = () => {
  const classes = artistListStyles()
  const [search, setSearch] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)

  const handleChange = (event) => {
    setSearch(event.target.value)
    setAnchorEl(event.currentTarget)
  }

  const handleClickAway = (event) => {
    setAnchorEl(null)
    setSearch('')
  }

  const minSearchLength = 3
  const open = Boolean(anchorEl && search.length >= minSearchLength)

  return (
    <Paper
      elevation={3}
    >
      <AppBar
        position='static'
      >
        <Toolbar>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder='Search for an artist...'
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput
              }}
              value={search}
              onChange={handleChange}
            />
            <ClickAwayListener onClickAway={handleClickAway}>
              <Popper
                placement='bottom-start'
                disablePortal={false}
                modifiers={{
                  flip: {
                    enabled: true
                  },
                  preventOverflow: {
                    enabled: true,
                    boundariesElement: 'scrollParent'
                  }
                }}
                open={open}
                anchorEl={anchorEl}
                transition
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={350}>
                    <Paper
                      elevation={0}
                      style={{
                        background: 'none'
                      }}
                    >
                      {search.length >= minSearchLength &&
                        <ArtistSearchContainer
                          searchQuery={search}
                        />}
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </ClickAwayListener>
          </div>
        </Toolbar>
      </AppBar>
      <ArtistList />
    </Paper>
  )
}

export default ArtistViewer
