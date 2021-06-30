import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import { CircularProgress, Backdrop, Grid } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import SongDetails from './SongDetails'

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
  if (data) {
    formattedData = data
    formattedData = data.getTrack
    console.log(formattedData)
  }

  return (
    <div>
      <h1>Song Details</h1>
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
          alignItems='center'
        >
          <SongDetails
            album={formattedData.album}
            name={formattedData.name}
            artistName={formattedData.artist.name}
            art={formattedData.art}
            songPreview={formattedData.previewUrl}
          />
        </Grid>}
    </div>
  )
}

export default SongContainer
