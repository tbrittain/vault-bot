import { Grid, Paper, Typography } from "@mui/material"
import React from "react"
import SearchResult from "./SearchResult"
import searchStyles from "./SearchStyles"

export default function SearchContainer({
	searchQuery,
	results,
	resultBackgroundStyle,
	resultTextStyle,
	itemType,
}) {
	const classes = searchStyles()

	let toUri
	switch (itemType) {
		case "genre":
			toUri = (id) => `/genres/${id}`
	}

	return (
		<Grid container spacing={1} className={classes.searchQueryResultContainer}>
			{results.length > 0 &&
				results.map((item) => (
					<SearchResult
						key={item.id}
						uri={toUri(item.id)}
						name={item.name}
						searchQuery={searchQuery}
						backgroundStyle={resultBackgroundStyle}
						textStyle={resultTextStyle}
					/>
				))}
			{results.length === 0 && (
				<Grid item className={classes.searchResultNoneFound}>
					<Paper
						style={{
							padding: 10,
						}}
					>
						<Typography variant="subtitle1">No results found :(</Typography>
					</Paper>
				</Grid>
			)}
		</Grid>
	)
}
