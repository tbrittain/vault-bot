import React, { useState, useEffect, useRef } from 'react'
import {
  Zoom,
  Paper,
  Typography
} from '@material-ui/core'
import featureTextStyles from './FeatureTextStyles'

const FeatureText = (props) => {
  const classes = featureTextStyles()
  const { text } = props
  const [displayText, setDisplayText] = useState(text)

  const toggleZoom = useRef(false)

  useEffect(() => {
    setDisplayText(text)
    toggleZoom.current = true
    return () => {
      toggleZoom.current = false
    }
  }, [text])

  return (
    <Zoom in={toggleZoom.current}>
      <Paper>
        <Typography variant='h6'>
          {displayText}
        </Typography>
      </Paper>
    </Zoom>
  )
}

export default FeatureText
