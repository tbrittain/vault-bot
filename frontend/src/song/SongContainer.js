import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import {
  CircularProgress,
  Backdrop,
  Grid,
  Typography
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import SongDetails from './SongDetails'
import SongArtist from './SongArtist'

const QUERY = gql`
  query ($songId: String!) {
    getTrack(id: $songId) {
      name
      id
      album
      art
      previewUrl
      artist {
        id
        name
        art
        rank
        genres {
          genre
        }
      }
      details {
        length
        tempo
        danceability
        energy
        loudness
        acousticness
        instrumentalness
        liveness
        valence
      }
    }
  }
`

const SongContainer = () => {
  const { songId } = useParams()
  const { loading, error, data } = useQuery(
    QUERY,
    {
      variables: {
        songId
      }
    })

  let formattedData
  let artistGenres
  if (data) {
    formattedData = data
    formattedData = data.getTrack
    if (formattedData.artist.genres.length > 0) {
      artistGenres = formattedData.artist.genres
      artistGenres = artistGenres.map(genreObject => genreObject.genre)
      console.log(artistGenres)
    }
  }

  return (
    <div>
      <Typography variant='h1'>Song Details</Typography>
      {loading &&
        <Backdrop open>
          <CircularProgress />
        </Backdrop>}
      {error &&
        <Alert severity='error'>An error occurred during data retrieval :(</Alert>}
      {formattedData &&
        <Grid
          container
          direction='column'
          justify='space-evenly'
        >
          <SongDetails
            album={formattedData.album}
            name={formattedData.name}
            artistName={formattedData.artist.name}
            art={formattedData.art}
            songPreview={formattedData.previewUrl}
          />
          <Typography variant='h2'>Artist Preview</Typography>
          <SongArtist
            id={formattedData.artist.id}
            name={formattedData.artist.name}
            art={formattedData.artist.art}
            genres={artistGenres}
          />
        </Grid>}
    </div>
  )
}

export default SongContainer
