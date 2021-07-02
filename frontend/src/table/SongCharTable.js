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
  Typography
} from '@material-ui/core'

const SongCharTable = (props) => {
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
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default SongCharTable
