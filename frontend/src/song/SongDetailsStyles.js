import { makeStyles } from '@material-ui/core/styles'

const songDetailsStyles = makeStyles((theme) => ({
  albumArt: {
    height: '25%',
    width: '25%',
    margin: theme.spacing(2),
    boxShadow: '0px 0px 4px #adadad',
    '&:hover': {
      animation: '$rotate 4s',
      'animation-timing-function': 'linear',
      'animation-iteration-count': 'infinite'
    }
  },
  albumArtNoRotate: {
    height: '25%',
    width: '25%',
    margin: theme.spacing(2),
    boxShadow: '0px 0px 4px #adadad'
  },
  container: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center'
  },
  containerItem: {
    margin: 'auto 0',
    padding: '5%'
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

export default songDetailsStyles
