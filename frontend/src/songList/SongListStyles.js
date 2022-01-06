import { alpha, makeStyles } from "@mui/material";

const songListStyles = makeStyles((theme) => ({
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(1),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
    fontWeight: 300,
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "20ch",
      "&:focus": {
        width: "30ch",
      },
    },
  },
  queryResultContainer: {
    width: "35ch",
    maxHeight: "35ch",
    overflowY: "auto",
    background: "none",
  },
  songResultItem: {
    display: "flex",
    transition: "0.1s",
    "&:hover": {
      outline: `2px solid ${theme.palette.primary.main}`,
    },
  },
  searchResultArt: {
    width: 60,
    height: 60,
    boxShadow: "0px 0px 2px #adadad",
  },
  totalSongResults: {
    display: "flex",
    width: "100%",
    height: "calc(50vh + 100px)",
  },
  songListLink: {
    color: "black",
    wordBreak: "break-all",
    overflowWrap: "break-word",
    transition: "0.3s",
    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
  exportContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  songListToExport: {
    width: "100%",
    maxHeight: "40vh",
    overflowY: "auto",
  },
  songToExport: {
    display: "flex",
    margin: 5,
    alignItems: "center",
  },
  playlistInput: {
    paddingBottom: 10,
    width: "30vw",
    minWidth: 200,
  },
  userPlaylist: {
    margin: 15,
    display: "flex",
    flexDirection: "column",
  },
  songExportTitle: {
    textAlign: "center",
    [theme.breakpoints.down("sm")]: {
      fontSize: "2rem",
    },
  },
}));

export default songListStyles;
