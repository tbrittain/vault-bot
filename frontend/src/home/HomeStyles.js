import { makeStyles } from "@mui/material";

const homeStyles = makeStyles((theme) => ({
  generalStats: {
    display: "flex",
    flexDirection: "column",
  },
  container: {
    width: "100%",
    height: "100%",
  },
  statsContainer: {
    margin: "auto",
    overflowY: "hidden",
    userSelect: "none",
  },
  individualStat: {
    display: "flex",
  },
  animateContainer: {
    display: "flex",
    animation: "$slidein 0.5s",
    animationIterationCount: 1,
    animationDirection: "forward",
    animationTimingFunction: "ease-out",
    animationFillMode: "both",
    margin: 15,
    zIndex: 50,
  },
  animateText: {
    fontSize: "5em",
    fontWeight: 800,
    width: "100%",
    height: "6vw",
    [theme.breakpoints.down("sm")]: {
      fontSize: "3.5em",
      height: "18vw",
    },
  },
  statDescription: {
    fontWeight: 300,
    [theme.breakpoints.down("sm")]: {
      fontSize: "2ch",
      textAlign: "center",
    },
  },
  "@keyframes slidein": {
    from: {
      opacity: 0,
      transform: "translateY(100%)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0%)",
    },
  },
  numberHighlight: {
    fontWeight: 800,
    color: theme.palette.primary.dark,
    marginLeft: 5,
    [theme.breakpoints.down("sm")]: {
      fontSize: "2ch",
    },
  },
  featuredArtistName: {
    textDecoration: "none",
    color:
      theme.palette.mode === "light"
        ? theme.palette.secondary.main
        : theme.palette.primary.contrastText,
    fontWeight: 800,
    transition: "0.3s",
    margin: 5,
    "&:hover": {
      color: theme.palette.secondary.light,
    },
  },
  featuredArtistInfo: {
    width: "100%",
    margin: "auto",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "none",
    zIndex: 26,
  },
  artistArt: {
    width: "12vw",
    height: "12vw",
    margin: 15,
    boxShadow: "0px 0px 4px #adadad",
    minHeight: 75,
    minWidth: 75,
    [theme.breakpoints.down("sm")]: {
      minHeight: 175,
      minWidth: 175,
    },
  },
  title: {
    backgroundColor: theme.palette.primary.main,
    textAlign: "center",
    color:
      theme.palette.mode === "light"
        ? theme.palette.secondary.main
        : theme.palette.primary.contrastText,
    fontWeight: 300,
    zIndex: 27,
  },
  genreContainer: {
    [theme.breakpoints.down("sm")]: {
      maxHeight: "30vh",
      overflow: "auto",
    },
  },
}));

export default homeStyles;
