import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@apollo/client"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import LoadingScreen from "../loading/LoadingScreen"
import ArtistGrid from "../grids/ArtistGrid"
import CountUpAnimation from "../effects/CountUpAnimation"
import genreStyles from "./GenreStyles"
import genreToMuiColor from "../utils/genreToMuiColor"
import { Alert, Button, Paper, Typography, useTheme } from "@mui/material"
import { ARTISTS_FROM_GENRE_QUERY } from "../queries/genreQueries"

const GenreContainer = () => {
	const classes = genreStyles()
	const theme = useTheme()
	const { genreId } = useParams()
	const [genre, setGenre] = useState({})
	const [artists, setArtists] = useState([])

	const { loading, error } = useQuery(ARTISTS_FROM_GENRE_QUERY, {
		variables: {
			genreId,
		},
		onCompleted: (data) => {
			setGenre(data?.getGenre)
			setArtists(data?.getArtistsFromGenre)
		},
	})

	if (loading) {
		return <LoadingScreen text="Loading genre..." />
	}

	if (error || !artists.length) {
		return (
			<Alert severity="error">An error occurred during data retrieval :(</Alert>
		)
	}

	const everyNoiseGenre = genre.name
		.replaceAll(" ", "")
		.replaceAll("&", "")
		.replaceAll("-", "")

	const everyNoiseLink = `https://everynoise.com/engenremap-${everyNoiseGenre}.html`

	return (
		<>
			<Typography variant="h1">Genre Details</Typography>
			<Paper
				className={classes.title}
				elevation={3}
				style={{
					backgroundColor: genreToMuiColor(genre.name),
				}}
			>
				<Typography
					variant="h2"
					sx={{
						color: theme.palette.getContrastText(genreToMuiColor(genre.name)),
						textTransform: "capitalize",
						fontWeight: "fontWeightBold",
					}}
				>
					<i>{genre.name}</i>
				</Typography>
				<Typography
					variant="h6"
					style={{
						fontWeight: "fontWeightLight",
						color: theme.palette.getContrastText(genreToMuiColor(genre.name)),
					}}
				>
					Total artists:{" "}
					{artists.length >= 20 && (
						<CountUpAnimation>{Number(artists.length)}</CountUpAnimation>
					)}
					{artists.length < 20 && artists.length}
				</Typography>
				<Button
					variant="outlined"
					component="a"
					href={everyNoiseLink}
					target="_blank"
					rel="noopener noreferrer"
					style={{
						color: theme.palette.getContrastText(genreToMuiColor(genre.name)),
					}}
				>
					Open on EveryNoise
					<OpenInNewIcon
						style={{
							paddingLeft: 4,
						}}
					/>
				</Button>
			</Paper>
			<ArtistGrid artists={artists} />
		</>
	)
}

export default GenreContainer
