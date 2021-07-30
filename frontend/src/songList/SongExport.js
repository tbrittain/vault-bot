import React, { useEffect, useState } from 'react'
import { useQuery, gql } from '@apollo/client'
import { Alert } from '@material-ui/lab'
import Spotify from '../utils/Spotify'
import {
  Avatar,
  TextField,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Grid,
  IconButton
} from '@material-ui/core'
import CancelIcon from '@material-ui/icons/Cancel'
import RestoreIcon from '@material-ui/icons/Restore'
import songListStyles from './SongListStyles'

const QUERY = gql`
  query {
    getTracks {
      name
      id
      art
      album
    }
  }
`

const SongExport = (props) => {
  const classes = songListStyles()
  const { songIds } = props
  const [playlistName, setPlaylistName] = useState('')
  const [trackUris, setTrackUris] = useState([])
  const invalidNameLength = playlistName.length > 100
  const invalidNameChars = /[^a-zA-Z 0-9]+/g.test(playlistName)
  const invalidName = invalidNameLength || invalidNameChars
  const invalidPlaylistLength = trackUris.length === 0
  const invalidExport = invalidName || playlistName.length === 0 || invalidPlaylistLength

  const { loading, error, data } = useQuery(QUERY)

  const handlePlaylistNameChange = (event) => {
    setPlaylistName(event.target.value)
  }

  const handleRemoveSong = (event) => {
    setTrackUris(trackUris.filter(track => track !== event.currentTarget.value))
  }

  const handleRestore = (event) => {
    setTrackUris(songIds)
  }

  let textFieldErrorMessage
  if (invalidNameLength) {
    textFieldErrorMessage = `Playlist name must be 100 characters or fewer (currently ${playlistName.length})`
  } else if (invalidNameChars) {
    textFieldErrorMessage = 'Please use alphanumerics/spaces only'
  }

  useEffect(() => {
    setTrackUris(songIds)
  }, [songIds])

  const savePlaylist = () => {
    Spotify.savePlaylist(playlistName, trackUris)
  }
  let processing = true
  let formattedData
  if (data) {
    formattedData = data.getTracks.filter(result => trackUris.includes(result.id))
    processing = false
  }
  if (loading || processing) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
          '& > * + *': {
            margin: 'auto auto'
          }
        }}
      >
        <CircularProgress />
        <Typography
          variant='body2'
          style={{
            marginTop: 5
          }}
        >
          Loading tracks to export...
        </Typography>
      </div>
    )
  }

  if (error) {
    return (
      <Alert severity='error'>An error occurred during data retrieval :(</Alert>
    )
  }

  return (
    <Paper
      className={classes.exportContainer}
      elevation={3}
    >
      <Typography
        variant='h2'
      >
        Export to Spotify
      </Typography>
      <div
        className={classes.userPlaylist}
      >
        <TextField
          required
          error={invalidName}
          className={classes.playlistInput}
          label='Playlist Name'
          placeholder='My playlist'
          variant='outlined'
          color='primary'
          size='normal'
          InputLabelProps={{ shrink: true }} // TODO: implement this to fix the search bar formatting problems
          fullWidth
          helperText={textFieldErrorMessage}
          value={playlistName}
          onChange={handlePlaylistNameChange}
        />
        <Button
          variant='contained'
          disabled={invalidExport}
          color='primary'
          onClick={savePlaylist}
        >
          Export to Spotify
        </Button>
      </div>
      <div
        style={{
          width: '100%',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Typography
            variant='h6'
            style={{
              fontWeight: 300
            }}
          >
            Songs to export
          </Typography>
          {trackUris.length !== songIds.length && trackUris.length > 0 &&
            <IconButton>
              <RestoreIcon
                color='primary'
                fontSize='medium'
                onClick={handleRestore}
              />
            </IconButton>}
        </div>
        {invalidPlaylistLength &&
          <Alert severity='error'>
            All tracks have been removed! Revert to the original track selections?
            <IconButton size='small'>
              <RestoreIcon
                color='error'
                onClick={handleRestore}
              />
            </IconButton>
          </Alert>}
        <Grid
          className={classes.songListToExport}
          container
          justifyContent='center'
        >
          {formattedData.map(song => {
            return (
              <Paper
                className={classes.songToExport}
                key={song.id}
                square={false}
                elevation={1}
              >
                <Avatar
                  src={song.art}
                  alt={song.album}
                  style={{
                    margin: 3
                  }}
                />
                <Typography
                  variant='body2'
                  style={{
                    marginRight: 3
                  }}
                >
                  {song.name}
                </Typography>
                <IconButton
                  size='small'
                  value={song.id}
                  onClick={handleRemoveSong}
                >
                  <CancelIcon
                    color='secondary'
                  />
                </IconButton>
              </Paper>
            )
          })}
        </Grid>
      </div>
    </Paper>
  )
}

export default SongExport
