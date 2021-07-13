import { makeStyles } from '@material-ui/core/styles'

const gridStyles = makeStyles((theme) => ({
  gridList: {
    flexWrap: 'wrap',
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
    minWidth: 150,
    height: '-moz-fit-content'
  },
  button: {
    width: '10vw',
    minWidth: 125,
    minHeight: 75
  },
  buttonContent: {
    flexDirection: 'column',
    alignItems: 'center'
  },
  artistGrid: {
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'center'
  },
  artistCard: {
  },
  artistArt: {
    height: '12vw',
    width: '12vw',
    minWidth: 100,
    minHeight: 100,
    transition: 'transform .2s',
    '&:hover': {
      transform: 'scale(2)',
      zIndex: 10,
      boxShadow: '0px 0px 2px #000'
    }
  }
}))

export default gridStyles
