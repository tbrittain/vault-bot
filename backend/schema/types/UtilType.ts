import { gql } from 'apollo-server-express'

export default gql`
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
