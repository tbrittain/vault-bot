import React from 'react'
import {
  Paper
} from '@material-ui/core'
import homeStyles from './HomeStyles'
import GeneralStats from './GeneralStats'

// TODO: https://material-ui.com/components/steppers/#text-with-carousel-effect
// alternatively https://mui.wertarbyte.com/#material-auto-rotating-carousel

const Home = () => {
  const classes = homeStyles()
  return (
    <Paper
      className={classes.container}
      elevation={3}
    >
      <GeneralStats />
    </Paper>
  )
}

export default Home
