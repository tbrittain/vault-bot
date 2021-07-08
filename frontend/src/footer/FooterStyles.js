import { makeStyles } from '@material-ui/core/styles'

const footerStyles = makeStyles((theme) => ({
  footer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 15
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.secondary.dark,
    transition: '0.3s',
    '&:hover': {
      color: theme.palette.primary.main
    }
  },
  copyrightLink: {
    textDecoration: 'none',
    color: 'inherit',
    transition: '0.3s',
    '&:hover': {
      color: theme.palette.primary.main
    }
  },
  footerActions: {
    margin: 'auto'
  }
}))

export default footerStyles
