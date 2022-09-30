import React, { useState } from "react"
import homeStyles from "./HomeStyles"
import { useQuery } from "@apollo/client"
import { Link } from "react-router-dom"
import GenreGrid from "../grids/GenreGrid"
import {
	Alert,
	Avatar,
	Box,
	Chip,
	CircularProgress,
	Paper,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material"
import { FEATURED_ARTIST_QUERY } from "../queries/artistQueries"
import { EmojiEvents } from "@mui/icons-material"

const FeaturedArtist = () => {
	const classes = homeStyles()

	const [artist, setArtist] = useState()
	const [featuredDate, setFeaturedDate] = useState(new Date())
	const [artistGenres, setArtistGenres] = useState([])
	const [rank, setRank] = useState()

	const { loading, error } = useQuery(FEATURED_ARTIST_QUERY, {
		onCompleted: (data) => {
			setArtist(data?.getFeaturedArtist)
			setFeaturedDate(
				getMostRecentFeaturedDate(data?.getFeaturedArtist.featuredDates)
			)
			setArtistGenres(data?.getFeaturedArtist?.genres)
			setRank(data?.getFeaturedArtist?.artistRank)
		},
	})

	const theme = useTheme()
	const isSmallScreen = useMediaQuery("(max-width:850px)")

	if (loading || !artist || !artistGenres) {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					userSelect: "none",
					"& > * + *": {
						margin: "auto auto",
					},
				}}
			>
				<CircularProgress />
				<Typography
					variant="body2"
					style={{
						marginTop: 5,
					}}
				>
					Loading stats...
				</Typography>
			</div>
		)
	}

	if (error) {
		return (
			<Alert severity="error">An error occurred during data retrieval :(</Alert>
		)
	}

	const backgroundStyling = {
		backgroundImage: `url(${artist.art})`,
		backgroundPosition: "center center",
		backgroundSize: "100vw 100vw",
		filter: "blur(20px)",
		WebkitFilter: "blur(20px)",
		overflow: "hidden",
		zIndex: 1,
		gridColumn: "1 / 1",
		gridRow: "1 / 1",
		height: "100%",
		width: "100%",
	}

	const desktopRankStyling =
		!isSmallScreen && artist.name.length < 14
			? {
					position: "absolute",
					top: 10,
					right: 10,
			  }
			: {}

	return (
		<div
			style={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<div className={classes.title}>
				<Typography
					variant="h5"
					style={{
						lineHeight: "inherit",
					}}
				>
					Featured artist for{" "}
					{featuredDate.toLocaleDateString(undefined, {
						weekday: "long",
						month: "long",
						day: "numeric",
					})}
				</Typography>
			</div>
			<div>
				<div style={{ position: "relative" }}>
					<div
						style={{
							display: "grid",
							gridTemplate: "1fr / 1fr",
							placeItems: "center",
							background: "none",
						}}
					>
						<div
							className={classes.featuredArtistInfo}
							style={{
								gridColumn: "1 / 1",
								gridRow: "1 / 1",
								height: "100%",
								width: "100%",
							}}
						>
							<Avatar
								src={artist.art}
								alt={artist.name}
								component={Link}
								to={`/artists/${artist.id}`}
								className={classes.artistArt}
							/>
							<Paper
								square={false}
								style={{
									backgroundColor: theme.palette.primary.light,
								}}
							>
								<Typography
									component={Link}
									to={`/artists/${artist.id}`}
									variant="h2"
									className={classes.featuredArtistName}
									sx={{
										fontWeight: "bold",
									}}
								>
									<i>{artist.name}</i>
								</Typography>
							</Paper>
						</div>
						<div style={backgroundStyling} />
					</div>
					{rank && (
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								flexDirection: "column",
								alignItems: "center",
								zIndex: 1000,
								...desktopRankStyling,
							}}
						>
							<Chip
								label={`#${rank.numUniqueSongsRank} by number of unique songs (${rank.numUniqueSongs})`}
								icon={<EmojiEvents />}
								color="secondary"
								sx={{
									width: "fit-content",
									margin: "6px",
								}}
							/>
							<Chip
								label={`#${rank.numNonUniqueSongsRank} by total number of songs (${rank.numNonUniqueSongs})`}
								icon={<EmojiEvents />}
								color="secondary"
								sx={{
									width: "fit-content",
									margin: "6px",
								}}
							/>
						</Box>
					)}
				</div>
				<div className={classes.genreContainer}>
					<GenreGrid genres={artistGenres} />
				</div>
			</div>
		</div>
	)
}

const getMostRecentFeaturedDate = (featuredDateObjects) => {
	if (featuredDateObjects.length === 1) {
		return new Date(featuredDateObjects[0].featuredDate)
	}

	const sortedDates = featuredDateObjects
		.map((x) => new Date(x.featuredDate))
		.sort((date1, date2) => {
			const date1time = date1.getTime()
			const date2time = date2.getTime()

			return date2time - date1time
		})

	return sortedDates[0]
}

export default FeaturedArtist
