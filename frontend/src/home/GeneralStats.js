import React from 'react'
import {
  Paper,
  Typography
} from '@material-ui/core'
import homeStyles from './HomeStyles'
import { useQuery, gql } from '@apollo/client'
import { Alert } from '@material-ui/lab'
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
  if (data) {
    formattedData = data.getCurrentOverallStats
    console.log(formattedData)
  }

  if (error) {
    return (
      <Alert severity='error'>An error occurred during data retrieval :(</Alert>
    )
  }
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
          // viewBox='0 0 960 300'
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
      <div>

      </div>
    </div>
  )
}

export default GeneralStats
