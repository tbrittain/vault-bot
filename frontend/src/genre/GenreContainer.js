import React from 'react'
import { useParams } from 'react-router-dom'
import { gql, useQuery } from '@apollo/client'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import LoadingScreen from '../loading/LoadingScreen'
import ArtistGrid from '../grids/ArtistGrid'
import CountUpAnimation from '../effects/CountUpAnimation'
import genreStyles from './GenreStyles'
import genreToMuiColor from '../utils/genreToMuiColor'
import { Alert, Button, Paper, Typography, useTheme } from '@mui/material'

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
  const { loading, error, data } = useQuery(QUERY, {
    variables: {
      genreName,
    },
  })

  let formattedData
  let processing = true
  if (data) {
    formattedData = data.getArtistsFromGenre
  }

  let everyNoiseGenre = genreName
  everyNoiseGenre = everyNoiseGenre.replaceAll(' ', '')
  everyNoiseGenre = everyNoiseGenre.replaceAll('&', '')
  everyNoiseGenre = everyNoiseGenre.replaceAll('-', '')
  const everyNoiseLink = `https://everynoise.com/engenremap-${everyNoiseGenre}.html`
  processing = false

  if (loading || processing) {
    return <LoadingScreen text="Loading genre..." />
  }

  if (error || data === 'undefined') {
    return (
      <Alert severity="error">An error occurred during data retrieval :(</Alert>
    )
  }

  return (
    <>
      <Typography variant="h1">Genre Details</Typography>
      <Paper
        className={classes.title}
        elevation={3}
        style={{
          backgroundColor: genreToMuiColor(genreName),
        }}
      >
        <Typography
          variant="h2"
          className={classes.genreTitle}
          style={{
            color: theme.palette.getContrastText(genreToMuiColor(genreName)),
          }}
        >
          <i>{genreName}</i>
        </Typography>
        <Typography
          variant="h6"
          style={{
            fontWeight: theme.typography.fontWeightBold,
            color: theme.palette.getContrastText(genreToMuiColor(genreName)),
          }}
        >
          {formattedData && 'Total artists: '}
          {formattedData.length >= 20 && (
            <CountUpAnimation>{Number(formattedData.length)}</CountUpAnimation>
          )}
          {formattedData.length < 20 && formattedData.length}
        </Typography>
        <Button
          variant="outlined"
          component="a"
          href={everyNoiseLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: theme.palette.getContrastText(genreToMuiColor(genreName)),
          }}
        >
          Open on EveryNoise
          <OpenInNewIcon
            style={{
              paddingLeft: 4,
            }}
          />
        </Button>
      </Paper>
      <ArtistGrid artists={formattedData} />
    </>
  )
}

export default GenreContainer
