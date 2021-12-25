import React from "react";
import { render } from "react-dom";
import "./index.css";
import App from "./app/App";
import { BrowserRouter } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import ThemeToggler from "./themes/ThemeToggler";

let { REACT_APP_BACKEND_URL } = process.env;
if (!REACT_APP_BACKEND_URL) {
  REACT_APP_BACKEND_URL = "http://localhost:3001/graphql";
}

const client = new ApolloClient({
  uri: REACT_APP_BACKEND_URL,
  cache: new InMemoryCache(),
});

// https://localforage.github.io/localForage/#localforage

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
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
