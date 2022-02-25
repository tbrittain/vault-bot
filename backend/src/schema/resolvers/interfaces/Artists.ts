export interface IArtistInfo {
  id?: string
  name?: string
}

export interface IFindArtistsLikeArgs {
  searchQuery: string
}

export interface IArtistSongsParent {
  id: string
}

export interface IArtistGenresParent {
  id: string
}

export interface IArtistWikiBioParent {
  name: string
}
