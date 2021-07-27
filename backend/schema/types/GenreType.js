const { gql } = require('apollo-server-express')

module.exports = gql`
  type Genre {
    genre: String!
    numArtists: Int
    rank: Int
  }
`
