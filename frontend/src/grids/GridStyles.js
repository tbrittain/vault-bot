import { makeStyles } from '@material-ui/core/styles'

const gridStyles = makeStyles((theme) => ({
  gridList: {
    flexWrap: 'nowrap',
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: 'translateZ(0)',
    margin: 0
  },
  gridContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2)
  },
  tile: {
  },
  button: {
    height: '10vw',
    width: '10vw'
  },
  buttonContent: {
    display: 'flex',
    flexDirection: 'column'
  }
}))

export default gridStyles
