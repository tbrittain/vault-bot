export interface GetTrackArgs {
  id: string
}

export interface GetSongsFromAlbumArgs {
  album: string
  artistId: string
}

export interface FindTracksLikeArgs {
  searchQuery: string
}

export interface GetArtchiveTracksArgs {
  startDate?: string
  endDate?: string
}

export interface SongDetails {
  length: string
  tempo: string
  danceability: string
  energy: string
  loudness: string
  acousticness: string
  instrumentalness: string
  liveness: string
  valence: string
}

export interface SongArtist {
  artistId: string
}
