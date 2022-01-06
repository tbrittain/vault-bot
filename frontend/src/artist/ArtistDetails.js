import React from "react";
import CountUpAnimation from "../effects/CountUpAnimation";
import ArtistAlbums from "./ArtistAlbums";
import artistStyles from "./ArtistStyles";
import { Avatar, Button, Paper, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const ArtistDetails = (props) => {
  const artistLink = `spotify:artist:${props.id}`;
  const classes = artistStyles();
  return (
    <Paper elevation={3}>
      <div className={classes.artistTop}>
        <Avatar
          className={classes.artistArt}
          alt={props.name}
          src={props.artistArt}
        />
        <div
          style={{
            width: "75%",
          }}
        >
          <Typography variant="h2" className={classes.artistName}>
            <i
              style={{
                textAlign: "center",
              }}
            >
              {props.name}
            </i>
          </Typography>
        </div>
        <Typography variant="subtitle1" className={classes.artistNumSongs}>
          {Number(props.numSongs) >= 20 && (
            <CountUpAnimation>{Number(props.numSongs)}</CountUpAnimation>
          )}
          {Number(props.numSongs) < 20 && Number(props.numSongs)}
          {Number(props.numSongs) > 1 && " unique songs"}
          {Number(props.numSongs) === 1 && " unique song"}
        </Typography>
        <Button
          variant="contained"
          component="a"
          href={artistLink}
          style={{
            marginTop: 10,
            backgroundColor: "rgb(35, 207, 95)",
            color: "white",
          }}
        >
          Open on Spotify
          <OpenInNewIcon
            style={{
              paddingLeft: 4,
            }}
          />
        </Button>
      </div>
      <ArtistAlbums albumSongs={props.albumSongs} />
    </Paper>
  );
};

export default ArtistDetails;
