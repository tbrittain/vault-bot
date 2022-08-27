import React from "react"
import ArtistViewer from "./ArtistViewer"
import { Typography } from "@mui/material"

const ArtistListContainer = () => {
	return (
		<div>
			<Typography variant="h1">Artists</Typography>
			<Typography variant="subtitle1">
				Total list of all the artists tracked by VaultBot
			</Typography>
			<ArtistViewer />
		</div>
	)
}

export default ArtistListContainer
