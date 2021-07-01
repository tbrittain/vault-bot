import { makeStyles } from '@material-ui/core/styles'

const songStyles = makeStyles((theme) => ({
  albumArtRotate: {
    '&:hover': {
      animation: '$rotate 4s',
      'animation-timing-function': 'linear',
      'animation-iteration-count': 'infinite'
    }
  },
  albumArt: {
    width: '15vw',
    height: '15vw',
    margin: theme.spacing(4),
    boxShadow: '0px 0px 4px #adadad'
  },
  container: {
    margin: theme.spacing(1),
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '18vw',
    maxWidth: '100%'
  },
  containerItem: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  songDescription: {
    width: '75%',
    textAlign: 'center'
  },
  artistName: {
    textDecoration: 'none',
    color: theme.palette.primary.dark,
    transition: '0.3s',
    '&:hover': {
      color: theme.palette.primary.main
    }
  },
  artistArt: {
    width: '12vw',
    height: '12vw',
    margin: theme.spacing(2),
    boxShadow: '0px 0px 4px #adadad'
  },
  genreContainer: {
    width: '65%'
  },
  '@keyframes rotate': {
    from: {
      transform: 'rotate(0deg)'
    },
    to: {
      transform: 'rotate(359deg)'
    }
  }
}))

export default songStyles
