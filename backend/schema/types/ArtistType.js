const { gql } = require('apollo-server-express')

module.exports = gql`
  type Artist {
    id: String!
    name: String!
    art: String
    genres: [Genre]
    songs: [Song!]!
    wikiBio: wikiBio
    featured: String
  }

  # TODO: integrate with discogs as well: https://www.discogs.com/developers/
  type wikiBio {
    bio: String
    url: String
  }
`
