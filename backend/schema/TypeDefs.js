const { gql } = require('apollo-server-express')

// TODO: getAvgSongDetails query

const typeDefs = gql`

  type Artist {
    id: String!
    name: String!
    art: String
    genres: [Genre]
    songs: [Song!]!
    wikiBio: wikiBio
  }

  # TODO: integrate with discogs as well: https://www.discogs.com/developers/
  type wikiBio {
    bio: String
    url: String
  }

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

  type Genre {
    genre: String!
    numArtists: Int
    rank: Int
  }

  type CurrentOverallStats {
    pdi: Float!
    novelty: Float!
    dynamicNumTracks: Int!
    archiveNumTracks: Int!
    totalNumTracks: Int!
    totalNumArtists: Int!
    totalNumGenres: Int!
  }

  type Query {
    getArtist(id: String, name: String): Artist!
    getGenres(limit: Int): [Genre!]!
    getArtists: [Artist!]!
    getArtistsFromGenre(genreName: String!): [Artist!]!
    getArchiveTracks(startDate: String, endDate: String): [Song!]!
    getTracks: [Song!]!
    getCurrentOverallStats: CurrentOverallStats!
    getTrack(id: String!): Song!
    getAvgTrackDetails(genre: String): SongDetails!
    getSongsFromAlbum(album: String!, artistId: String!): [Song!]!
    findTracksLike(searchQuery: String!): [Song!]!
    findArtistsLike(searchQuery: String!): [Artist!]!
    findGenresLike(searchQuery: String!): [Genre!]!
  }
`

module.exports = { typeDefs }
