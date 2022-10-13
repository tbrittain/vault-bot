import { Grid, Paper, Typography } from "@mui/material"
import extractUnderline from "../utils/underline"
import searchStyles from "./SearchStyles"
import { Link } from "react-router-dom"
import React from "react"

export default function SearchResult({
	searchQuery,
	name,
	uri,
	backgroundStyle,
	textStyle,
}) {
	const classes = searchStyles()
	const { beginText, underline, endText } = extractUnderline(
		String(searchQuery),
		String(name)
	)

	return (
		<Grid
			item
			spacing={2}
			component={Link}
			to={uri}
			style={{
				textDecoration: "none",
				width: "100%",
			}}
		>
			<Paper className={classes.genreResultItem} style={backgroundStyle}>
				<div
					style={{
						margin: "auto auto",
						textAlign: "center",
						padding: "0.5rem",
					}}
				>
					<Typography variant="subtitle1" style={textStyle}>
						{beginText}
						<u>{underline}</u>
						{endText}
					</Typography>
				</div>
			</Paper>
		</Grid>
	)
}
