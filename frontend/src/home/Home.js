import React from 'react'
import {
  Paper
} from '@material-ui/core'
import homeStyles from './HomeStyles'
import GeneralStats from './GeneralStats'
import TrendPreview from './TrendPreview'
import SwipeableViews from 'react-swipeable-views'
import { autoPlay } from 'react-swipeable-views-utils'
import './override.css'

const AutoPlaySwipeableViews = autoPlay(SwipeableViews)

const Home = () => {
  const classes = homeStyles()
  return (
    <Paper
      className={classes.container}
      elevation={3}
    >
      <AutoPlaySwipeableViews
        interval={10000}
        style={{
          height: '100%'
        }}
      >
        <GeneralStats />
        <TrendPreview />
      </AutoPlaySwipeableViews>
    </Paper>
  )
}

export default Home
