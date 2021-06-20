const { gql } = require('apollo-server-express')

const typeDefs = gql`
  # Types
  type Artist {
    id: String!
    name: String!
    art: String
    rank: Int!
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

  type Query {
    getArtist(id: String!, name: String): Artist!
  }
`

module.exports = { typeDefs }
