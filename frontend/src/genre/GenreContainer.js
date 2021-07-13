import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import { Alert } from '@material-ui/lab'
import {
  Typography,
  Paper,
  useTheme
} from '@material-ui/core'
import LoadingScreen from '../loading/LoadingScreen'
import ArtistGrid from '../grids/ArtistGrid'
import CountUpAnimation from '../effects/CountUpAnimation'
import genreStyles from './GenreStyles'
import genreToMuiColor from '../utils/genreToMuiColor'

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
  const theme = useTheme()
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
      <Paper
        className={classes.title}
        elevation={3}
        style={{
          backgroundColor: genreToMuiColor(genreName)
        }}
      >
        <Typography
          variant='h2'
          className={classes.genreTitle}
          style={{
            color: theme.palette.getContrastText(genreToMuiColor(genreName))
          }}
        >
          <i>{genreName}</i>
        </Typography>
        <Typography
          variant='h6'
          style={{
            fontWeight: 300,
            color: theme.palette.getContrastText(genreToMuiColor(genreName))
          }}
        >
          {formattedData &&
            'Total artists: '}
          {formattedData.length >= 20 &&
            <CountUpAnimation>{Number(formattedData.length)}</CountUpAnimation>}
          {formattedData.length < 20 &&
            formattedData.length}
        </Typography>
      </Paper>
      <ArtistGrid
        artists={formattedData}
      />
    </div>
  )
}

export default GenreContainer
