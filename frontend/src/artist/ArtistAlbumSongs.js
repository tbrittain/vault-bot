import React from 'react'
import artistStyles from './ArtistStyles'
import ArtistAlbumSong from './ArtistAlbumSong'

const ArtistAlbumSongs = (props) => {
  const classes = artistStyles()
  const { songs } = props
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div className={classes.albumSongGrid}>
        {songs.map((song) => (
          <ArtistAlbumSong key={song.id} id={song.id} name={song.name} />
        ))}
      </div>
    </div>
  )
}

export default ArtistAlbumSongs
