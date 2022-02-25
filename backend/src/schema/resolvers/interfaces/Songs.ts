export interface IGetTrackArgs {
  id: string
}

export interface IGetTracksFromAlbumArgs {
  album: string
  artistId: string
}

export interface IFindTracksLikeArgs {
  searchQuery: string
}

export interface ISongDetails {
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

export interface ISongArtist {
  artistId: string
}

export interface IGetSimilarTracksArgs {
  id: string
  limit?: number
}
