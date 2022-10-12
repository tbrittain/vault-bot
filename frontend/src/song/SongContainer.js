import React, { useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import { useQuery } from "@apollo/client"
import SongDetails from "./SongDetails"
import SongArtists from "./SongArtist"
import LoadingScreen from "../loading/LoadingScreen"
import { Alert, Grid, Typography } from "@mui/material"
import { SONG_QUERY } from "../queries/songQueries"

const SongContainer = () => {
	const { songId } = useParams()
	const [song, setSong] = useState()
	const [rank, setRank] = useState()
	const [processing, setProcessing] = useState(true)

	const { error } = useQuery(SONG_QUERY, {
		variables: {
			songId,
		},
		onCompleted: (data) => {
			setSong(data?.getTrack)
			setRank(data?.getTrack?.songRank)
			setProcessing(false)
		},
	})

	if (processing) {
		return <LoadingScreen text="Loading song..." />
	}

	if (error) {
		return (
			<Alert severity="error">An error occurred during data retrieval :(</Alert>
		)
	}

	if (!song) {
		return (
			<div>
				<Navigate to="/404" />
			</div>
		)
	}

	return (
		<>
			<Grid container direction="column" justify="space-evenly">
				<Typography variant="h1">Song Details</Typography>
				<SongDetails
					album={song.album}
					name={song.name}
					artistName={song.artists[0].name}
					artistId={song.artists[0].id}
					art={song.art}
					songPreview={song.previewUrl}
					details={song.details}
					id={songId}
					rank={rank}
				/>
				<Typography variant="h2">
					{song.artists.length > 1 ? "Artists" : "Artist"}
				</Typography>
				<SongArtists artists={song.artists} />
			</Grid>
		</>
	)
}

export default SongContainer
