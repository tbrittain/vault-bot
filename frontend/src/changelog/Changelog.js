import React from "react";
import { Paper, Typography } from "@material-ui/core";
import PostContainer from "./PostContainer";
import changeLogStyles from "./ChangelogStyles";

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
