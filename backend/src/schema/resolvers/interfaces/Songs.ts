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

export interface IGetSimilarTracksArgs {
  id: string
  limit?: number
}
