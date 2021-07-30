import React, { useState } from 'react'
import {
  Typography,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  Button,
  useTheme
} from '@material-ui/core'
import SwipeableViews from 'react-swipeable-views'
import TabPanel from '../tabpanel/TabPanel'
import SongViewer from './SongViewer'
import SongExport from './SongExport'
import { Alert } from '@material-ui/lab'

const getSteps = () => {
  return ['Select songs to export', 'Export']
}

const getStepContent = (step) => {
  switch (step) {
    case 0:
      return 'Select songs to export to Spotify'
    case 1:
      return 'Export songs to Spotify playlist'
    default:
      return 'Unknown step'
  }
}

const SongListContainer = () => {
  const [selectionModel, setSelectionModel] = useState([])
  const [activeStep, setActiveStep] = useState(0)
  const steps = getSteps()
  const openWarning = selectionModel.length > 100
  const theme = useTheme()

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  return (
    <div>
      <Typography
        variant='h1'
      >
        Songs
      </Typography>
      <Typography
        variant='subtitle1'
      >
        Total list of all the songs tracked by VaultBot
      </Typography>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={activeStep}
      >
        <TabPanel
          value={activeStep}
          index={0}
        >
          <SongViewer
            trackSelection={selectionModel}
            setTrackSelection={setSelectionModel}
          />
        </TabPanel>
        <TabPanel
          value={activeStep}
          index={1}
        >
          <SongExport
            songIds={selectionModel}
          />
        </TabPanel>
      </SwipeableViews>
      {selectionModel.length > 0 && selectionModel.length < 100 &&
        <div>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => {
              return (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              )
            })}
          </Stepper>
          <Typography
            variant='body1'
          >
            {getStepContent(activeStep)}
          </Typography>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant='contained'
            style={{
              marginRight: 10
            }}
          >
            Back
          </Button>
          <Button
            variant='contained'
            color='primary'
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
            // className={classes.button}
          >
            Next
          </Button>
        </div>}
      <Snackbar open={openWarning}>
        <Alert severity='error'>
          Only 100 or fewer tracks can be exported to Spotify
        </Alert>
      </Snackbar>
    </div>
  )
}

export default SongListContainer
