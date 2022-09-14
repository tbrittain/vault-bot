import { gql } from 'apollo-server-express'

export default gql`
	type Genre {
		id: UUID!
		name: String!
		genreRank: GenreRank
	}

	type GenreRank {
		numArtists: NonNegativeInt!
		numArtistsRank: NonNegativeInt!
		numSongs: NonNegativeInt!
		numSongsRank: NonNegativeInt!
	}
`
