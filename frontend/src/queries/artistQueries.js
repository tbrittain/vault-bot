import { gql } from '@apollo/client'

export const ARTIST_SEARCH_QUERY = gql`
  query artistSearchQuery($searchQuery: String!) {
    findArtistsLike(searchQuery: $searchQuery) {
      name
      id
      art
    }
  }
`

export const ARTIST_BIO_QUERY = gql`
  query artistBioQuery($artistId: String!) {
    getArtist(id: $artistId) {
      id
      wikiBio {
        bio
        url
      }
    }
  }
`

export const FEATURED_ARTIST_QUERY = gql`
  query featuredArtistQuery {
    getFeaturedArtist {
      name
      id
      art
      genres {
        genre
      }
      featured
    }
  }
`

export const ALL_ARTISTS_QUERY = gql`
  query allArtistsQuery {
    getArtists {
      name
      id
      art
    }
  }
`

export const ARTIST_QUERY = gql`
  query artistQuery($artistId: String!) {
    getArtist(id: $artistId) {
      name
      id
      art
      genres {
        genre
      }
      songs {
        name
        id
        art
        album
      }
    }
  }
`
