import { gql } from 'apollo-server-express'

export default gql`
	type Song {
		id: String!
		artists: [Artist!]
		name: String!
		album: String!
		art: String
		previewUrl: String
		details: SongDetails!
		history: [SongHistory!]
		songRank: SongRank
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

	type SongHistory {
		addedBy: String!
		addedAt: String!
	}

	type SongRank {
		numTimesAdded: NonNegativeInt!
		rank: NonNegativeInt!
	}
`
