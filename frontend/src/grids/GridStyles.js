import { makeStyles } from "@material-ui/core/styles";

const gridStyles = makeStyles((theme) => ({
  gridList: {
    flexWrap: "wrap",
    transform: "translateZ(0)",
    margin: 0,
    overflow: "hidden",
    justifyContent: "center",
  },
  gridContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
  },
  tile: {
    minWidth: 125,
    width: "10vw",
    margin: "auto",
    display: "flex",
    overflow: "hidden",
    justifyContent: "center",
    padding: `${theme.spacing(1)}px !important`,
  },
  button: {
    width: "12rem",
    minWidth: 125,
    height: "75px !important",
    lineHeight: "inherit",
    justifyContent: "left",
    wordBreak: "initial",
  },
  artistGrid: {
    display: "flex",
    flexFlow: "row wrap",
    justifyContent: "center",
  },
  artistCard: {},
  artistArt: {
    height: "12vw",
    width: "12vw",
    objectFit: "cover",
    minWidth: 100,
    minHeight: 100,
    transition: "transform .2s",
    "&:hover": {
      transform: "scale(1.75)",
      zIndex: 10,
      boxShadow: "0px 0px 2px #adadad",
    },
  },
}));

export default gridStyles;
