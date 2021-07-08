import React from 'react'
import {
  Typography
} from '@material-ui/core'
import footerStyles from './FooterStyles'

function Copyright () {
  const classes = footerStyles()
  return (
    <Typography
      variant='body2'
      color='textSecondary'
      align='center'
    >
      {'Copyright © '}
      <a
        href='https://tbrittain.com/'
        target='_blank'
        rel='noopener noreferrer'
        className={classes.copyrightLink}
      >
        Trey Brittain
      </a>{' '}
      {new Date().getFullYear()}
      .
    </Typography>
  )
}

export default Copyright
