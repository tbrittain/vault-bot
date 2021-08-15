import { gql } from 'apollo-server-express'

export default gql`
  type Genre {
    genre: String!
    numArtists: Int
    rank: Int
  }
`
