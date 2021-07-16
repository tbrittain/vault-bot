import { makeStyles } from '@material-ui/core/styles'

const headerStyles = makeStyles((theme) => ({
  header: {
    flexGrow: 1
  },
  headerContainer: {
    height: '4rem',
    zIndex: 20,
    [theme.breakpoints.down('sm')]: {
      height: '6.5rem'
    }
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
  },
  actionButtons: {
    position: 'absolute',
    float: 'right',
    right: 25,
    [theme.breakpoints.down('sm')]: {
      position: 'inherit',
      right: 0
    }
  },
  titleContainer: {
    display: 'inline-flex',
    textDecoration: 'none',
    [theme.breakpoints.down('sm')]: {
      margin: 'auto auto',
      paddingTop: 5
    }
  },
  toolbar: {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column'
    }
  }
}))

export default headerStyles
