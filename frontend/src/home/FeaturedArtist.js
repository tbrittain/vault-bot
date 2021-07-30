import React from 'react'
import homeStyles from './HomeStyles'
import {
  Typography,
  CircularProgress,
  Avatar
} from '@material-ui/core'
import { useQuery, gql } from '@apollo/client'
import { Alert } from '@material-ui/lab'
import { Link } from 'react-router-dom'
import GenreGrid from '../grids/GenreGrid'

const QUERY = gql`
  query {
    getFeaturedArtist {
      name
      id
      art
      genres {
        genre
      }
      featured
    }
  }
`

const FeaturedArtist = () => {
  const classes = homeStyles()
  const { loading, error, data } = useQuery(QUERY)

  let processing = true
  let formattedData
  let dateToday
  if (data) {
    formattedData = { ...data.getFeaturedArtist }
    formattedData.genres = formattedData.genres.map(genre => genre.genre)
    dateToday = new Date(formattedData.featured)
    console.log(formattedData)
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
          Loading stats...
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
    <div
      style={{
        height: '100%'
      }}
    >
      <div
        className={classes.title}
      >
        <Typography
          variant='h5'
          style={{
            lineHeight: 'inherit'
          }}
        >
          Featured artist for {dateToday.toLocaleDateString()}
        </Typography>
      </div>
      <div>
        <div
          className={classes.featuredArtistInfo}
        >
          <Avatar
            src={formattedData.art}
            alt={formattedData.name}
            component={Link}
            to={`/artists/${formattedData.id}`}
            className={classes.artistArt}
          />
          <Typography
            component={Link}
            to={`/artists/${formattedData.id}`}
            variant='h2'
            className={classes.featuredArtistName}
          >
            <i>{formattedData.name}</i>
          </Typography>
        </div>
        <div
          className={classes.genreContainer}
        >
          <GenreGrid
            genres={formattedData.genres}
          />
        </div>
      </div>
    </div>
  )
}

export default FeaturedArtist
