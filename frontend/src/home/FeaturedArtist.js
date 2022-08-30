import React from "react"
import homeStyles from "./HomeStyles"
import { useQuery } from "@apollo/client"
import { Link } from "react-router-dom"
import GenreGrid from "../grids/GenreGrid"
import {
	Alert,
	Avatar,
	CircularProgress,
	Paper,
	Typography,
	useTheme,
} from "@mui/material"
import { FEATURED_ARTIST_QUERY } from "../queries/artistQueries"

const FeaturedArtist = () => {
	const classes = homeStyles()

	const [artist, setArtist] = React.useState()
	const [artistGenres, setArtistGenres] = React.useState([])
	const { loading, error } = useQuery(FEATURED_ARTIST_QUERY, {
		onCompleted: (data) => {
			setArtist(data?.getFeaturedArtist)
			setArtistGenres(data?.getFeaturedArtist?.genres)
		},
	})

	const theme = useTheme()

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

	const dateToday = new Date(artist.featured)
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
					{dateToday.toLocaleDateString(undefined, {
						weekday: "long",
						month: "long",
						day: "numeric",
					})}
				</Typography>
			</div>
			<div>
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
				<div className={classes.genreContainer}>
					<GenreGrid genres={artistGenres} />
				</div>
			</div>
		</div>
	)
}

export default FeaturedArtist
