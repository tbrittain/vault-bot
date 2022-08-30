import { gql } from 'apollo-server-express'

export default gql`
  scalar UUID
  scalar DateTime
  scalar NonNegativeInt

  type Query {
    # Artists
    getArtist(id: String, name: String): Artist!
    getArtists: [Artist!]!
    getFeaturedArtist: Artist!
    getArtistsFromGenre(genreId: UUID!): [Artist!]!
    findArtistsLike(searchQuery: String!): [Artist!]!

    # Genres
    getGenres(limit: NonNegativeInt): [Genre!]!
    findGenresLike(searchQuery: String!): [Genre!]!

    # Tracks
    getTrack(id: String!): Song!
    getTracks: [Song!]!
    getSimilarTracks(id: String!, limit: NonNegativeInt): [SimilarSong]!
    getAvgTrackDetails: SongDetails!
    getTracksFromAlbum(album: String!, artistId: String!): [Song!]!
    findTracksLike(searchQuery: String!): [Song!]!
    getWhenTrackAddedByUsers(id: String!): [SongHistory!]!

    # Hist data
    getHistGenres(startDate: DateTime!, endDate: DateTime): [HistGenre!]
    getHistTracking(startDate: DateTime!, endDate: DateTime): [HistTracking!]

    # Misc
    getCurrentOverallStats: CurrentOverallStats!
    getChangeLogPosts: [ChangeLogPost!]!
  }
`
