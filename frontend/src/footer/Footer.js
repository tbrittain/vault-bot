import React from 'react'
import Copyright from './Copyright'
import {
  Breadcrumbs
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import footerStyles from './FooterStyles'

const Footer = () => {
  const classes = footerStyles()
  return (
    <div
      className={classes.footer}
    >
      <Breadcrumbs
        className={classes.footerActions}
      >
        <Link
          to='/about'
          className={classes.link}
        >
          About VaultBot
        </Link>
        <a
          href='https://github.com/tbrittain/vault-bot/issues/new'
          className={classes.link}
          target='_blank'
          rel='noopener noreferrer'
        >
          Report an issue
        </a>
      </Breadcrumbs>
      <Copyright />
    </div>
  )
}

export default Footer
