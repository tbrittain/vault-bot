import { makeStyles } from '@material-ui/core/styles'

const homeStyles = makeStyles((theme) => ({
  generalStats: {
    display: 'flex',
    flexDirection: 'column'
  },
  container: {
    width: '100%',
    height: '100%'
  },
  statsContainer: {
    margin: 'auto',
    overflowY: 'hidden'
  },
  individualStat: {
    display: 'flex'
  },
  animateContainer: {
    display: 'flex',
    animation: '$slidein 0.5s',
    animationIterationCount: 1,
    animationDirection: 'forward',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
    margin: 15,
    zIndex: 50
  },
  animateText: {
    fontSize: '5em',
    fontWeight: 800,
    width: '100%',
    height: '6vw',
    [theme.breakpoints.down('sm')]: {
      fontSize: '3.5em',
      height: '18vw'
    }
  },
  statDescription: {
    fontWeight: 300,
    [theme.breakpoints.down('sm')]: {
      fontSize: '2ch',
      textAlign: 'center'
    }
  },
  '@keyframes slidein': {
    from: {
      opacity: 0,
      transform: 'translateY(100%)'
    },
    to: {
      opacity: 1,
      transform: 'translateY(0%)'
    }
  },
  numberHighlight: {
    fontWeight: 800,
    color: theme.palette.primary.dark,
    marginLeft: 5,
    [theme.breakpoints.down('sm')]: {
      fontSize: '2ch'
    }
  }
}))

export default homeStyles
