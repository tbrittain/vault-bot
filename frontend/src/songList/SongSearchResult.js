import React from "react";
import songListStyles from "./SongListStyles";
import { Link } from "react-router-dom";
import extractUnderline from "../utils/underline";
import { Avatar, Box, Grid, Paper, Typography } from "@mui/material";

const SongSearchResult = (props) => {
  const classes = songListStyles();
  const { beginText, underline, endText } = extractUnderline(
    String(props.searchQuery),
    String(props.name)
  );

  return (
    <Grid
      item
      spacing={2}
      component={Link}
      to={`/songs/${props.id}`}
      style={{
        textDecoration: "none",
        width: "100%",
      }}
    >
      <Paper className={classes.songResultItem}>
        <div
          style={{
            padding: "0.5rem",
          }}
        >
          <Avatar
            alt={`${props.album} album art`}
            src={props.art}
            className={classes.searchResultArt}
          />
        </div>
        <div
          style={{
            margin: "auto auto",
            textAlign: "center",
            padding: "0.5rem",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              textDecoration: "none",
              lineHeight: "inherit",
              fontWeight: "fontWeightLight",
            }}
          >
            {beginText}
            <u>{underline}</u>
            {endText}
            <Box component="span" sx={{ fontWeight: "fontWeightLight" }}>
              {" "}
              by
            </Box>{" "}
            {props.artist}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textDecoration: "none",
              fontWeight: "fontWeightLight",
            }}
          >
            <Box component="span" sx={{ fontWeight: "fontWeightLight" }}>
              from the album
            </Box>{" "}
            {props.album}
          </Typography>
        </div>
      </Paper>
    </Grid>
  );
};

export default SongSearchResult;
