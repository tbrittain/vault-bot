import React from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  Avatar
} from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid'
import { Alert } from '@material-ui/lab'
import { Link } from 'react-router-dom'
import LoadingScreen from '../loading/LoadingScreen'
import artistListStyles from './ArtistListStyles'

const QUERY = gql`
  query {
    getArtists {
      name
      id
      art
    }
  }
`
const columns = [
  {
    field: 'artistArt',
    headerName: 'Artist Art',
    width: 175,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Avatar
        src={params.row.art}
        variant='square'
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    )
  },
  {
    field: 'artistName',
    headerName: 'Artist',
    width: '75vmax',
    renderCell: (params) => (
      <Link
        to={`/artists/${params.id}`}
        className={artistListStyles().artistListLink}
      >
        {params.value}
      </Link>
    )
  }
]

const ArtistList = () => {
  const classes = artistListStyles()

  const { loading, error, data } = useQuery(QUERY)
  let formattedData
  const rows = []
  let processing = true

  if (data) {
    formattedData = data.getArtists
    for (const artist of formattedData) {
      rows.push({
        id: artist.id,
        art: artist.art,
        artistName: artist.name
      })
    }
    processing = false
  }

  if (loading || processing) {
    return (
      <LoadingScreen text='Loading artists tracked by VaultBot...' />
    )
  }

  if (error) {
    return (
      <Alert severity='error'>An error occurred during data retrieval :(</Alert>
    )
  }

  return (
    <div className={classes.totalArtistResults}>
      <div
        style={{
          flexGrow: 1
        }}
      >
        <DataGrid
          columns={columns}
          rows={rows}
          rowHeight={75}
        />
      </div>
    </div>
  )
}

export default ArtistList
