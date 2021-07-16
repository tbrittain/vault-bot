import React from 'react'
import {
  Container
} from '@material-ui/core'
import Header from '../header/Header'
import Footer from '../footer/Footer'
import RouteHandler from './routes'
import appStyles from './AppStyles'

// TODO: https://dev.to/mubbashir10/containerize-react-app-with-docker-for-production-572b
// https://cloud.google.com/run/docs/mapping-custom-domains
// https://cloud.google.com/run/docs/quickstarts/build-and-deploy/nodejs

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
