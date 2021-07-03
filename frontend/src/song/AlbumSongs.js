import React from 'react'
import { useQuery, gql } from '@apollo/client'
import {
  Typography
} from '@material-ui/core'
import { useParams } from 'react-router-dom'
import AlbumSong from './AlbumSong'
import songStyles from './SongStyles'

const QUERY = gql`
  query($artistId: String!, $album: String!) {
    getSongsFromAlbum(artistId: $artistId, album: $album) {
      name
      id
      art
      previewUrl
    }
  }
`

const AlbumSongs = (props) => {
  const classes = songStyles()
  const { songId } = useParams()
  const { artistId, album } = props
  const { data } = useQuery(
    QUERY,
    {
      variables: {
        artistId,
        album
      }
    }
  )

  let formattedData
  if (data) {
    formattedData = data.getSongsFromAlbum
    formattedData = formattedData.filter(song => song.id !== songId)
    console.log(formattedData)
  }
  return (
    <div>
      {formattedData && formattedData.length > 0 &&
        <div>
          <Typography
            variant='subtitle1'
          >
            Other songs from this album tracked by VaultBot:
          </Typography>
          <div
            className={classes.albumGrid}
          >
            {formattedData.map(song => (
              <AlbumSong
                key={song.id}
                songId={song.id}
                name={song.name}
                art={song.art}
                songPreview={song.previewUrl}
              />
            ))}
          </div>
        </div>}
    </div>
  )
}

export default AlbumSongs
