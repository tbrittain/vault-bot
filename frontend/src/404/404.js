import React from "react";
import pageNotFoundStyles from "./404Styles";
import { Typography } from "@mui/material";

const PageNotFound = () => {
  const classes = pageNotFoundStyles();
  return (
    <div>
      <Typography variant="h1" className={classes.title}>
        <i>404:</i> Sorry, nothing to see here
      </Typography>
    </div>
  );
};

export default PageNotFound;
