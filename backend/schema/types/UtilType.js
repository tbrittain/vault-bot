const { gql } = require('apollo-server-express')

module.exports = gql`
  type CurrentOverallStats {
    pdi: Float!
    novelty: Float!
    dynamicNumTracks: Int!
    archiveNumTracks: Int!
    totalNumTracks: Int!
    totalNumArtists: Int!
    totalNumGenres: Int!
  }

  type ChangeLogPost {
    post: String!
    date: String!
  }
`
