import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import SongDetails from './SongDetails'
import SongArtists from './SongArtist'
import LoadingScreen from '../loading/LoadingScreen'
import { Alert, Grid, Typography } from '@mui/material'
import { SONG_QUERY } from '../queries/songQueries'

const SongContainer = () => {
	const { songId } = useParams()
	const { loading, error, data } = useQuery(SONG_QUERY, {
		variables: {
			songId,
		},
	})

	let formattedData
	let processing = true
	if (data) {
		formattedData = data
		formattedData = data.getTrack
		processing = false
	}

	if (loading || processing) {
		return <LoadingScreen text="Loading song..." />
	}

	if (error) {
		return (
			<Alert severity="error">An error occurred during data retrieval :(</Alert>
		)
	}

	return (
		<>
			<Grid container direction="column" justify="space-evenly">
				<Typography variant="h1">Song Details</Typography>
				<SongDetails
					album={formattedData.album}
					name={formattedData.name}
					artistName={formattedData.artists[0].name}
					artistId={formattedData.artists[0].id}
					art={formattedData.art}
					songPreview={formattedData.previewUrl}
					details={formattedData.details}
					id={songId}
				/>
				<Typography variant="h2">
					{formattedData.artists.length > 1 ? 'Artists' : 'Artist'}
				</Typography>
				<SongArtists artists={formattedData.artists} />
			</Grid>
		</>
	)
}

export default SongContainer
