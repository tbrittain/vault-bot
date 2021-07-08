import React from 'react'
import {
  Typography,
  Paper
} from '@material-ui/core'
import aboutStyles from './AboutStyles'

const About = () => {
  const classes = aboutStyles()
  return (
    <Paper
      className={classes.aboutContainer}
    >
      <div
        style={{
          padding: 20
        }}
      >
        <Typography
          variant='h1'
          className={classes.title}
        >
          About VaultBot
        </Typography>
        <Typography
          paragraph
          variant='body1'
        >
          I create too many playlists. What usually happens is:
          I make a playlist,
          I add songs to the playlist,
          and I listen to the playlist for some amount of time.
          Inevitably, the playlist starts to become stale, so I consider it archived and move on to a new playlist ad infinitum.
          What if there were a playlist that didn’t become stale? I’m a fan of the Spotify-curated playlists and the similar ones for Spotify genres by EveryNoise, but my ideal playlist is one that I have control over as well.
          VaultBot is the solution to both of these problems. VaultBot is a Discord bot that moderates a dynamic and an archive playlist. When a user provides a Spotify track to VaultBot, it adds the song to both the dynamic and archive playlists. After two weeks, VaultBot removes the track from the dynamic playlist.
          Additionally, VaultBot keeps track of every song added and reports various statistics for each track in the form of an interactive table, some ‘high scores’, and more advanced statistical analyses.
          I created this project not only for my own sake, but also for it to be a new way to share and think about music with friends. If you are in a Discord server with VaultBot, you are welcome to add songs to the playlists. VaultBot is not currently available for public use, but may be one day.
          In the meantime, if you are able to make use of VaultBot, I hope it brings some new musical joy to your life. It sure has for me! :)
        </Typography>
      </div>

    </Paper>
  )
}

export default About
