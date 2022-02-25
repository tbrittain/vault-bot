import React from 'react'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import songStyles from './SongStyles'
import minTommss from '../utils/minTommss'
import { Typography } from '@mui/material'
import { withStyles } from '@mui/styles'

const GlobalCss = withStyles({
  '@global': {
    '.MuiBox-root': {
      padding: 0,
    },
  },
})(() => null)

const CharCompare = (props) => {
  const classes = songStyles()
  const name = props.name
  let stat = props.stat
  let avgStat = props.avgStat

  const statLargerThanAvg = stat > avgStat
  let difference
  if (statLargerThanAvg === true) {
    difference = `${Math.abs(Math.floor(100 * (stat / avgStat - 1)))}%`
  } else {
    difference = `${Math.abs(Math.floor(100 * (avgStat / stat - 1)))}%`
  }

  if (name === 'length') {
    stat = minTommss(stat)
    avgStat = minTommss(avgStat)
  } else {
    avgStat = avgStat.toFixed(3)
  }

  return (
    <div
      style={{
        textAlign: 'center',
        margin: 10,
      }}
    >
      <GlobalCss />
      <Typography
        variant="h6"
        sx={{
          textTransform: 'capitalize',
          fontWeight: 'fontWeightLight',
        }}
      >
        {name}
      </Typography>
      <div className={classes.songCharsContainer}>
        <div
          style={{
            gridColumn: '1 2',
          }}
        >
          <Typography
            variant="h5"
            className={classes.songChar}
            style={{
              textAlign: 'left',
            }}
          >
            {stat}
          </Typography>
        </div>
        <div
          style={{
            gridColumn: '2 3',
            margin: 'auto auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {statLargerThanAvg === true && (
            <div>
              <ArrowUpwardIcon
                style={{
                  color: '#4dd020',
                  fontSize: 30,
                }}
              />
              <Typography variant="body2">{difference}</Typography>
            </div>
          )}
          {statLargerThanAvg === false && (
            <div>
              <ArrowDownwardIcon
                style={{
                  color: '#d11f1f',
                  fontSize: 30,
                }}
              />
              <Typography variant="body2">{difference}</Typography>
            </div>
          )}
        </div>
        <div
          style={{
            gridColumn: '3 4',
          }}
        >
          <Typography
            variant="h5"
            className={classes.songChar}
            style={{
              textAlign: 'right',
            }}
          >
            {avgStat}
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default CharCompare
