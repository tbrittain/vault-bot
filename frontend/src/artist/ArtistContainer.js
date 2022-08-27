import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@apollo/client"
import LoadingScreen from "../loading/LoadingScreen"
import ArtistDetails from "./ArtistDetails"
import GenreGrid from "../grids/GenreGrid"
import ArtistBio from "./ArtistBio"
import { Alert, Grid, Paper, Typography } from "@mui/material"
import { ARTIST_QUERY } from "../queries/artistQueries"

const ArtistContainer = () => {
	const { artistId } = useParams()
	const [artistName, setArtistName] = useState("")
	const [artistArt, setArtistArt] = useState("")
	const [genres, setGenres] = useState([])
	const [albumSongs, setAlbumSongs] = useState({})
	const [numSongs, setNumSongs] = useState(0)

	const { loading, error } = useQuery(ARTIST_QUERY, {
		variables: {
			artistId,
		},
		onCompleted: (data) => {
			setArtistName(data.getArtist.name)
			setArtistArt(data.getArtist.art)
			setGenres(data.getArtist.genres.map((genre) => genre.genre))
			setNumSongs(data.getArtist.songs.length)

			const albumSongs = {}
			for (const song of data.getArtist.songs) {
				if (!Object.keys(albumSongs).includes(song.album)) {
					albumSongs[song.album] = {
						name: song.album,
						art: song.art,
						songs: [
							{
								name: song.name,
								id: song.id,
							},
						],
					}
				} else {
					albumSongs[song.album].songs.push({
						name: song.name,
						id: song.id,
					})
				}
			}
			setAlbumSongs(albumSongs)
		},
	})

	if (loading) {
		return <LoadingScreen text="Loading artist..." />
	}

	if (error) {
		return (
			<Alert severity="error">An error occurred during data retrieval :(</Alert>
		)
	}

	return (
		<>
			<Grid container direction="column" justify="space-evenly">
				<Typography variant="h1">Artist Details</Typography>
				<ArtistDetails
					name={artistName}
					albumSongs={albumSongs}
					artistArt={artistArt}
					numSongs={numSongs}
					id={artistId}
				/>
				<Typography variant="h1">Artist Genres</Typography>
				<Paper elevation={3}>
					<GenreGrid genres={genres} />
				</Paper>
				<ArtistBio artistId={artistId} />
			</Grid>
		</>
	)
}

export default ArtistContainer
