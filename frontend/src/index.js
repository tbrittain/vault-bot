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

const client = new ApolloClient({
  uri: 'http://localhost:4001/graphql',
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
