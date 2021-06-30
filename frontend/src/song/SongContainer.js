import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import { CircularProgress, Backdrop } from '@material-ui/core'

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

  console.log(data)
  return (
    <div>
      <h1>Song Details</h1>
      {loading &&
        <Backdrop open>
          <CircularProgress />
        </Backdrop>
      }
      {error &&
        <p>An error occurred :(</p>
      }
      {data &&
        <p>Data was retrieved!</p>
      }
    </div>
  )
}

export default SongContainer
