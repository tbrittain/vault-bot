import React from "react"
import artistListStyles from "./ArtistListStyles"
import { Link } from "react-router-dom"
import extractUnderline from "../utils/underline"
import { Avatar, Grid, Paper, Typography } from "@mui/material"

const ArtistSearchResult = (props) => {
	const classes = artistListStyles()
	const { beginText, underline, endText } = extractUnderline(
		String(props.searchQuery),
		String(props.name)
	)

	return (
		<Grid
			item
			spacing={2}
			component={Link}
			to={`/artists/${props.id}`}
			style={{
				textDecoration: "none",
				width: "100%",
			}}
		>
			<Paper className={classes.artistResultItem}>
				<div
					style={{
						padding: "0.5rem",
					}}
				>
					<Avatar
						alt={props.name}
						src={props.art}
						className={classes.searchResultArt}
					/>
				</div>
				<div
					style={{
						margin: "auto auto",
						textAlign: "center",
						padding: "0.5rem",
					}}
				>
					<Typography
						variant="subtitle1"
						style={{
							textDecoration: "none",
							lineHeight: "inherit",
						}}
					>
						{beginText}
						<u>{underline}</u>
						{endText}
					</Typography>
				</div>
			</Paper>
		</Grid>
	)
}

export default ArtistSearchResult
