import { makeStyles } from '@material-ui/core/styles'

const homeStyles = makeStyles((theme) => ({
  generalStats: {
    display: 'flex',
    flexDirection: 'column'
  },
  container: {
    width: '100%',
    height: 'calc(50vh + 150px)'
  }
}))

export default homeStyles
