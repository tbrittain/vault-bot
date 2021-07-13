import { makeStyles } from '@material-ui/core/styles'

const artistStyles = makeStyles((theme) => ({
  artistTop: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    background: theme.palette.primary.light,
    boxShadow: `0px 0px 4px ${theme.palette.primary.main}`
  },
  artistName: {
    fontWeight: 800,
    color: theme.palette.secondary.main
  },
  artistArt: {
    width: '12vw',
    height: '12vw',
    margin: 'auto',
    boxShadow: '0px 0px 4px #adadad',
    minHeight: 75,
    minWidth: 75
  }
}))

export default artistStyles
