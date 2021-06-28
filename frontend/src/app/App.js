import React from 'react';
import { Container, Typography, Link } from '@material-ui/core';
import Header from '../header/Header'
import './App.css';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://tbrittain.com/">
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
      <div className="App">
      </div>
      <Copyright />
    </Container>
  );
}

export default App;
