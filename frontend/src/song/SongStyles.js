import { makeStyles } from '@material-ui/core/styles'

const songStyles = makeStyles((theme) => ({
  albumArtRotate: {
    '&:hover': {
      cursor: 'pointer',
      animation: '$rotate 4s',
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite'
    }
  },
  albumArt: {
    width: 'calc(12vw + 5rem)',
    height: 'calc(12vw + 5rem)',
    margin: theme.spacing(4),
    boxShadow: '0px 0px 4px #adadad'
  },
  outerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
    overflow: 'auto'
  },
  innerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex'
  },
  songCharsContainer: {
    width: '100%',
    display: 'grid',
    gridGap: '2vw',
    gridTemplateColumns: '1fr 1fr 1fr'
  },
  artistContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  containerItem: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    display: 'block',
    padding: '2vw'
  },
  songDescription: {
    width: '75%',
    textAlign: 'center'
  },
  artistName: {
    textDecoration: 'none',
    color: theme.palette.secondary.main,
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
  navBar: {
    zIndex: 10
  },
  albumGrid: {
    display: 'flex',
    justifyContent: 'center',
    flexFlow: 'wrap'
  },
  albumSongCard: {
    margin: 5,
    display: 'grid',
    gridTemplate: '1fr / 1fr',
    placeItems: 'center',
    flex: '1 0 auto',
    maxWidth: '13vw'
  },
  albumInner: {
    gridColumn: '1 / 1',
    gridRow: '1 / 1',
    height: '100%',
    width: '100%',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex'
  },
  albumText: {
    color: theme.palette.secondary.main,
    mixBlendMode: 'color-burn',
    margin: 5,
    textDecoration: 'none',
    transition: '0.3s',
    padding: '0 3%',
    height: 'fit-content',
    lineHeight: 'inherit',
    '&:hover': {
      color: theme.palette.secondary.light
    }
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
