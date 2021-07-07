import { fade, makeStyles } from '@material-ui/core/styles'

const songListStyles = makeStyles((theme) => ({
  container: {
  },
  navBar: {
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto'
    }
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRoot: {
    color: 'inherit',
    fontWeight: 300
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch'
      }
    }
  },
  queryResultContainer: {
    width: '35ch',
    maxHeight: '35ch',
    overflowY: 'auto',
    background: 'none'
  },
  songResultItem: {
    display: 'flex',
    transition: '0.1s',
    '&:hover': {
      outline: `2px solid ${theme.palette.primary.main}`
    }
  },
  searchResultArt: {
    width: 60,
    height: 60,
    boxShadow: '0px 0px 2px #adadad'
  },
  totalSongResults: {

  },
  resultsController: {
    
  }
}))

export default songListStyles
