import React from 'react'
import genreListStyles from './GenreListStyles'
import { Link } from 'react-router-dom'
import extractUnderline from '../utils/underline'
import genreToMuiColor from '../utils/genreToMuiColor'
import { Grid, Paper, Typography, useTheme } from '@mui/material'

const GenreSearchResult = (props) => {
  const classes = genreListStyles()
  const theme = useTheme()
  const { beginText, underline, endText } = extractUnderline(
    String(props.searchQuery),
    String(props.name)
  )

  return (
    <Grid
      item
      spacing={2}
      component={Link}
      to={`/genres/${props.name}`}
      style={{
        textDecoration: 'none',
        width: '100%',
      }}
    >
      <Paper
        className={classes.genreResultItem}
        style={{
          background: genreToMuiColor(props.name),
        }}
      >
        <div
          style={{
            margin: 'auto auto',
            textAlign: 'center',
            padding: '0.5rem',
          }}
        >
          <Typography
            variant="subtitle1"
            style={{
              textDecoration: 'none',
              lineHeight: 'inherit',
              color: theme.palette.getContrastText(genreToMuiColor(props.name)),
            }}
          >
            {beginText}
            <u>{underline}</u>
            {endText}
          </Typography>
        </div>
      </Paper>
    </Grid>
  )
}

export default GenreSearchResult
