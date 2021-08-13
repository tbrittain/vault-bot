import { gql } from 'apollo-server-express'

export default gql`
  type HistGenre {
    updatedAt: String!
    genre: String!
    count: Int!
  }

  type HistTracking {
    id: Int!
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
