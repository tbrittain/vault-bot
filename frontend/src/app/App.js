import React from 'react';
import { Container, Typography, Link } from '@material-ui/core';
import Header from '../header/Header'
import { ROUTES, RenderRoutes } from './Routes';
import './App.css';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://tbrittain.com/" target="_blank">
        Trey Brittain
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function App() {
  return (
    <Container maxWidth="lg">
      <Header />
      <main className="app">
        <RenderRoutes routes={ROUTES}/>
      </main>
      <footer>
        <Copyright />
      </footer>
    </Container>
  );
}

export default App;
