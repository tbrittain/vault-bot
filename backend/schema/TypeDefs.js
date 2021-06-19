const { gql } = require('apollo-server-express')

const typeDefs = gql`
  # Types
  type Artist {
    id: String!
    name: String!
    art: String!
  }

  type Query {
    getArtist(id: String!, name: String): Artist!
  }
`

module.exports = { typeDefs }
