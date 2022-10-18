import React from "react"
import { Box, Typography } from "@mui/material"
import SearchResult from "../search/SearchResult"

export default function SongSearchResult({
	searchQuery,
	name,
	artist,
	album,
	id,
	art,
}) {
	const innerText = (
		<>
			<Box component="span" sx={{ fontWeight: "fontWeightLight" }}>
				{" "}
				by
			</Box>{" "}
			{artist}
		</>
	)

	const postText = (
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

	const toUri = `/songs/${id}`

	return (
		<SearchResult
			searchQuery={searchQuery}
			name={name}
			toUri={toUri}
			imageUrl={art}
			textInnerContent={innerText}
			textPostContent={postText}
		/>
	)
}
