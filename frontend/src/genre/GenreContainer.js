import React, { useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@apollo/client"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import LoadingScreen from "../loading/LoadingScreen"
import ArtistGrid from "../grids/ArtistGrid"
import genreStyles from "./GenreStyles"
import genreToMuiColor from "../utils/genreToMuiColor"
import {
	Alert,
	Box,
	Button,
	Chip,
	Paper,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material"
import { ARTISTS_FROM_GENRE_QUERY } from "../queries/genreQueries"
import { EmojiEvents } from "@mui/icons-material"

const GenreContainer = () => {
	const classes = genreStyles()
	const theme = useTheme()
	const { genreId } = useParams()
	const [genre, setGenre] = useState({})
	const [artists, setArtists] = useState([])
	const [rank, setRank] = useState()
	const isSmallScreen = useMediaQuery("(max-width:850px)")

	const { loading, error } = useQuery(ARTISTS_FROM_GENRE_QUERY, {
		variables: {
			genreId,
		},
		onCompleted: (data) => {
			setGenre(data?.getGenre)
			setArtists(data?.getArtistsFromGenre)
			setRank(data?.getGenre?.genreRank)
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

	const desktopRankStyling =
		!isSmallScreen && genre.name.length < 14
			? {
					position: "absolute",
					top: 10,
					right: 10,
			  }
			: {}

	return (
		<>
			<Typography variant="h1">Genre Details</Typography>
			<Paper
				className={classes.title}
				elevation={3}
				style={{
					backgroundColor: genreToMuiColor(genre.name),
					position: "relative",
				}}
			>
				<Box>
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
				</Box>
				{rank && rank.numSongs > 1 && (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							flexDirection: "column",
							alignItems: "center",
							...desktopRankStyling,
						}}
					>
						<Chip
							label={`#${rank.numArtistsRank} by number of artists (${rank.numArtists})`}
							icon={<EmojiEvents />}
							color="secondary"
							sx={{
								width: "fit-content",
								margin: "6px",
							}}
						/>
						<Chip
							label={`#${rank.numSongsRank} by number of songs (${rank.numSongs})`}
							icon={<EmojiEvents />}
							color="secondary"
							sx={{
								width: "fit-content",
							}}
						/>
					</Box>
				)}
			</Paper>
			<ArtistGrid artists={artists} />
		</>
	)
}

export default GenreContainer
