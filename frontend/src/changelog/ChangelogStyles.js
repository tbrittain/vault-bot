import { makeStyles } from "@material-ui/core/styles";

const changeLogStyles = makeStyles(() => ({
  changeLogContainer: {
    maxHeight: "80vh",
    overflow: "auto",
  },
  post: {
    margin: "2%",
    padding: "2%",
  },
}));

export default changeLogStyles;
