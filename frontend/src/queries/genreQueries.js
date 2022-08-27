import { gql } from "@apollo/client"

export const ARTISTS_FROM_GENRE_QUERY = gql`
	query artistsFromGenreQuery($genreName: String!) {
		getArtistsFromGenre(genreName: $genreName) {
			name
			id
			art
		}
	}
`

export const GENRE_SEARCH_QUERY = gql`
	query genreSearchQuery($searchQuery: String!) {
		findGenresLike(searchQuery: $searchQuery) {
			genre
		}
	}
`

export const ALL_GENRES_QUERY = gql`
	query allGenresQuery {
		getGenres {
			genre
			numArtists
			rank
		}
	}
`
