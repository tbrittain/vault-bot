import React from 'react'
import { useParams } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'
import LoadingScreen from '../loading/LoadingScreen'
import ArtistDetails from './ArtistDetails'
import GenreGrid from '../grids/GenreGrid'
import ArtistBio from './ArtistBio'
import { Alert, Grid, Paper, Typography } from '@mui/material'

const QUERY = gql`
  query ($artistId: String!) {
    getArtist(id: $artistId) {
      name
      id
      art
      genres {
        genre
      }
      songs {
        name
        id
        art
        album
      }
    }
  }
`

const ArtistContainer = () => {
  const { artistId } = useParams()
  const { loading, error, data } = useQuery(QUERY, {
    variables: {
      artistId,
    },
  })

  let processing = true
  const formattedData = {}
  if (data) {
    const albumSongs = {}
    for (const song of data.getArtist.songs) {
      if (!Object.keys(albumSongs).includes(song.album)) {
        albumSongs[song.album] = {
          name: song.album,
          art: song.art,
          songs: [
            {
              name: song.name,
              id: song.id,
            },
          ],
        }
      } else {
        albumSongs[song.album].songs.push({
          name: song.name,
          id: song.id,
        })
      }
    }
    formattedData.artist = data.getArtist.name
    formattedData.art = data.getArtist.art
    formattedData.genres = data.getArtist.genres.map((genre) => genre.genre)
    formattedData.albumSongs = albumSongs
    formattedData.numSongs = data.getArtist.songs.length
    processing = false
  }

  if (loading || processing) {
    return <LoadingScreen text="Loading artist..." />
  }

  if (error) {
    return (
      <Alert severity="error">An error occurred during data retrieval :(</Alert>
    )
  }

  return (
    <>
      <Grid container direction="column" justify="space-evenly">
        <Typography variant="h1">Artist Details</Typography>
        <ArtistDetails
          name={formattedData.artist}
          albumSongs={formattedData.albumSongs}
          artistArt={formattedData.art}
          numSongs={formattedData.numSongs}
          id={artistId}
        />
        <Typography variant="h1">Artist Genres</Typography>
        <Paper elevation={3}>
          <GenreGrid genres={formattedData.genres} />
        </Paper>
        <ArtistBio artistId={artistId} />
      </Grid>
    </>
  )
}

export default ArtistContainer
