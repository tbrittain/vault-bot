import React from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import gridStyles from "./GridStyles";
import { Avatar, Fade, Paper, Tooltip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import "react-lazy-load-image-component/src/effects/opacity.css";

const darkTooltipTheme = makeStyles((theme) => ({
  tooltip: {
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    fontSize: theme.typography.pxToRem(16),
    fontWeight: theme.typography.fontWeightBold,
  },
}));

const DarkTooltip = (props) => {
  const classes = darkTooltipTheme();

  // FIXME: https://mui.com/customization/how-to-customize/
  return (
    <Tooltip classes={classes} {...props}>
      {props.children}
    </Tooltip>
  );
};

const ArtistPreview = (props) => {
  const { name, id, art } = props;
  const classes = gridStyles();

  return (
    <>
      <DarkTooltip
        disableFocusListener
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 200 }}
        title={<i>{name}</i>}
      >
        <Paper
          className={classes.artistCard}
          component={Link}
          to={`/artists/${id}`}
        >
          {!art && (
            <Avatar
              alt={name}
              className={classes.artistArt}
              variant="square"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          )}
          {art && (
            <LazyLoadImage
              src={art}
              alt={name}
              className={classes.artistArt}
              effect="opacity"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          )}
        </Paper>
      </DarkTooltip>
    </>
  );
};

export default ArtistPreview;
