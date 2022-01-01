import React from "react";
import songStyles from "./SongStyles";
import { Avatar, Paper, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import GenreGrid from "../grids/GenreGrid";

const SongArtist = (props) => {
  const classes = songStyles();
  return (
    <Paper elevation={3} className={classes.artistContainer}>
      <div className={classes.containerItem}>
        <Avatar
          alt={props.name}
          src={props.art}
          className={classes.artistArt}
          component={Link}
          to={`/artists/${props.id}`}
          style={{
            marginBottom: "0.5rem",
          }}
        />
        <Typography
          variant="h6"
          className={classes.artistName}
          component={Link}
          to={`/artists/${props.id}`}
        >
          <i>{props.name}</i>
        </Typography>
      </div>
      <div className={`${classes.containerItem} ${classes.genreContainer}`}>
        <Typography
          variant="h6"
          style={{
            fontWeight: 300,
          }}
        >
          Genres
        </Typography>
        <GenreGrid genres={props.genres} />
      </div>
    </Paper>
  );
};

export default SongArtist;
