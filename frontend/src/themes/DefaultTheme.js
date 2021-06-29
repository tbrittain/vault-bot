import { createMuiTheme } from '@material-ui/core/styles'

const defaultTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#BCE7FD'
    },
    secondary: {
      main: '#2B2D42'
    },
    error: {
      main: '#EF233C',
      dark: '#D90429'
    }
  },
  typography: {
    fontFamily: [
      'Rubik',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif'
    ]
  }
})

export default defaultTheme
