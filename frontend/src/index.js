import React from 'react'
import { render } from 'react-dom'
import App from './app/App'
import { BrowserRouter } from 'react-router-dom'
import * as serviceWorker from './serviceWorker'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import ThemeToggler from './themes/ThemeToggler'

const uri =
  process.env.NODE_ENV === 'production'
    ? 'https://vaultbot-graphql-c4gcu3ze4q-uc.a.run.app/graphql'
    : 'http://localhost:3001/graphql'

const client = new ApolloClient({
  uri: uri,
  cache: new InMemoryCache(),
})

render(
  <React.StrictMode>
    <BrowserRouter forceRefresh={false}>
      <ApolloProvider client={client}>
        <ThemeToggler>
          <App />
        </ThemeToggler>
      </ApolloProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)

serviceWorker.unregister()
