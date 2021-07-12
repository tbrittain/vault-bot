import React from 'react'
import {
  Typography,
  CircularProgress,
  Grid,
  Backdrop
} from '@material-ui/core'
import homeStyles from './HomeStyles'
import { useQuery, gql } from '@apollo/client'
import { Alert } from '@material-ui/lab'
import CountUpAnimation from '../effects/CountUpAnimation'
import './textAnimate.css'

const QUERY = gql`
  query {
    getCurrentOverallStats {
        dynamicNumTracks
        archiveNumTracks
        totalNumTracks
        totalNumArtists
        totalNumGenres
    }
  }
`

const GeneralStats = () => {
  const classes = homeStyles()
  const { loading, error, data } = useQuery(QUERY, {
    // fetchPolicy: 'no-cache',
    // pollInterval: 30000 // TODO: fix polling occurring even when component not mounted???
  })

  let formattedData
  let processing = true
  if (data) {
    formattedData = data.getCurrentOverallStats
    console.log(formattedData)
    processing = false
  }

  if (loading || processing) {
    return (
      <Backdrop open>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            '& > * + *': {
              margin: 'auto auto'
            }
          }}
        >
          <CircularProgress />
          <Typography
            variant='body2'
          >
            Loading most recent stats
          </Typography>
        </div>
      </Backdrop>
    )
  }

  if (error) {
    return (
      <Alert severity='error'>An error occurred during data retrieval :(</Alert>
    )
  }
  if (formattedData) {
    return (
      <div
        className={classes.generalStats}
      >
        <div
          style={{
            width: '100%'
          }}
        >
          <svg
            className={classes.animateText}
            style={{
              fontSize: '5em',
              fontWeight: 800,
              width: '100%',
              height: 'auto'
            }}
          >
            <symbol id='s-text'>
              <text
                text-anchor='middle'
                x='50%'
                y='80%'
              >
                At a Glance:
              </text>
            </symbol>
            <g className='g-ants'>
              <use xlinkHref='#s-text' className='textCopy' />
              <use xlinkHref='#s-text' className='textCopy' />
              <use xlinkHref='#s-text' className='textCopy' />
              <use xlinkHref='#s-text' className='textCopy' />
              <use xlinkHref='#s-text' className='textCopy' />
            </g>
          </svg>
        </div>
        <Grid
          className={classes.statsContainer}
          container
          direction='column'
          justifyContent='space-between'
          alignItems='center'
        >
          <Grid
            item
            className={classes.animateContainer}
          >
            <Typography
              variant='h6'
              className={classes.statDescription}
            >
              Tracks in dynamic playlist:
            </Typography>
            <Typography
              variant='h6'
              className={classes.numberHighlight}
            >
              <i>
                <CountUpAnimation>
                  {Number(formattedData.dynamicNumTracks)}
                </CountUpAnimation>
              </i>
            </Typography>
          </Grid>
          <Grid
            item
            className={classes.animateContainer}
            style={{
              animationDelay: '0.25s'
            }}
          >
            <Typography
              variant='h6'
              className={classes.statDescription}
            >
              Tracks in archive playlist:
            </Typography>
            <Typography
              variant='h6'
              className={classes.numberHighlight}
            >
              <i>
                <CountUpAnimation>
                  {Number(formattedData.archiveNumTracks)}
                </CountUpAnimation>
              </i>
            </Typography>
          </Grid>
          <Grid
            item
            className={classes.animateContainer}
            style={{
              animationDelay: '0.5s'
            }}
          >
            <Typography
              variant='h6'
              className={classes.statDescription}
            >
              Unique tracks:
            </Typography>
            <Typography
              variant='h6'
              className={classes.numberHighlight}
            >
              <i>
                <CountUpAnimation>
                  {Number(formattedData.totalNumTracks)}
                </CountUpAnimation>
              </i>
            </Typography>
          </Grid>
          <Grid
            item
            className={classes.animateContainer}
            style={{
              animationDelay: '0.75s'
            }}
          >
            <Typography
              variant='h6'
              className={classes.statDescription}
            >
              Unique artists:
            </Typography>
            <Typography
              variant='h6'
              className={classes.numberHighlight}
            >
              <i>
                <CountUpAnimation>
                  {Number(formattedData.totalNumArtists)}
                </CountUpAnimation>
              </i>
            </Typography>
          </Grid>
          <Grid
            item
            className={classes.animateContainer}
            style={{
              animationDelay: '0.75s'
            }}
          >
            <Typography
              variant='h6'
              className={classes.statDescription}
            >
              Unique genres:
            </Typography>
            <Typography
              variant='h6'
              className={classes.numberHighlight}
            >
              <i>
                <CountUpAnimation>
                  {Number(formattedData.totalNumGenres)}
                </CountUpAnimation>
              </i>
            </Typography>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default GeneralStats
