import React from 'react'
import {
  Container
} from '@material-ui/core'
import Header from '../header/Header'
import Footer from '../footer/Footer'
import RouteHandler from './routes'
import appStyles from './AppStyles'

function App () {
  const classes = appStyles()

  return (
    <Container maxWidth='md'>
      <Header />
      <main
        className={classes.app}
      >
        <RouteHandler />
      </main>
      <footer>
        <Footer />
      </footer>
    </Container>
  )
}

export default App
