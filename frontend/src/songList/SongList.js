import React from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  Backdrop,
  CircularProgress,
  Avatar
} from '@material-ui/core'
import {
  DataGrid
  // GridToolbar
} from '@material-ui/data-grid'
import { Alert } from '@material-ui/lab'
import { Link } from 'react-router-dom'
import minTommss from '../utils/minTommss'
import songListStyles from './SongListStyles'

// could do server-side pagination
// https://material-ui.com/components/data-grid/pagination/

const QUERY = gql`
  query {
    getTracks {
      name
      id
      art
      album
      details {
        length
        danceability
        energy
        valence
        loudness
      }
    }
  }
`

// TODO: may want to remove album art preview from song list
// to prevent getting rate-limited
const columns = [
  {
    field: 'albumArt',
    headerName: 'Album Art',
    width: 50,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <Avatar
        src={params.row.art}
        variant='square'
      />
    )
  },
  {
    field: 'songName',
    headerName: 'Song',
    width: 175,
    renderCell: (params) => (
      <Link
        to={`/songs/${params.id}`}
        className={songListStyles().songListLink}
      >
        {params.value}
      </Link>
    )
  },
  {
    field: 'albumName',
    headerName: 'Album',
    width: 125
  },
  {
    field: 'length',
    headerName: 'Song Length',
    type: 'number',
    width: 110,
    valueFormatter: (params) => (
      minTommss(params.value)
    )
  },
  {
    field: 'danceability',
    headerName: 'Danceability',
    type: 'number'
  },
  {
    field: 'energy',
    headerName: 'Energy',
    type: 'number'
  },
  {
    field: 'valence',
    headerName: 'Valence',
    description: 'A measure of "happiness" in a sense, with a higher number meaning more happy',
    type: 'number'
  },
  {
    field: 'loudness',
    headerName: 'Loudness',
    description: 'Average loudness in dB (probably RMS) relative to 0 dB being the maximum speaker output until distortion',
    type: 'number'
  }
]

const SongList = () => {
  const classes = songListStyles()

  const { error, data } = useQuery(QUERY)
  let formattedData
  const rows = []
  let processing = true
  if (data) {
    formattedData = data.getTracks
    console.log(formattedData)
    for (const track of formattedData) {
      rows.push({
        id: track.id,
        art: track.art,
        songName: track.name,
        albumName: track.album,
        length: track.details.length,
        danceability: track.details.danceability,
        energy: track.details.energy,
        valence: track.details.valence,
        loudness: track.details.loudness
      })
    }
    processing = false
  }

  return (
    <div className={classes.totalSongResults}>
      {processing &&
        <Backdrop open>
          <CircularProgress />
        </Backdrop>}
      {error &&
        <Alert severity='error'>An error occurred during data retrieval :(</Alert>}
      {formattedData &&
        <div
          style={{
            flexGrow: 1
          }}
        >
          <DataGrid
            columns={columns}
            rows={rows}
            rowHeight={35}
            // components={{
            //   Toolbar: GridToolbar
            // }}
          />
        </div>}
    </div>
  )
}

export default SongList
