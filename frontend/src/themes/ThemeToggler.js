import React, { createContext, useMemo, useState } from 'react'
import lightTheme from './LightTheme'
import darkTheme from './DarkTheme'
import { CssBaseline, ThemeProvider } from '@mui/material'

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
})

export default function ThemeToggler({ children }) {
  const prefersDarkMode = useMemo(() => {
    let preference

    localStorage.getItem('prefersDarkMode') !== null
      ? (preference = localStorage.getItem('prefersDarkMode'))
      : (preference = window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (localStorage.getItem('prefersDarkMode') === null) {
      localStorage.setItem('prefersDarkMode', preference)
    }

    return preference === 'true'
  }, [])

  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light')
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
        localStorage.setItem(
          'prefersDarkMode',
          prefersDarkMode ? 'false' : 'true'
        )
      },
    }),
    [prefersDarkMode]
  )
  // set theme passed in as either light or dark
  const theme = useMemo(
    () => ({
      ...(mode === 'light' ? lightTheme : darkTheme),
    }),
    [mode]
  )

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
