import { gql } from 'apollo-server-express'

export default gql`
  type Genre {
    id: UUID!
    name: String!
    numArtists: Int
    rank: Int
  }
`
