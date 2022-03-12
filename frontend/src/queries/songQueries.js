import { gql } from '@apollo/client'

export const AVG_SONG_CHARS_QUERY = gql`
  query averageSongCharsQuery {
    getAvgTrackDetails {
      acousticness
      danceability
      energy
      instrumentalness
      length
      liveness
      loudness
      tempo
      valence
    }
  }
`

export const SONG_QUERY = gql`
  query songQuery($songId: String!) {
    getTrack(id: $songId) {
      name
      id
      album
      art
      previewUrl
      artist {
        id
        name
        art
        genres {
          genre
        }
      }
      details {
        length
        tempo
        danceability
        energy
        loudness
        acousticness
        instrumentalness
        liveness
        valence
      }
    }
  }
`

export const SONGS_FROM_ALBUM_QUERY = gql`
  query songsFromAlbumQuery($artistId: String!, $album: String!) {
    getTracksFromAlbum(artistId: $artistId, album: $album) {
      name
      id
      art
    }
  }
`

export const SONG_SEARCH_QUERY = gql`
  query songSearchQuery($searchQuery: String!) {
    findTracksLike(searchQuery: $searchQuery) {
      name
      id
      art
      album
      artist {
        name
      }
    }
  }
`

export const ALL_SONGS_QUERY = gql`
  query allSongsQuery {
    getTracks {
      name
      id
      art
      album
      details {
        length
        danceability
        energy
        valence
        loudness
      }
    }
  }
`

export const ALL_SONGS_QUERY_SIMPLE = gql`
  query allSongsQuerySimple {
    getTracks {
      name
      id
      art
      album
    }
  }
`

export const SIMILAR_SONGS_QUERY = gql`
  query similarSongsQuery($getSimilarTracksId: String!) {
    getSimilarTracks(id: $getSimilarTracksId) {
      song {
        id
        name
        art
        album
        artistId
        artist {
          name
        }
      }
      score
    }
  }
`

export const SONG_ADDED_HISTORY_QUERY = gql`
  query songAddedHistoryQuery($getWhenTrackAddedByUsersId: String!) {
    getWhenTrackAddedByUsers(id: $getWhenTrackAddedByUsersId) {
      addedAt
      addedBy
    }
  }
`
