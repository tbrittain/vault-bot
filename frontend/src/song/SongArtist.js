import React from "react"
import songStyles from "./SongStyles"
import { Link } from "react-router-dom"
import { Avatar, Paper, Typography } from "@mui/material"

const SongArtist = (props) => {
	const classes = songStyles()
	return (
		<Paper elevation={3} className={classes.artistContainer}>
			{props.artists.map((artist) => (
				<div
					className={classes.containerItem}
					key={`artist-container-${artist.id}`}
				>
					<Avatar
						alt={artist.name}
						src={artist.art}
						className={classes.artistArt}
						component={Link}
						to={`/artists/${artist.id}`}
						sx={{
							marginBottom: "0.5rem",
						}}
					/>
					<Typography
						variant="h6"
						className={classes.artistName}
						component={Link}
						to={`/artists/${artist.id}`}
						sx={{
							fontWeight: "fontWeightBold",
						}}
					>
						<i>{artist.name}</i>
					</Typography>
				</div>
			))}
		</Paper>
	)
}

export default SongArtist
