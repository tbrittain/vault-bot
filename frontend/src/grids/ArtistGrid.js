import React from "react"
import ArtistPreview from "./ArtistPreview"
import gridStyles from "./GridStyles"
import { Paper } from "@mui/material"

const ArtistGrid = (props) => {
	const classes = gridStyles()
	const { artists } = props

	return (
		<Paper elevation={3} className={classes.artistGrid}>
			{artists.map((artist) => (
				<ArtistPreview
					key={artist.id}
					id={artist.id}
					name={artist.name}
					art={artist.art}
				/>
			))}
		</Paper>
	)
}

export default ArtistGrid
