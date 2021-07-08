import React from 'react'
import {
  Container
} from '@material-ui/core'
import Header from '../header/Header'
import Footer from '../footer/Footer'
import RouteHandler from './Routes'
import appStyles from './AppStyles'

// https://blog.pshrmn.com/simple-react-router-v4-tutorial/
// https://www.ryanjyost.com/react-routing/

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
