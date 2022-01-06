import React, { createContext, useMemo, useState } from "react";
import lightTheme from "./LightTheme";
import darkTheme from "./DarkTheme";
import { CssBaseline, ThemeProvider } from "@mui/material";

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export default function ThemeToggler({ children }) {
  const prefersDarkMode = useMemo(() => {
    const prefersDarkMode = localStorage.getItem("prefersDarkMode");
    return prefersDarkMode === "true";
  }, []);

  const [mode, setMode] = useState(prefersDarkMode ? "dark" : "light");
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
        localStorage.setItem(
          "prefersDarkMode",
          prefersDarkMode ? "false" : "true"
        );
      },
    }),
    []
  );

  // set theme passed in as either light or dark
  const theme = useMemo(
    () => ({
      ...(mode === "light" ? lightTheme : darkTheme),
    }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
