import { createTheme } from "@mui/material";
import "@fontsource/rubik/300.css";
import "@fontsource/rubik/400.css";
import "@fontsource/rubik/500.css";
import "@fontsource/rubik/800.css";
import { commonOverrides, commonProps, commonTypography } from "./CommonTheme";

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
  typography: { ...commonTypography },
  overrides: { ...commonOverrides },
  props: { ...commonProps },
});

export default darkTheme;
