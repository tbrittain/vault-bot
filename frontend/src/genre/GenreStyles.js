import { makeStyles } from '@material-ui/core/styles'

const genreStyles = makeStyles((theme) => ({
  title: {
    textAlign: 'left'
  },
  genreTitle: {
    textTransform: 'capitalize',
    fontWeight: 800,
    color: theme.palette.secondary.main
  }
}))

export default genreStyles
