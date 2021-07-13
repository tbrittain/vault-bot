import React from 'react'
import {
  Avatar,
  Paper,
  Tooltip,
  Fade
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import gridStyles from './GridStyles'
import { makeStyles } from '@material-ui/core/styles'

const darkTooltipTheme = makeStyles((theme) => ({
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    fontSize: theme.typography.pxToRem(16),
    fontWeight: 800,
    color: theme.palette.primary.main
  }
}))

const DarkTooltip = (props) => {
  const classes = darkTooltipTheme()

  return <Tooltip classes={classes} {...props} />
}

const ArtistPreview = (props) => {
  const { name, id, art } = props
  const classes = gridStyles()

  return (
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
      >
        <Avatar
          src={art}
          alt={`${name} artist art`}
          variant='square'
          className={classes.artistArt}
        />
      </Paper>
    </DarkTooltip>

  )
}

export default ArtistPreview
