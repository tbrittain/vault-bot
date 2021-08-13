import { gql } from 'apollo-server-express'

export default gql`
  type Query {
    getArtist(id: String, name: String): Artist!
    getGenres(limit: Int): [Genre!]!
    getArtists: [Artist!]!
    getFeaturedArtist: Artist!
    getArtistsFromGenre(genreName: String!): [Artist!]!
    getArchiveTracks(startDate: String, endDate: String): [Song!]!
    getTracks: [Song!]!
    getCurrentOverallStats: CurrentOverallStats!
    getTrack(id: String!): Song!
    getAvgTrackDetails(genre: String): SongDetails!
    getSongsFromAlbum(album: String!, artistId: String!): [Song!]!
    findTracksLike(searchQuery: String!): [Song!]!
    findArtistsLike(searchQuery: String!): [Artist!]!
    findGenresLike(searchQuery: String!): [Genre!]!
    getChangeLogPosts: [ChangeLogPost!]!
    getHistGenres (startDate: String!, endDate: String): [HistGenre!]
    getHistTracking (startDate: String!, endDate: String): [HistTracking!]
  }
`
