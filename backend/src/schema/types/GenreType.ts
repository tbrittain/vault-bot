import { gql } from 'apollo-server-express'

export default gql`
  type Genre {
    name: String!
    numArtists: Int
    rank: Int
  }
`
