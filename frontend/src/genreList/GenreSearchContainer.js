import React, { useState } from "react"
import { useQuery } from "@apollo/client"
import { Alert, useTheme } from "@mui/material"
import { GENRE_SEARCH_QUERY } from "../queries/genreQueries"
import SearchContainer from "../search/SearchContainer"
import genreToMuiColor from "../utils/genreToMuiColor"

export default function GenreSearchContainer({ searchQuery }) {
	const theme = useTheme()
	const [results, setResults] = useState([])
	const { error } = useQuery(GENRE_SEARCH_QUERY, {
		variables: {
			searchQuery,
		},
		onCompleted: (data) => {
			setResults(data?.findGenresLike)
		},
	})

	const backgroundStyle = (name) => ({
		background: genreToMuiColor(name),
	})

	const textStyle = (name) => ({
		textDecoration: "none",
		lineHeight: "inherit",
		color: theme.palette.getContrastText(genreToMuiColor(name)),
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
			itemType="genre"
			resultBackgroundStyle={backgroundStyle}
			resultTextStyle={textStyle}
		/>
	)
}
