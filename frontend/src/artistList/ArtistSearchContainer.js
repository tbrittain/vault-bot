import React, { useState } from "react"
import { useQuery } from "@apollo/client"
import { Alert } from "@mui/material"
import { ARTIST_SEARCH_QUERY } from "../queries/artistQueries"
import SearchContainer from "../search/SearchContainer"

export default function ArtistSearchContainer(props) {
	const { searchQuery } = props
	const [results, setResults] = useState([])
	const { error } = useQuery(ARTIST_SEARCH_QUERY, {
		variables: {
			searchQuery,
		},
		onCompleted: (data) => {
			setResults(data?.findArtistsLike)
		},
	})

	if (error) {
		return (
			<Alert severity="error">An error occurred during data retrieval :(</Alert>
		)
	}

	return (
		<SearchContainer
			results={results}
			searchQuery={searchQuery}
			itemType="artist"
		/>
	)
}
