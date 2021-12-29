import React, { useState } from "react";
import SwipeableViews from "react-swipeable-views";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import AlbumSongs from "./AlbumSongs";
import SongChars from "./SongCharacteristics";
import songStyles from "./SongStyles";
import TabPanel from "../tabpanel/TabPanel";
import SimilarSongs from "./SimilarSongs";

const SongDetails = (props) => {
  const classes = songStyles();
  const theme = useTheme();
  const songLink = `spotify:track:${props.id}`;

  const [value, setValue] = useState(0);
  const [playing, setPlaying] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const playSound = () => {
    try {
      const soundFile = document.getElementById("songPreview");
      soundFile.play();
      setPlaying(true);
    } catch (err) {
      console.error(err);
    }
  };

  const stopSound = () => {
    try {
      const soundFile = document.getElementById("songPreview");
      soundFile.pause();
      soundFile.currentTime = 0;
      setPlaying(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Paper elevation={3} className={classes.outerContainer}>
      <AppBar position="static" className={classes.navBar}>
        {props.songPreview && (
          <audio src={props.songPreview} id="songPreview" loop />
        )}
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="Song details navbar"
          centered
        >
          <Tab label="Details" />
          <Tab label="Characteristics" />
          <Tab label="Similar Songs" />
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === "rtl" ? "x-reverse" : "x"}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        {/* TODO: split the index 0 tab panel into its own component*/}
        <TabPanel value={value} index={0}>
          <div className={classes.innerContainer}>
            <div className={classes.containerItem}>
              {props.songPreview && (
                <div
                  style={{
                    display: "grid",
                    gridTemplate: "1fr / 1fr",
                  }}
                >
                  <div
                    style={{
                      gridColumn: "1 / 1",
                      gridRow: "1 / 1",
                      display: "flex",
                      margin: "auto",
                      zIndex: 51,
                    }}
                  >
                    {!playing && (
                      <IconButton
                        size="medium"
                        color="primary"
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.4)",
                        }}
                        onClick={playSound}
                      >
                        <PlayArrowIcon fontSize="large" />
                      </IconButton>
                    )}
                    {playing && (
                      <IconButton
                        size="medium"
                        color="primary"
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.4)",
                        }}
                        onClick={stopSound}
                      >
                        <PauseIcon fontSize="large" />
                      </IconButton>
                    )}
                  </div>
                  <div
                    style={{
                      gridColumn: "1 / 1",
                      gridRow: "1 / 1",
                      zIndex: 50,
                    }}
                  >
                    <Avatar
                      id="albumArt"
                      className={
                        playing
                          ? `${classes.albumArt} ${classes.albumArtRotate}`
                          : classes.albumArt
                      }
                      alt={props.album + " album art"}
                      src={props.art}
                      variant="circle"
                    />
                  </div>
                </div>
              )}
              {!props.songPreview && (
                <Avatar
                  id="albumArt"
                  className={classes.albumArt}
                  alt={props.album + " album art"}
                  src={props.art}
                  variant="circle"
                />
              )}
            </div>
            <div
              className={`${classes.containerItem} ${classes.songDescription}`}
            >
              <Typography
                variant="h4"
                style={{
                  lineHeight: "inherit",
                }}
              >
                {props.name}{" "}
                <Box component="span" fontWeight="300">
                  by
                </Box>{" "}
                {props.artistName}
              </Typography>
              <Typography
                variant="h6"
                style={{
                  lineHeight: "inherit",
                  paddingTop: 10,
                }}
              >
                <Box component="span" fontWeight="300">
                  from the album
                </Box>{" "}
                {props.album}
              </Typography>
              <Button
                variant="contained"
                component="a"
                href={songLink}
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
          </div>
          <div className={classes.innerContainer}>
            <AlbumSongs artistId={props.artistId} album={props.album} />
          </div>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <SongChars details={props.details} songName={props.name} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <SimilarSongs songId={props.id} />
        </TabPanel>
      </SwipeableViews>
    </Paper>
  );
};

export default SongDetails;
