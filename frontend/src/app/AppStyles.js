import { makeStyles } from "@mui/material";

const appStyles = makeStyles((theme) => ({
  app: {
    marginTop: "4.5rem",
    [theme.breakpoints.down("sm")]: {
      marginTop: "7rem",
    },
  },
}));

export default appStyles;
