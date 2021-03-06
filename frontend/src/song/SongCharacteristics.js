import React from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  CircularProgress,
  Typography
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import CharCompare from './CharCompare'
import songStyles from './SongStyles'

const QUERY = gql`
  query {
    getAvgTrackDetails {
      acousticness
      danceability
      energy
      instrumentalness
      length
      liveness
      loudness
      tempo
      valence
    }
  }
`
const SongChars = (props) => {
  const { loading, error, data } = useQuery(QUERY)
  const classes = songStyles()

  let formattedData
  let processing = true
  if (data) {
    formattedData = data.getAvgTrackDetails
    processing = false
  }

  if (loading || processing) {
    return (
      <CircularProgress />
    )
  }

  if (error) {
    <Alert severity='error'>An error occurred during data retrieval :(</Alert>
  }

  if (formattedData) {
    return (
      <div
        className={classes.innerContainer}
        style={{
          flexDirection: 'column',
          marginTop: 10
        }}
      >
        <div
          className={classes.songComparisonSmall}
        >
          <div
            style={{
              width: '50%',
              margin: 'auto',
              textAlign: 'left'
            }}
          >
            <Typography
              variant='subtitle1'
              style={{
                lineHeight: 'inherit',
                marginBottom: 10,
                fontSize: '2ch',
                fontWeight: 300
              }}
            >
              {props.songName}
            </Typography>
          </div>
          <div
            style={{
              width: '50%',
              margin: 'auto',
              textAlign: 'right'
            }}
          >
            <Typography
              variant='subtitle1'
              style={{
                lineHeight: 'inherit',
                fontSize: '2ch',
                fontWeight: 300
              }}
            >
              Total song average
            </Typography>
          </div>
        </div>
        <div
          style={{ display: 'flex' }}
        >
          <div
            className={classes.songComparison}
          >
            <Typography
              variant='h6'
              style={{
                fontWeight: 300,
                lineHeight: 'inherit'
              }}
            >
              {props.songName}
            </Typography>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              margin: 15
            }}
          >
            <CharCompare
              name='length'
              avgStat={formattedData.length}
              stat={props.details.length}
            />
            <CharCompare
              name='tempo'
              avgStat={formattedData.tempo}
              stat={props.details.tempo}
            />
            <CharCompare
              name='energy'
              avgStat={formattedData.energy}
              stat={props.details.energy}
            />
            <CharCompare
              name='danceability'
              avgStat={formattedData.danceability}
              stat={props.details.danceability}
            />
            <CharCompare
              name='valence'
              avgStat={formattedData.valence}
              stat={props.details.valence}
            />
            <CharCompare
              name='loudness'
              avgStat={formattedData.loudness}
              stat={props.details.loudness}
            />
          </div>
          <div
            className={classes.songComparison}
          >
            <Typography
              variant='h6'
              style={{
                fontWeight: 300,
                lineHeight: 'inherit'
              }}
            >
              Total song average
            </Typography>
          </div>
        </div>
      </div>
    )
  }
}

export default SongChars
