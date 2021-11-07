import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './app/App'
import { BrowserRouter } from 'react-router-dom'
import defaultTheme from './themes/DefaultTheme'
import { ThemeProvider } from '@material-ui/core'
import * as serviceWorker from './serviceWorker'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider
} from '@apollo/client'
import path from 'path'


if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../../.env') })
}

const client = new ApolloClient({
  uri: process.env.REACT_APP_BACKEND_URL,
  cache: new InMemoryCache()
})

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter forceRefresh={false}>
      <ApolloProvider client={client}>
        <ThemeProvider theme={defaultTheme}>
          <App />
        </ThemeProvider>
      </ApolloProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
