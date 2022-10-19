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
	textInnerContent,
	textInnerContentKey,
	textPostContent,
	textPostContentKey,
}) {
	const classes = searchStyles()

	let toUri
	switch (itemType) {
		case "genre":
			toUri = (id) => `/genres/${id}`
			break
		case "song":
			toUri = (id) => `/songs/${id}`
			break
		case "artist":
			toUri = (id) => `/artists/${id}`
			break
	}

	return (
		<Grid container spacing={1} className={classes.searchQueryResultContainer}>
			{results.length > 0 &&
				results.map((item) => (
					<SearchResult
						key={item.id}
						toUri={toUri(item.id)}
						name={item.name}
						searchQuery={searchQuery}
						backgroundStyle={resultBackgroundStyle}
						textStyle={resultTextStyle}
						imageUrl={item?.art}
						textInnerContent={
							textInnerContent !== null &&
							typeof textInnerContent === "function" &&
							textInnerContentKey !== null
								? textInnerContent(item[textInnerContentKey])
								: textInnerContent !== null
								? textInnerContent
								: null
						}
						textPostContent={
							textPostContent !== null &&
							typeof textPostContent === "function" &&
							textPostContentKey !== null
								? textPostContent(item[textPostContentKey])
								: textPostContent !== null
								? textPostContent
								: null
						}
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
