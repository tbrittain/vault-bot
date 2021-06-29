import { makeStyles } from '@material-ui/core/styles'

const headerStyles = makeStyles((theme) => ({
  header: {
    flexGrow: 1
  },
  title: {
    flexGrow: 1,
    textDecoration: 'none',
    color: '#000',
    fontFamily: 'Rubik',
    fontWeight: 800,
    transition: '0.3s',
    '&:hover': {
      color: '#FFF'
    }
  }
}))

export default headerStyles
