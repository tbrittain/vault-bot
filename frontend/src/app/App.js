import React from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import RouteHandler from "./routes";
import appStyles from "./AppStyles";
import { Container } from "@mui/material";

function App() {
  const classes = appStyles();

  return (
    <Container maxWidth="lg">
      <Header />
      <main className={classes.app}>
        <RouteHandler />
      </main>
      <footer>
        <Footer />
      </footer>
    </Container>
  );
}

export default App;
