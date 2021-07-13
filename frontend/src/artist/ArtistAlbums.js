import React from 'react'
import artistStyles from './ArtistStyles'

const ArtistAlbums = (props) => {
  const { albumSongs } = props
  return (
    <div>
      {Object.keys(albumSongs).forEach(album => {
        console.log(albumSongs[album])
      })}
    </div>
  )
}

export default ArtistAlbums
