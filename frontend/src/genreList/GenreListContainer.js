import React from "react";
import GenreViewer from "./GenreViewer";
import { Typography } from "@mui/material";

const GenreListContainer = () => {
  return (
    <div>
      <Typography variant="h1">Genres</Typography>
      <Typography variant="subtitle1">
        Total list of all the genres tracked by VaultBot
      </Typography>
      <GenreViewer />
    </div>
  );
};

export default GenreListContainer;
