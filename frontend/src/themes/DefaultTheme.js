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
    ],
    h1: {
      fontSize: '3.2rem'
    },
    h2: {
      fontSize: '2.8rem'
    },
    h3: {
      fontSize: '2.6rem'
    },
    h4: {
      fontSize: '2.4rem'
    },
    h5: {
      fontSize: '2.2rem'
    },
    h6: {
      fontSize: '2rem'
    }
  }
})

export default defaultTheme
