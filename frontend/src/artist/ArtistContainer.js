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

const QUERY = gql`
  query ($artistId: String!){
    getArtist(id: $artistId) {
      name
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
  const { loading, error, data } = useQuery(
    QUERY,
    {
      variables: {
        artistId
      }
    })

  console.log(data)

  return (
    <div>
      Test
    </div>
  )
}

export default ArtistContainer
