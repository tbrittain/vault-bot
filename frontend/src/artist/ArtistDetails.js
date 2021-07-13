import React from 'react'
import {
  Typography,
  Paper,
  Avatar
} from '@material-ui/core'
import CountUpAnimation from '../effects/CountUpAnimation'
import ArtistAlbums from './ArtistAlbums'
import artistStyles from './ArtistStyles'

const ArtistDetails = (props) => {
  const classes = artistStyles()
  return (
    <Paper
      elevation={3}
    >
      <div className={classes.artistTop}>
        <Avatar
          className={classes.artistArt}
          alt={`${props.name} artist art`}
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
            <i>{props.name}</i>
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
      </div>
      <ArtistAlbums
        albumSongs={props.albumSongs}
      />
    </Paper>
  )
}

export default ArtistDetails
