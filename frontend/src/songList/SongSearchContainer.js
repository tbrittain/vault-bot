import React, { useState } from "react"
import { useQuery } from "@apollo/client"
import { Alert, Box, Typography } from "@mui/material"
import { SONG_SEARCH_QUERY } from "../queries/songQueries"
import SearchContainer from "../search/SearchContainer"

const SongSearchContainer = (props) => {
	const { searchQuery } = props
	const [results, setResults] = useState([])

	const { error } = useQuery(SONG_SEARCH_QUERY, {
		variables: {
			searchQuery,
		},
		onCompleted: (data) => {
			setResults(data?.findTracksLike)
		},
	})

	if (error) {
		return (
			<Alert severity="error">An error occurred during data retrieval :(</Alert>
		)
	}

	const innerText = (artist) => (
		<>
			<Box component="span" sx={{ fontWeight: "fontWeightLight" }}>
				{" "}
				by
			</Box>{" "}
			{artist}
		</>
	)

	const postText = (album) => (
		<>
			<Typography
				variant="body2"
				sx={{
					textDecoration: "none",
					fontWeight: "fontWeightLight",
				}}
			>
				<Box component="span" sx={{ fontWeight: "fontWeightLight" }}>
					from the album
				</Box>{" "}
				{album}
			</Typography>
		</>
	)

	return (
		<SearchContainer
			results={results}
			searchQuery={searchQuery}
			itemType="song"
			textInnerContent={innerText}
			textInnerContentKey="artist"
			textPostContent={postText}
			textPostContentKey="album"
		/>
	)
}

export default SongSearchContainer
