import React from 'react'
import { Backdrop, CircularProgress, Typography } from '@mui/material'

const LoadingScreen = (props) => {
  const { text } = props
  return (
    <Backdrop
      open
      style={{
        zIndex: 1499,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
          zIndex: 1500,
          '& > * + *': {
            margin: 'auto auto',
          },
        }}
      >
        <CircularProgress />
        <Typography
          variant="body2"
          style={{
            marginTop: 5,
          }}
        >
          {text}
        </Typography>
      </div>
    </Backdrop>
  )
}

export default LoadingScreen
