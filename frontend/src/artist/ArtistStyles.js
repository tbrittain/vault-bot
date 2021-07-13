import { makeStyles } from '@material-ui/core/styles'

const artistStyles = makeStyles((theme) => ({
  artistTop: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    background: theme.palette.primary.light,
    boxShadow: `0px 0px 4px ${theme.palette.primary.main}`
  },
  artistName: {
    fontWeight: 800,
    color: theme.palette.secondary.main,
    textAlign: 'center'
  },
  artistArt: {
    width: '12vw',
    height: '12vw',
    margin: 'auto',
    boxShadow: '0px 0px 4px #adadad',
    minHeight: 75,
    minWidth: 75
  },
  album: {
    display: 'grid',
    gridTemplate: '1fr / 1fr',
    placeItems: 'center',
    background: 'none',
    marginTop: 50,
    marginBottom: 50
  },
  albumInner: {
    gridColumn: '1 / 1',
    gridRow: '1 / 1',
    height: '100%',
    width: '100%'
  },
  albumDetails: {
    display: 'flex'
  },
  albumName: {
    paddingLeft: '5vw',
    textAlign: 'center'
  },
  albumText: {
    width: '12vw',
    lineHeight: 'inherit',
    marginTop: 5,
    color: theme.palette.secondary.main,
    fontWeight: 300
  },
  albumArt: {
    width: '12vw',
    height: '12vw',
    margin: 'auto',
    boxShadow: '0px 0px 4px #adadad',
    minHeight: 75,
    minWidth: 75
  },
  albumSongGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    flexFlow: 'wrap'
  },
  artistSongCard: {
    textDecoration: 'none',
    height: 'fit-content',
    margin: 5,
    padding: 10,
    alignItems: 'center',
    display: 'flex',
    transition: '0.3s',
    background: theme.palette.primary.light,
    '&:hover': {
      background: theme.palette.primary.main
    }
  }
}))

export default artistStyles
