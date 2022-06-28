import { gql } from '@apollo/client'

export const GENERAL_STATS_QUERY = gql`
	query generalStatsQuery {
		getCurrentOverallStats {
			dynamicNumTracks
			archiveNumTracks
			totalNumTracks
			totalNumArtists
			totalNumGenres
		}
	}
`

export const HISTORICAL_GENRES_QUERY = gql`
	query historicalGenresQuery($startDate: String!) {
		getHistGenres(startDate: $startDate) {
			updatedAt
			genre
			count
		}
	}
`
