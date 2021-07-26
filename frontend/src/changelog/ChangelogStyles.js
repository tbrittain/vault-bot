import { makeStyles } from '@material-ui/core/styles'

const changeLogStyles = makeStyles((theme) => ({
  changeLogContainer: {
    maxHeight: '80vh',
    overflow: 'auto'
  },
  post: {
    margin: '5%',
    padding: '2%'
  }
}))

export default changeLogStyles
