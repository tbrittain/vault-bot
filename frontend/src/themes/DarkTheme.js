import { createTheme } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    primary: {
      main: "#BCE7FD",
    },
    secondary: {
      main: "#EBF8FE",
    },
    error: {
      main: "#EF233C",
      dark: "#D90429",
    },
    mode: "dark",
    background: {
      default: "#111218",
      paper: "#1E212B",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: [
      "Rubik",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      "Fira Sans",
      "Droid Sans",
      "Helvetica Neue",
      "sans-serif",
    ],
    h1: {
      fontSize: "3.2rem",
    },
    h2: {
      fontSize: "2.8rem",
    },
    h3: {
      fontSize: "2.6rem",
    },
    h4: {
      fontSize: "2.4rem",
    },
    h5: {
      fontSize: "2.2rem",
    },
    h6: {
      fontSize: "2rem",
    },
  },
  overrides: {
    MuiBreadcrumbs: {
      ol: {
        justifyContent: "center",
      },
    },
  },
  props: {
    MuiPaper: {
      square: true,
    },
  },
});

export default darkTheme;
