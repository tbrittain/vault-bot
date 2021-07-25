import React, { useState } from 'react'
import {
  Paper,
  Tooltip,
  Fade,
  Backdrop
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import gridStyles from './GridStyles'
import { makeStyles } from '@material-ui/core/styles'
import 'react-lazy-load-image-component/src/effects/opacity.css'

const darkTooltipTheme = makeStyles((theme) => ({
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    fontSize: theme.typography.pxToRem(16),
    fontWeight: 800
  }
}))

const DarkTooltip = (props) => {
  const classes = darkTooltipTheme()

  return <Tooltip classes={classes} {...props} />
}

const ArtistPreview = (props) => {
  const { name, id, art } = props
  const classes = gridStyles()
  const [open, setOpen] = useState(false)

  const handleMouseEnter = () => {
    setOpen(true)
  }

  const handleMouseLeave = () => {
    setOpen(false)
  }

  return (
    <>
      <DarkTooltip
        disableFocusListener
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 200 }}
        title={<i>{name}</i>}
      >
        <Paper
          className={classes.artistCard}
          component={Link}
          to={`/artists/${id}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <LazyLoadImage
            src={art}
            alt={name}
            className={classes.artistArt}
            effect='opacity'
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          />
        </Paper>
      </DarkTooltip>
    </>
  )
}

export default ArtistPreview
