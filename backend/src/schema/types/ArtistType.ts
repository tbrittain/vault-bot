import { gql } from 'apollo-server-express'

export default gql`
	type Artist {
		id: String!
		name: String!
		art: String
		genres: [Genre]
		songs: [Song!]!
		wikiBio: wikiBio
		featuredDates: [FeaturedDate]!
		artistRank: ArtistRank
	}

	type wikiBio {
		bio: String
		url: String
	}

	type ArtistRank {
		numUniqueSongs: NonNegativeInt!
		numUniqueSongsRank: NonNegativeInt!
		numNonUniqueSongs: NonNegativeInt!
		numNonUniqueSongsRank: NonNegativeInt!
	}
`
