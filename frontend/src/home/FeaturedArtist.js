import React from 'react'
import homeStyles from './HomeStyles'
import { useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'
import GenreGrid from '../grids/GenreGrid'
import {
  Alert,
  Avatar,
  CircularProgress,
  Paper,
  Typography,
  useTheme,
} from '@mui/material'
import { FEATURED_ARTIST_QUERY } from '../queries/artistQueries'

const FeaturedArtist = () => {
  const classes = homeStyles()
  const { loading, error, data } = useQuery(FEATURED_ARTIST_QUERY)
  const theme = useTheme()

  let processing = true
  let formattedData
  let dateToday
  let backgroundStyling
  if (data) {
    formattedData = { ...data.getFeaturedArtist }
    formattedData.genres = formattedData.genres.map((genre) => genre.genre)
    dateToday = new Date(formattedData.featured)
    processing = false
    backgroundStyling = {
      backgroundImage: `url(${formattedData.art})`,
      backgroundPosition: 'center center',
      backgroundSize: '100vw 100vw',
      filter: 'blur(20px)',
      WebkitFilter: 'blur(20px)',
      overflow: 'hidden',
      zIndex: 1,
      gridColumn: '1 / 1',
      gridRow: '1 / 1',
      height: '100%',
      width: '100%',
    }
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
            margin: 'auto auto',
          },
        }}
      >
        <CircularProgress />
        <Typography
          variant="body2"
          style={{
            marginTop: 5,
          }}
        >
          Loading stats...
        </Typography>
      </div>
    )
  }

  if (error) {
    return (
      <Alert severity="error">An error occurred during data retrieval :(</Alert>
    )
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className={classes.title}>
        <Typography
          variant="h5"
          style={{
            lineHeight: 'inherit',
          }}
        >
          Featured artist for{' '}
          {dateToday.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
      </div>
      <div>
        <div
          style={{
            display: 'grid',
            gridTemplate: '1fr / 1fr',
            placeItems: 'center',
            background: 'none',
          }}
        >
          <div
            className={classes.featuredArtistInfo}
            style={{
              gridColumn: '1 / 1',
              gridRow: '1 / 1',
              height: '100%',
              width: '100%',
            }}
          >
            <Avatar
              src={formattedData.art}
              alt={formattedData.name}
              component={Link}
              to={`/artists/${formattedData.id}`}
              className={classes.artistArt}
            />
            <Paper
              square={false}
              style={{
                backgroundColor: theme.palette.primary.light,
              }}
            >
              <Typography
                component={Link}
                to={`/artists/${formattedData.id}`}
                variant="h2"
                className={classes.featuredArtistName}
                sx={{
                  fontWeight: 'bold',
                }}
              >
                <i>{formattedData.name}</i>
              </Typography>
            </Paper>
          </div>
          <div style={backgroundStyling} />
        </div>
        <div className={classes.genreContainer}>
          <GenreGrid genres={formattedData.genres} />
        </div>
      </div>
    </div>
  )
}

export default FeaturedArtist
