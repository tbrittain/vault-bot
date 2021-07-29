import React, { useState } from 'react'
import {
  Paper,
  MobileStepper,
  Button,
  useTheme
} from '@material-ui/core'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import homeStyles from './HomeStyles'
import GeneralStats from './GeneralStats'
import TrendPreview from './TrendPreview'
import SwipeableViews from 'react-swipeable-views'
import { autoPlay } from 'react-swipeable-views-utils'
import './override.css'

const AutoPlaySwipeableViews = autoPlay(SwipeableViews)

const Home = () => {
  const classes = homeStyles()
  const [activeStep, setActiveStep] = useState(0)
  const maxSteps = 2
  const theme = useTheme()

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleStepChange = (step) => {
    setActiveStep(step)
  }

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
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={activeStep}
        onChangeIndex={handleStepChange}
        enableMouseEvents
      >
        <GeneralStats />
        <TrendPreview />
      </AutoPlaySwipeableViews>
      <MobileStepper
        steps={maxSteps}
        position='static'
        variant='dots'
        activeStep={activeStep}
        nextButton={
          <Button size='small' onClick={handleNext} disabled={activeStep === maxSteps - 1}>
            Next
            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
          </Button>
        }
        backButton={
          <Button size='small' onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            Back
          </Button>
        }
      />
    </Paper>
  )
}

export default Home
