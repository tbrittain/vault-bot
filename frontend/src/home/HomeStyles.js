import { makeStyles } from '@material-ui/core/styles'

const homeStyles = makeStyles((theme) => ({
  generalStats: {
    display: 'flex',
    flexDirection: 'column'
  },
  container: {
    width: '100%'
  },
  statsContainer: {
    margin: 'auto'
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
    margin: 15
  },
  statDescription: {
    fontWeight: 300
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
    marginLeft: 5
  }
}))

export default homeStyles
