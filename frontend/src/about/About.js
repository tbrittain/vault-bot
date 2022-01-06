import React from "react";
import VaultBotLogo from "../assets/VaultBotLogo.svg";
import aboutStyles from "./AboutStyles";
import { Box, Paper, Typography } from "@mui/material";

const BEGIN_DATE_MS = 1601938620;

const About = () => {
  const classes = aboutStyles();
  const beginDate = new Date(BEGIN_DATE_MS * 1000);
  const now = new Date();
  const difference = now - beginDate;

  return (
    <Paper className={classes.aboutContainer}>
      <div
        style={{
          padding: 20,
        }}
      >
        <Typography variant="h1" className={classes.title}>
          About VaultBot
        </Typography>
        <div className={classes.aboutContent}>
          <img
            src={VaultBotLogo}
            alt="VaultBot logo"
            className={classes.vaultBotLogo}
          />
          <article>
            <Typography paragraph variant="body1" className={classes.paragraph}>
              I create too many playlists. What usually happens is: I make a
              playlist, I add songs to the playlist, and I listen to the
              playlist for some amount of time.
            </Typography>
            <Typography paragraph variant="body1" className={classes.paragraph}>
              Inevitably, the playlist starts to become stale, so I consider it
              archived and move on to a new playlist ad infinitum. What if there
              were a playlist that didn’t become stale? I’m a fan of the
              Spotify-curated playlists and the similar ones for Spotify genres
              by EveryNoise, but my ideal playlist is one that I have control
              over as well.
            </Typography>
            <Typography paragraph variant="body1" className={classes.paragraph}>
              VaultBot is the solution to both of these problems. VaultBot is a
              Discord bot that at its core moderates a dynamic and an archive
              playlist. When a user provides a Spotify track to VaultBot, it
              adds the song to both the dynamic and archive playlists. After two
              weeks, VaultBot removes the track from the dynamic playlist.
            </Typography>
            <Typography paragraph variant="body1" className={classes.paragraph}>
              Additionally, VaultBot keeps track of every song added and reports
              various statistics for each track in the form of interactive
              tables, some ‘high scores’, and more advanced statistical
              analyses.
              <Box
                style={{
                  display: "inline",
                  color: "grey",
                  marginLeft: "1ch",
                  marginRight: "1ch",
                }}
              >
                Note: song/artist/genre rankings are currently in the works and
                will be implemented alongside the other historical tracking
                features (TBA).
              </Box>
            </Typography>
            <Typography paragraph variant="body1" className={classes.paragraph}>
              I created this project not only for my own sake, but also for it
              to be a new way to share and think about music with friends. If
              you are in a Discord server with VaultBot, you are welcome to add
              songs to the playlists. VaultBot is not currently available for
              public use, but may be one day. In the meantime, if you are able
              to make use of VaultBot, I hope it brings some new musical joy to
              your life. It sure has for me! :)
            </Typography>
            <Typography
              variant="body2"
              style={{
                color: "grey",
              }}
            >
              Days since the first song was added to VaultBot:{" "}
              {Math.floor(difference / (1000 * 60 * 60 * 24)).toLocaleString()}
            </Typography>
            <Typography
              variant="body2"
              style={{
                color: "grey",
              }}
            >
              If you want to see a snapshot of the legacy website, you can do so
              <a
                href="https://web.archive.org/web/20210618053632/http://vaultbot.tbrittain.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "grey",
                  paddingLeft: "0.5ch",
                }}
              >
                here.
              </a>
            </Typography>
          </article>
        </div>
      </div>
    </Paper>
  );
};

export default About;
