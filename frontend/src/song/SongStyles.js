import { makeStyles } from '@material-ui/core/styles'

const songStyles = makeStyles((theme) => ({
  albumArtRotate: {
    '&:hover': {
      cursor: 'pointer',
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
  outerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '24vw',
    maxWidth: '100%',
    margin: theme.spacing(1),
    padding: theme.spacing(2)
  },
  innerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex'
  },
  songCharsContainer: {
    width: '100%'
  },
  artistContainer: {
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
    textAlign: 'center',
    display: 'block'
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
    margin: 'auto',
    boxShadow: '0px 0px 4px #adadad'
  },
  genreContainer: {
    width: '65%'
  },
  navText: {
    color: theme.palette.secondary.dark
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
