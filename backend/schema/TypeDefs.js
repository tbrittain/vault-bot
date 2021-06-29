const { gql } = require('apollo-server-express')

const typeDefs = gql`

  type Artist {
    id: String!
    name: String!
    art: String
    rank: Int!
    genres: [Genre]
    songs: [Song!]!
  }

  type Song {
    id: String!
    artistId: String!
    artistName: String!
    name: String!
    album: String!
    art: String
    previewUrl: String
    details: SongDetails!
    addedBy: String
    addedAt: String
  }

  type SongDetails {
    length: Float!
    tempo: Float!
    danceability: Float!
    energy: Float!
    loudness: Float!
    acousticness: Float!
    instrumentalness: Float!
    liveness: Float!
    valence: Float!
  }

  type Genre {
    genre: String!
    rank: Int!
  }

  type CurrentOverallStats {
    pdi: Float!
    novelty: Float!
    dynamicNumTracks: Int!
    archiveNumTracks: Int!
    totalNumTracks: Int!
    totalNumArtists: Int!
    totalNumGenres: Int!
  }

  type Query {
    getArtist(id: String, name: String): Artist!
    getGenres(limit: Int): [Genre!]!
    getArtistsFromGenre(genreName: String!): [Artist!]!
    getArchiveTracks(startDate: String, endDate: String): [Song!]!
    getDynamicTracks: [Song!]!
    getCurrentOverallStats: CurrentOverallStats!
    getTrack(id: String!): Song!
  }
`

module.exports = { typeDefs }
