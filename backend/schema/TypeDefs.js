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
    name: String!
    album: String!
    art: String
    previewUrl: String
    details: SongDetails!
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

  type Query {
    getArtist(id: String, name: String): Artist!
    getGenres(limit: Int): [Genre!]!
    getArtistsFromGenre(genreName: String!): [Artist!]!
  }
`

module.exports = { typeDefs }
