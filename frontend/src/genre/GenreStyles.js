import { makeStyles } from "@mui/material";

const genreStyles = makeStyles(() => ({
  title: {
    textAlign: "center",
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  genreTitle: {
    textTransform: "capitalize",
    fontWeight: 800,
  },
}));

export default genreStyles;
