import React from "react";
import { Card, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import artistStyles from "./ArtistStyles";

const ArtistAlbumSong = (props) => {
  const classes = artistStyles();
  const { id, name } = props;
  return (
    <Card
      className={classes.artistSongCard}
      component={Link}
      to={`/songs/${id}`}
    >
      <Typography
        variant="body1"
        style={{
          fontWeight: 300,
        }}
        className={classes.artistSongName}
      >
        {name}
      </Typography>
    </Card>
  );
};

export default ArtistAlbumSong;
