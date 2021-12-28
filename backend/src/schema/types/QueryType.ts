import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    # Artists
    getArtist(id: String, name: String): Artist!
    getArtists: [Artist!]!
    getFeaturedArtist: Artist!
    getArtistsFromGenre(genreName: String!): [Artist!]!
    findArtistsLike(searchQuery: String!): [Artist!]!

    # Genres
    getGenres(limit: Int): [Genre!]!
    findGenresLike(searchQuery: String!): [Genre!]!

    # Tracks
    getTrack(id: String!): Song!
    getTracks: [Song!]!
    getSimilarTracks(id: String!, limit: Int): [SimilarSong]!
    getArchiveTracks(startDate: String, endDate: String): [Song!]!
    getAvgTrackDetails: SongDetails!
    getTracksFromAlbum(album: String!, artistId: String!): [Song!]!
    findTracksLike(searchQuery: String!): [Song!]!

    # Hist data
    getHistGenres(startDate: String!, endDate: String): [HistGenre!]
    getHistTracking(startDate: String!, endDate: String): [HistTracking!]

    # Misc
    getCurrentOverallStats: CurrentOverallStats!
    getChangeLogPosts: [ChangeLogPost!]!
  }
`
