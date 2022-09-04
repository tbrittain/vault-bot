import React from "react"
import ArtistAlbums from "./ArtistAlbums"
import artistStyles from "./ArtistStyles"
import {
	Avatar,
	Box,
	Button,
	Chip,
	Paper,
	Typography,
	useMediaQuery,
} from "@mui/material"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { EmojiEvents } from "@mui/icons-material"

const ArtistDetails = (props) => {
	const artistLink = `spotify:artist:${props.id}`
	const classes = artistStyles()
	const isSmallScreen = useMediaQuery("(max-width:850px)")
	const rank = props.rank

	const desktopRankStyling =
		!isSmallScreen && props.name.length < 14
			? {
					position: "absolute",
					top: 10,
					right: 10,
			  }
			: {}

	return (
		<Paper elevation={3}>
			<div style={{ position: "relative" }} className={classes.artistTop}>
				<Box className={classes.artistTopContent}>
					<Avatar
						className={classes.artistArt}
						alt={props.name}
						src={props.artistArt}
					/>
					<div
						style={{
							width: "75%",
						}}
					>
						<Typography
							variant="h2"
							className={classes.artistName}
							sx={{ fontWeight: "bold" }}
						>
							<i
								style={{
									textAlign: "center",
								}}
							>
								{props.name}
							</i>
						</Typography>
					</div>
					<Button
						variant="contained"
						component="a"
						href={artistLink}
						style={{
							margin: 10,
							backgroundColor: "rgb(35, 207, 95)",
							color: "white",
						}}
					>
						Open on Spotify
						<OpenInNewIcon
							style={{
								paddingLeft: 4,
							}}
						/>
					</Button>
				</Box>
				{rank && rank.numNonUniqueSongs > 1 && (
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
							label={`#${rank.numUniqueSongsRank} by number of unique songs (${rank.numUniqueSongs})`}
							icon={<EmojiEvents />}
							color="secondary"
							sx={{
								width: "fit-content",
								margin: "3px",
							}}
						/>
						<Chip
							label={`#${rank.numNonUniqueSongsRank} by total number of songs (${rank.numNonUniqueSongs})`}
							icon={<EmojiEvents />}
							color="secondary"
							sx={{
								width: "fit-content",
								margin: "3px",
							}}
						/>
					</Box>
				)}
			</div>
			<ArtistAlbums albumSongs={props.albumSongs} />
		</Paper>
	)
}

export default ArtistDetails
