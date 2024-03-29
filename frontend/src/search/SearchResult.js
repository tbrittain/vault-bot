import { Avatar, Grid, Paper, Typography } from "@mui/material"
import extractUnderline from "../utils/underline"
import searchStyles from "./SearchStyles"
import { Link } from "react-router-dom"
import React from "react"

export default function SearchResult({
	searchQuery,
	name,
	toUri,
	backgroundStyle,
	textStyle,
	imageUrl,
	textInnerContent,
	textPostContent,
}) {
	const classes = searchStyles()
	const { beginText, underline, endText } = extractUnderline(
		String(searchQuery),
		String(name)
	)

	let computedBackgroundStyle
	let computedTextStyle

	if (typeof backgroundStyle == "function") {
		computedBackgroundStyle = backgroundStyle(name)
	}

	if (typeof textStyle == "function") {
		computedTextStyle = textStyle(name)
	}

	return (
		<Grid
			item
			spacing={2}
			component={Link}
			to={toUri}
			style={{
				textDecoration: "none",
				width: "100%",
			}}
		>
			<Paper
				className={classes.searchResultItem}
				style={computedBackgroundStyle ?? backgroundStyle}
			>
				{imageUrl && (
					<div
						style={{
							padding: "0.5rem",
						}}
					>
						<Avatar
							alt={`Image for ${name}`}
							src={imageUrl}
							className={classes.searchResultImage}
						/>
					</div>
				)}
				<div
					style={{
						margin: "auto auto",
						textAlign: "center",
						padding: "0.5rem",
					}}
				>
					<Typography
						variant="subtitle1"
						style={computedTextStyle ?? textStyle}
					>
						{beginText}
						<u>{underline}</u>
						{endText}
						{textInnerContent}
					</Typography>
					{textPostContent}
				</div>
			</Paper>
		</Grid>
	)
}
