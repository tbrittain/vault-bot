import React from "react"
import artistStyles from "./ArtistStyles"
import { useQuery } from "@apollo/client"
import { Alert, CircularProgress, Paper, Typography } from "@mui/material"
import { useTheme } from "@mui/styles"
import { ARTIST_BIO_QUERY } from "../queries/artistQueries"

const ArtistBio = (props) => {
	const classes = artistStyles()
	const { artistId } = props
	const theme = useTheme()

	const [bio, setBio] = React.useState()
	const [url, setUrl] = React.useState()

	const { loading, error } = useQuery(ARTIST_BIO_QUERY, {
		variables: {
			artistId,
		},
		onCompleted: (data) => {
			setBio(data?.getArtist?.wikiBio?.bio)
			setUrl(data?.getArtist?.wikiBio?.url)
		},
	})

	if (loading) {
		return (
			<div
				style={{
					margin: "auto",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					padding: "3%",
				}}
			>
				<CircularProgress />
				<Typography variant="body1">
					Searching for artist biography...
				</Typography>
			</div>
		)
	}

	if (error) {
		return (
			<Alert severity="error">An error occurred during data retrieval :(</Alert>
		)
	}

	return (
		<>
			<Typography variant="h1">Artist Bio</Typography>
			<Typography
				variant="subtitle2"
				sx={{
					color: "secondary.main",
				}}
			>
				<i>Experimental</i>
			</Typography>
			{!bio && (
				<Typography>
					<i>No bio available for this artist yet</i>
				</Typography>
			)}
			{bio && (
				<Paper
					elevation={3}
					className={classes.artistBio}
					sx={{
						backgroundColor: "primary.main",
					}}
				>
					<Typography
						variant="body1"
						sx={{
							fontWeight: "fontWeightLight",
							color:
								theme.palette.mode === "light"
									? theme.palette.secondary.main
									: theme.palette.primary.contrastText,
						}}
					>
						{bio}
					</Typography>
					<hr
						style={{
							border: `1px solid ${theme.palette.primary.dark}`,
						}}
					/>
					<Typography
						variant="body1"
						sx={{
							fontWeight: "fontWeightLight",
							textAlign: "center",
						}}
					>
						See more on{" "}
						<a
							href={url}
							className={classes.link}
							target="_blank"
							rel="noopener noreferrer"
						>
							Wikipedia
						</a>
					</Typography>
				</Paper>
			)}
		</>
	)
}

export default ArtistBio
