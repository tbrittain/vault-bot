import React from "react";
import { Avatar, Paper, Typography } from "@material-ui/core";
import ArtistAlbumSongs from "./ArtistAlbumSongs";
import artistStyles from "./ArtistStyles";

const ArtistAlbum = (props) => {
  const classes = artistStyles();
  const { name, art, songs } = props;
  const backgroundStyling = {
    backgroundImage: `url(${art})`,
    backgroundPosition: "center center",
    backgroundSize: "100vw 100vw",
    filter: "blur(20px)",
    WebkitFilter: "blur(20px)",
    overflow: "hidden",
    zIndex: 1,
  };
  return (
    <div className={classes.album}>
      <div
        className={`${classes.albumInner} ${classes.albumDetails}`}
        style={{
          zIndex: 2,
        }}
      >
        <div className={classes.albumName}>
          <Avatar
            src={art}
            alt={`${art} album art`}
            variant="square"
            className={classes.albumArt}
          />
          <Paper
            elevation={3}
            style={{
              width: "100%",
            }}
          >
            <Typography variant="subtitle1" className={classes.albumText}>
              {name}
            </Typography>
          </Paper>
        </div>
        <ArtistAlbumSongs songs={songs} />
      </div>
      <div className={classes.albumInner} style={backgroundStyling} />
    </div>
  );
};

export default ArtistAlbum;
