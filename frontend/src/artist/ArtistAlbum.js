import React from "react"
import ArtistAlbumSongs from "./ArtistAlbumSongs"
import artistStyles from "./ArtistStyles"
import { Avatar, Typography } from "@mui/material"

const ArtistAlbum = (props) => {
	const classes = artistStyles()
	const { name, art, songs } = props
	const backgroundStyling = {
		backgroundImage: `url(${art})`,
		backgroundPosition: "center center",
		backgroundSize: "100vw 100vw",
		filter: "blur(20px)",
		WebkitFilter: "blur(20px)",
		overflow: "hidden",
		zIndex: 1,
		opacity: 0.5,
	}
	return (
		<div className={classes.album}>
			<div
				className={`${classes.albumInner} ${classes.albumDetails}`}
				style={{
					zIndex: 2,
				}}
			>
				<div className={classes.albumArtContainer}>
					<div style={{ margin: "auto" }}>
						<Avatar
							src={art}
							alt={`${art} album art`}
							variant="square"
							className={classes.albumArt}
						/>
						<Typography
							sx={{
								fontWeight: "fontWeightLight",
								color: "secondary.main",
								padding: "0.5rem 0",
								lineHeight: ["1rem", "inherit"],
								fontSize: ["0.8rem", "inherit"],
							}}
						>
							{name}
						</Typography>
					</div>
				</div>
				<ArtistAlbumSongs songs={songs} />
			</div>
			<div className={classes.albumInner} style={backgroundStyling} />
		</div>
	)
}

export default ArtistAlbum
