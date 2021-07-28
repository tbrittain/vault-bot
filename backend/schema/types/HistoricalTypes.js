const { gql } = require('apollo-server-express')

module.exports = gql`
  type HistGenre {
    updatedAt: String!
    genre: String!
    count: Int!
  }

  type HistTracking {
    updatedAt: String!
    pdi: Float!
    popularity: Float!
    danceability: Float!
    energy: Float!
    valence: Float!
    songLength: Float!
    tempo: Float!
    novelty: Float
  }
`
