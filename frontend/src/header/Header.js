import React, { useContext } from "react";
import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import headerStyles from "./HeaderStyles";
import VaultBotLogo from "../assets/VaultBotLogo.svg";
import { ColorModeContext } from "../themes/ThemeToggler";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";

function Header() {
  const classes = headerStyles();
  const colorMode = useContext(ColorModeContext);
  const theme = useTheme();

  return (
    <header className={classes.header}>
      <AppBar position="fixed" className={classes.headerContainer}>
        <Toolbar className={classes.toolbar}>
          <Box component={Link} to="/" className={classes.titleContainer}>
            <img
              src={VaultBotLogo}
              alt="VaultBot logo"
              style={{
                height: "3.25rem",
              }}
            />
            <Typography
              variant="h6"
              className={classes.title}
              style={{
                fontWeight: 800,
              }}
            >
              <i
                style={{
                  fontWeight: 800,
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
            size="large"
            className={classes.actionButtons}
          >
            <Button
              color="inherit"
              className={classes.menuButton}
              component={Link}
              to="/songs"
              style={{
                padding: 5,
              }}
            >
              Songs
            </Button>
            <Button
              color="inherit"
              className={classes.menuButton}
              component={Link}
              to="/artists"
              style={{
                padding: 5,
              }}
            >
              Artists
            </Button>
            <Button
              color="inherit"
              className={classes.menuButton}
              component={Link}
              to="/genres"
              style={{
                padding: 5,
              }}
            >
              Genres
            </Button>
            <IconButton
              sx={{ ml: 1 }}
              onClick={colorMode.toggleColorMode}
              color="inherit"
            >
              {theme.palette.mode === "dark" ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </IconButton>
          </ButtonGroup>
        </Toolbar>
      </AppBar>
    </header>
  );
}

export default Header;
