import React from 'react'
import tableStyles from './TableStyles'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button
} from '@material-ui/core'
import { Link } from 'react-router-dom'

const GenreTable = (props) => {
  const classes = tableStyles()
  return (
    <TableContainer component={Paper}>
      <Table
        className={classes.table}
        size='small'
        aria-label='genre table'
      >
        <TableHead>
          <TableRow>
            {props.headers.map(header => (
              <TableCell
                align='center'
                key={header}
              >
                <Typography
                  variant='h6'
                >
                  {header}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map(row => (
            <TableRow key={row[0]}>
              {row.map(cell => (
                <TableCell
                  key={cell}
                  align='center'
                >
                  <Button
                    color='inherit'
                    component={Link}
                    to={`/genres/${cell}`}
                  >
                    {cell}
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default GenreTable
