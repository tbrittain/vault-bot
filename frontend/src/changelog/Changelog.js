import React from "react";
import PostContainer from "./PostContainer";
import changeLogStyles from "./ChangelogStyles";
import { Paper, Typography } from "@mui/material";

const Changelog = () => {
  const classes = changeLogStyles();
  return (
    <>
      <Typography variant="h1">Changelog</Typography>
      <Paper elevation={3} className={classes.changeLogContainer}>
        <PostContainer />
      </Paper>
    </>
  );
};

export default Changelog;
