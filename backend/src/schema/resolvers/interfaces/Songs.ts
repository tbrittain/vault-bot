export interface GetTrackArgs {
  id: string
}

export interface GetTracksFromAlbumArgs {
  album: string
  artistId: string
}

export interface FindTracksLikeArgs {
  searchQuery: string
}

export interface GetArchiveTracksArgs {
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

export interface GetSimilarTracksArgs {
  id: string
  limit?: number
}
