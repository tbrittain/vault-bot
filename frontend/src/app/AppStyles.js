import { makeStyles } from '@material-ui/core/styles'

const appStyles = makeStyles((theme) => ({
  app: {
    marginTop: '4.5rem',
    [theme.breakpoints.down('sm')]: {
      marginTop: '6.5rem'
    }
  }
}))

export default appStyles
