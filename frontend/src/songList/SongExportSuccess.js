import React, { useEffect } from "react";
import { LinearProgress, Paper, Typography } from "@mui/material";

// TODO: Should use some sort of redirect instead of having this component

const SongExportSuccess = (props) => {
  const { setActiveStep } = props;
  useEffect(() => {
    setTimeout(() => {
      setActiveStep(0);
    }, 5000);
  }, [setActiveStep]);
  return (
    <Paper
      elevation={3}
      style={{
        textAlign: "center",
      }}
    >
      <Typography
        variant="h2"
        sx={{
          margin: 15,
          fontWeight: "fontWeightBold",
        }}
      >
        <i>Success!</i>
      </Typography>
      <Typography
        variant="h4"
        style={{
          margin: 15,
        }}
      >
        Playlist has been exported
      </Typography>
      <Typography
        variant="subtitle1"
        style={{
          margin: 15,
        }}
      >
        Returning to songs momentarily...
      </Typography>
      <LinearProgress />
    </Paper>
  );
};

export default SongExportSuccess;
