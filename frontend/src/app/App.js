import React from 'react'
import { Container, Typography, Link } from '@material-ui/core'
import Header from '../header/Header'
import RouteHandler from './Routes'
import appStyles from './AppStyles'
import './App.css'

function Copyright () {
  return (
    <Typography variant='body2' color='textSecondary' align='center'>
      {'Copyright © '}
      <Link
        color='inherit'
        href='https://tbrittain.com/'
        target='_blank'
        rel='noopener norefferer'
      >
        Trey Brittain
      </Link>{' '}
      {new Date().getFullYear()}
      .
    </Typography>
  )
}

// https://blog.pshrmn.com/simple-react-router-v4-tutorial/
// https://www.ryanjyost.com/react-routing/

function App () {
  const classes = appStyles()

  return (
    <Container maxWidth='md'>
      <Header />
      <main className={classes.app}>
        <RouteHandler />
      </main>
      <footer>
        <Copyright />
      </footer>
    </Container>
  )
}

export default App
