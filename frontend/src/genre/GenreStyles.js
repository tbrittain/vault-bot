import { makeStyles } from '@material-ui/core/styles'

const genreStyles = makeStyles((theme) => ({
  title: {
    textAlign: 'center',
    padding: 15,
    marginTop: 10,
    marginBottom: 10
  },
  genreTitle: {
    textTransform: 'capitalize',
    fontWeight: 800
  }
}))

export default genreStyles
