import React from "react";
import { Card, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import songStyles from "./SongStyles";

const AlbumSong = (props) => {
  const classes = songStyles();
  const { art, songId, name } = props;

  const backgroundStyling = {
    backgroundImage: `url(${art})`,
    backgroundPosition: "center center",
    backgroundSize: "10vw 10vw",
    filter: "blur(20px)",
    WebkitFilter: "blur(20px)",
    overflow: "hidden",
    zIndex: -1,
  };

  return (
    <Card
      className={classes.albumSongCard}
      style={{
        background: "none",
        textDecoration: "none",
      }}
      component={Link}
      to={`/songs/${songId}`}
    >
      <div className={classes.albumInner}>
        <Typography className={classes.albumText} variant="subtitle1">
          {name}
        </Typography>
      </div>
      <div className={classes.albumInner} style={backgroundStyling} />
    </Card>
  );
};

export default AlbumSong;
