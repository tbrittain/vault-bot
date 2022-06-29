import React from "react"
import { Link } from "react-router-dom"
import artistStyles from "./ArtistStyles"
import { Button, Typography } from "@mui/material"

const ArtistAlbumSong = (props) => {
	const classes = artistStyles()
	const { id, name } = props
	return (
		<Button
			className={classes.artistSongButton}
			component={Link}
			to={`/songs/${id}`}
			variant="contained"
			lang="en"
			sx={{
				margin: "0.5rem",
			}}
		>
			<Typography variant="body1" className={classes.artistSongName}>
				{name}
			</Typography>
		</Button>
	)
}

export default ArtistAlbumSong
