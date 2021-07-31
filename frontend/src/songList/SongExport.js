import React, { useEffect, useState, useCallback } from 'react'
import { useQuery, gql } from '@apollo/client'
import { Alert, AlertTitle } from '@material-ui/lab'
import Spotify from '../utils/Spotify'
import {
  Avatar,
  TextField,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress
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
  const { songIds, setActiveStep, setSelectionModel } = props

  // state
  const [playlistName, setPlaylistName] = useState(
    localStorage.getItem('playlistName') || '' // eslint-disable-line
  )
  const [trackUris, setTrackUris] = useState([])
  const [spotifyResponseStatus, setSpotifyResponseStatus] = useState(null)
  const [exporting, setExporting] = useState(false)

  // form validation
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

  const cleanUpBeforeDismount = useCallback(() => {
    localStorage.removeItem('playlistName') // eslint-disable-line
    localStorage.removeItem('trackSelection') // eslint-disable-line
    localStorage.removeItem('exportStep') // eslint-disable-line
    setTrackUris([])
    setSelectionModel([])
  }, [setSelectionModel])

  let textFieldErrorMessage
  if (invalidNameLength) {
    textFieldErrorMessage = `Playlist name must be 100 characters or fewer (currently ${playlistName.length})`
  } else if (invalidNameChars) {
    textFieldErrorMessage = 'Please use alphanumerics/spaces only'
  }

  useEffect(() => {
    localStorage.setItem('exportStep', 1) // eslint-disable-line
    const cachedTrackSelection = localStorage.getItem('trackSelection').split(',') // eslint-disable-line
    setTrackUris(cachedTrackSelection)
  }, [])

  useEffect(() => {
    localStorage.setItem('playlistName', playlistName) // eslint-disable-line
  }, [playlistName])

  useEffect(() => { // this exits the component and into the success component
    if (spotifyResponseStatus === 201) {
      cleanUpBeforeDismount()
      setActiveStep(2)
    }
  }, [spotifyResponseStatus, setActiveStep, cleanUpBeforeDismount])

  const savePlaylist = async () => {
    setExporting(true)
    const save = await Spotify.savePlaylist(playlistName, trackUris)
    setExporting(false)
    setSpotifyResponseStatus(Number(save.status))
    // setTimeout(() => {
    //   setExporting(false)
    //   setSpotifyResponseStatus(201)
    // }, 3000)
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
        className={classes.songExportTitle}
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
        {exporting &&
          <LinearProgress
            color='secondary'
          />}
      </div>
      {spotifyResponseStatus && spotifyResponseStatus !== 201 &&
        <Alert
          open={spotifyResponseStatus && spotifyResponseStatus !== 201}
          elevation={8}
          severity='error'
        >
          <AlertTitle>Error</AlertTitle>
          Something went wrong with the playlist export. Try again. Sorry about that :(
        </Alert>}
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
