import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import genreListStyles from "./GenreListStyles";
import GenreSearchContainer from "./GenreSearchContainer";
import GenreList from "./GenreList";
import useDebounce from "../hooks/useDebounce";
import {
  AppBar,
  ClickAwayListener,
  Fade,
  InputBase,
  Paper,
  Popper,
  Toolbar,
} from "@mui/material";

const GenreViewer = () => {
  const classes = genreListStyles();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleChange = (event) => {
    setSearch(event.target.value);
    setAnchorEl(event.currentTarget);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
    setSearch("");
  };

  const minSearchLength = 3;
  const open = Boolean(anchorEl && search.length >= minSearchLength);

  return (
    <Paper elevation={3}>
      <AppBar position="static">
        <Toolbar>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              InputLabelProps={{ shrink: true }}
              placeholder="Search for a genre..."
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              value={search}
              onChange={handleChange}
            />
            <ClickAwayListener onClickAway={handleClickAway}>
              <Popper
                placement="bottom-start"
                disablePortal={false}
                modifiers={{
                  flip: {
                    enabled: true,
                  },
                  preventOverflow: {
                    enabled: true,
                    boundariesElement: "scrollParent",
                  },
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
                        background: "none",
                      }}
                    >
                      {debouncedSearch.length >= minSearchLength && (
                        <GenreSearchContainer searchQuery={debouncedSearch} />
                      )}
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </ClickAwayListener>
          </div>
        </Toolbar>
      </AppBar>
      <GenreList />
    </Paper>
  );
};

export default GenreViewer;
