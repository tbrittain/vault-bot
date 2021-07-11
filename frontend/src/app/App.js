import React from 'react'
import {
  Container
} from '@material-ui/core'
import Header from '../header/Header'
import Footer from '../footer/Footer'
import RouteHandler from './Routes'
import appStyles from './AppStyles'

// TODO: consider implementing polling for some of the pages (especially the homepage)
// https://www.apollographql.com/docs/react/data/queries/#polling

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
