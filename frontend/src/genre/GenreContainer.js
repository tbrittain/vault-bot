import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import { Alert } from '@material-ui/lab'
import {
  Typography
} from '@material-ui/core'
import LoadingScreen from '../loading/LoadingScreen'
import ArtistGrid from '../grids/ArtistGrid'
import CountUpAnimation from '../effects/CountUpAnimation'
import genreStyles from './GenreStyles'

const QUERY = gql`
  query ($genreName: String!) {
    getArtistsFromGenre(genreName: $genreName) {
      name
      id
      art
    }
  }
`

const GenreContainer = () => {
  const classes = genreStyles()
  const { genreName } = useParams()
  const { loading, error, data } = useQuery(
    QUERY,
    {
      variables: {
        genreName
      }
    }
  )

  let formattedData
  let processing = true
  if (data) {
    formattedData = data.getArtistsFromGenre
    processing = false
  }

  if (loading || processing) {
    return (
      <LoadingScreen text='Loading genre...' />
    )
  }

  if (error || data === 'undefined') {
    return (
      <Alert severity='error'>An error occurred during data retrieval :(</Alert>
    )
  }

  return (
    <div>
      <Typography
        variant='h1'
      >
        Genre Details
      </Typography>
      <div className={classes.title}>
        <Typography
          variant='h2'
          className={classes.genreTitle}
        >
          <i>{genreName}</i>
        </Typography>
        <Typography
          variant='h6'
          style={{
            fontWeight: 300
          }}
        >
          {formattedData &&
            'Total artists: '}
          {formattedData.length >= 20 &&
            <CountUpAnimation>{Number(formattedData.length)}</CountUpAnimation>}
          {formattedData.length < 20 &&
            formattedData.length}
        </Typography>
      </div>
      <ArtistGrid
        artists={formattedData}
      />
    </div>
  )
}

export default GenreContainer
