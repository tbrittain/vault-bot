import React from 'react'
import {
  Typography,
  Paper,
  Avatar,
  Button
} from '@material-ui/core'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import CountUpAnimation from '../effects/CountUpAnimation'
import ArtistAlbums from './ArtistAlbums'
import artistStyles from './ArtistStyles'

const ArtistDetails = (props) => {
  const artistLink = `spotify:artist:${props.id}`
  const classes = artistStyles()
  return (
    <Paper
      elevation={3}
    >
      <div className={classes.artistTop}>
        <Avatar
          className={classes.artistArt}
          alt={props.name}
          src={props.artistArt}
        />
        <div
          style={{
            width: '75%'
          }}
        >
          <Typography
            variant='h2'
            className={classes.artistName}
          >
            <i
              style={{
                textAlign: 'center'
              }}
            >
              {props.name}
            </i>
          </Typography>
        </div>
        <Typography
          variant='subtitle1'
        >
          {Number(props.numSongs) >= 20 &&
            <CountUpAnimation>{Number(props.numSongs)}</CountUpAnimation>}
          {Number(props.numSongs) < 20 &&
            Number(props.numSongs)}
          {Number(props.numSongs) > 1 &&
            ' unique songs'}
          {Number(props.numSongs) === 1 &&
            ' unique song'}
        </Typography>
        <Button
          variant='contained'
          component='a'
          href={artistLink}
          style={{
            marginTop: 10,
            backgroundColor: 'rgb(35, 207, 95)',
            color: 'white'
          }}
        >
          Open on Spotify
          <OpenInNewIcon
            style={{
              paddingLeft: 4
            }}
          />
        </Button>
      </div>
      <ArtistAlbums
        albumSongs={props.albumSongs}
      />
    </Paper>
  )
}

export default ArtistDetails
