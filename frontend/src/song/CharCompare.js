import React from 'react'
import {
  Typography
} from '@material-ui/core'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import songStyles from './SongStyles'

const minTommss = (minutes) => {
  const sign = minutes < 0 ? '-' : ''
  const min = Math.floor(Math.abs(minutes))
  const sec = Math.floor((Math.abs(minutes) * 60) % 60)
  return sign + (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec
}

const gridStyling = {
  icon: {
    height: '1.75em'
  }
}

const CharCompare = (props) => {
  const classes = songStyles()
  const name = props.name
  let stat = props.stat
  let avgStat = props.avgStat

  const statLargerThanAvg = stat > avgStat
  let difference
  if (statLargerThanAvg === true) {
    difference = `${Math.floor(100 * ((stat / avgStat) - 1))}%`
  } else {
    difference = `${Math.floor(100 * ((avgStat / stat) - 1))}%`
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
        margin: 10
      }}
    >
      <Typography
        variant='h6'
        style={{
          textTransform: 'capitalize'
        }}
      >
        {name}
      </Typography>
      <div className={classes.songCharsContainer}>
        <div
          style={{
            gridColumn: '1 2'
          }}
        >
          <Typography variant='h5'>{stat}</Typography>
        </div>
        <div
          style={{
            gridColumn: '2 3',
            margin: 'auto auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {statLargerThanAvg === true &&
            <div>
              <ArrowUpwardIcon
                style={{
                  color: '#4dd020',
                  fontSize: 30
                }}
              />
              <Typography variant='body2'>
                {difference}
              </Typography>
            </div>}
          {statLargerThanAvg === false &&
            <div>
              <ArrowDownwardIcon
                style={{
                  color: '#d11f1f',
                  fontSize: 30
                }}
              />
              <Typography variant='body2'>
                {difference}
              </Typography>
            </div>}
        </div>
        <div
          style={{
            gridColumn: '3 4'
          }}
        >
          <Typography variant='h5'>{avgStat}</Typography>
        </div>
      </div>
    </div>
  )
}

export default CharCompare
