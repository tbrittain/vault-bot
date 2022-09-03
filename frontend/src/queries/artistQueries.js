import { gql } from "@apollo/client"

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

// TODO: Update this with ranking too
export const FEATURED_ARTIST_QUERY = gql`
	query featuredArtistQuery {
		getFeaturedArtist {
			name
			id
			art
			genres {
				id
				name
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
			artistRank {
				numUniqueSongs
				numUniqueSongsRank
				numNonUniqueSongs
				numNonUniqueSongsRank
			}
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
				name
				id
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
