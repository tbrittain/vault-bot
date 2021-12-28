import { gql } from 'apollo-server-express'

export default gql`
  type Song {
    id: String!
    artistId: String!
    artist: Artist!
    name: String!
    album: String!
    art: String
    previewUrl: String
    details: SongDetails!
    addedBy: String
    addedAt: String
  }

  type SongDetails {
    length: Float!
    tempo: Float!
    danceability: Float!
    energy: Float!
    loudness: Float!
    acousticness: Float!
    instrumentalness: Float!
    liveness: Float!
    valence: Float!
  }

  type SimilarSong {
    song: Song!
    score: Float!
  }
`
