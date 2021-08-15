export interface GetArtistsArgs {
  id?: string,
  name?: string
}

export interface FindArtistsLikeArgs {
  searchQuery: string
}

export interface ArtistSongsParent {
  id: string
}

export interface ArtistGenresParent {
  id: string
}

export interface ArtistWikiBioParent {
  name: string
}
