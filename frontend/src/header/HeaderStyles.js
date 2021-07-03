import { makeStyles } from '@material-ui/core/styles'

const headerStyles = makeStyles((theme) => ({
  header: {
    flexGrow: 1
  },
  headerContainer: {
    height: '4rem',
    zIndex: 20
  },
  title: {
    flexGrow: 1,
    textDecoration: 'none',
    color: theme.palette.secondary.dark,
    fontFamily: 'Rubik',
    fontWeight: 800,
    transition: '0.3s',
    '&:hover': {
      color: theme.palette.secondary.light
    }
  }
}))

export default headerStyles
