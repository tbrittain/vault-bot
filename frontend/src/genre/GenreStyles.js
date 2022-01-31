import { makeStyles } from "@mui/styles";

const genreStyles = makeStyles((theme) => ({
  title: {
    textAlign: "center",
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
  },
  genreTitle: {
    textTransform: "capitalize",
    fontWeight: theme.typography.fontWeightBold,
  },
}));

export default genreStyles;
