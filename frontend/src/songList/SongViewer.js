import React, { useState } from 'react'
import {
  Paper,
  AppBar,
  Toolbar,
  InputBase,
  Popper,
  Fade,
  ClickAwayListener,
  Typography
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import songListStyles from './SongListStyles'
import SongSearchResult from './SongSearchResult'

const SongViewer = () => {
  const classes = songListStyles()
  const [search, setSearch] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)

  const handleChange = (event) => {
    setSearch(event.target.value)
    setAnchorEl(event.currentTarget)
  }

  const handleClickAway = (event) => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl && search.length > 3)

  return (
    <Paper
      elevation={3}
      className={classes.container}
    >
      <AppBar
        position='static'
        className={classes.navBar}
      >
        <Toolbar>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder='Search for a song...'
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
                      className={classes.queryResultContainer}
                      elevation={8}
                    >
                      {search.length > 3 &&
                        <SongSearchResult
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
    </Paper>
  )
}

export default SongViewer
