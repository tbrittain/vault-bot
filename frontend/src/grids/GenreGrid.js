import React from "react";
import { Link } from "react-router-dom";
import gridStyles from "./GridStyles";
import genreToMuiColor from "../utils/genreToMuiColor";
import {
  Button,
  ImageList,
  lighten,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const GenreGrid = (props) => {
  const classes = gridStyles();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery("(max-width:800px)");

  return (
    <div className={classes.gridContainer}>
      {props.genres !== undefined && (
        <ImageList
          className={classes.gridList}
          cols={
            isSmallScreen
              ? 2
              : props.genres.length < 4
              ? props.genres.length
              : 4
          }
        >
          {props.genres.map((genre) => ( // TODO: overflow is broken on song page
            <ImageList key={genre} className={classes.tile}>
              <Button
                variant="contained"
                size="large"
                className={classes.button}
                component={Link}
                to={`/genres/${genre}`}
                lang="en"
                sx={{
                  backgroundColor: genreToMuiColor(genre),
                  "&:hover": {
                    backgroundColor: lighten(genreToMuiColor(genre), 0.25),
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.getContrastText(
                      genreToMuiColor(genre)
                    ),
                  }}
                >
                  {genre}
                </Typography>
              </Button>
            </ImageList>
          ))}
        </ImageList>
      )}
      {typeof props.genres === "undefined" && (
        <Typography variant="subtitle1">
          No genres present for this artist :(
        </Typography>
      )}
    </div>
  );
};

export default GenreGrid;
