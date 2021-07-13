import React from 'react'
import ArtistAlbum from './ArtistAlbum'

const ArtistAlbums = (props) => {
  const { albumSongs } = props
  return (
    <div>
      {Object.keys(albumSongs).map(album => {
        return (
          <ArtistAlbum
            key={albumSongs[album].name}
            name={albumSongs[album].name}
            art={albumSongs[album].art}
            songs={albumSongs[album].songs}
          />
        )
      })}
    </div>
  )
}

export default ArtistAlbums
