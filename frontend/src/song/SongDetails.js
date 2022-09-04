import React, { useState } from "react"
import SwipeableViews from "react-swipeable-views"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import PauseIcon from "@mui/icons-material/Pause"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import AlbumSongs from "./AlbumSongs"
import SongChars from "./SongCharacteristics"
import songStyles from "./SongStyles"
import TabPanel from "../tabpanel/TabPanel"
import SimilarSongs from "./SimilarSongs"
import SongHistory from "./SongHistory"
import {
	AppBar,
	Avatar,
	Box,
	Button,
	Chip,
	IconButton,
	Paper,
	Tab,
	Tabs,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material"
import { EmojiEvents } from "@mui/icons-material"

const SongDetails = (props) => {
	const classes = songStyles()
	const theme = useTheme()
	const songLink = `spotify:track:${props.id}`
	const rank = props.rank

	const [value, setValue] = useState(0)
	const [playing, setPlaying] = useState(false)
	const isMobile = useMediaQuery("(max-width:525px)")

	const handleChange = (event, newValue) => {
		setValue(newValue)
	}
	const handleChangeIndex = (index) => {
		setValue(index)
	}

	const playSound = () => {
		try {
			const soundFile = document.getElementById("songPreview")
			soundFile.play()
			setPlaying(true)
		} catch (err) {
			console.error(err)
		}
	}

	const stopSound = () => {
		try {
			const soundFile = document.getElementById("songPreview")
			soundFile.pause()
			soundFile.currentTime = 0
			setPlaying(false)
		} catch (err) {
			console.error(err)
		}
	}

	const tabStyle = {
		fontWeight: "fontWeightLight",
	}

	const mobileTabProps = {
		variant: "scrollable",
		scrollButtons: true,
		allowScrollButtonsMobile: true,
	}

	return (
		<Paper elevation={3} className={classes.outerContainer}>
			<AppBar position="static" className={classes.navBar}>
				{props.songPreview && (
					<audio src={props.songPreview} id="songPreview" loop preload="auto" />
				)}
				<Tabs
					value={value}
					onChange={handleChange}
					centered
					textColor="secondary"
					indicatorColor="secondary"
					{...(isMobile ? mobileTabProps : {})}
				>
					<Tab label="Details" sx={tabStyle} />
					<Tab label="Characteristics" sx={tabStyle} />
					<Tab label="Similar Songs" sx={tabStyle} />
					<Tab label="History" sx={tabStyle} />
				</Tabs>
			</AppBar>
			<SwipeableViews
				axis={theme.direction === "rtl" ? "x-reverse" : "x"}
				index={value}
				onChangeIndex={handleChangeIndex}
			>
				{/* TODO: split the index 0 tab panel into its own component*/}
				<TabPanel value={value} index={0}>
					<div className={classes.innerContainer}>
						<div className={classes.containerItem}>
							{props.songPreview && (
								<div
									style={{
										display: "grid",
										gridTemplate: "1fr / 1fr",
									}}
								>
									<div
										style={{
											gridColumn: "1 / 1",
											gridRow: "1 / 1",
											display: "flex",
											margin: "auto",
											zIndex: 51,
										}}
									>
										{!playing && (
											<IconButton
												size="medium"
												color="primary"
												style={{
													backgroundColor: "rgba(0, 0, 0, 0.4)",
												}}
												onClick={playSound}
											>
												<PlayArrowIcon fontSize="large" />
											</IconButton>
										)}
										{playing && (
											<IconButton
												size="medium"
												color="primary"
												sx={{
													backgroundColor: "rgba(0, 0, 0, 0.4)",
												}}
												onClick={stopSound}
											>
												<PauseIcon fontSize="large" />
											</IconButton>
										)}
									</div>
									<div
										style={{
											gridColumn: "1 / 1",
											gridRow: "1 / 1",
											zIndex: 50,
										}}
									>
										<Avatar
											id="albumArt"
											className={
												playing
													? `${classes.albumArt} ${classes.albumArtRotate}`
													: classes.albumArt
											}
											alt={props.album + " album art"}
											src={props.art}
											variant="circular"
										/>
									</div>
								</div>
							)}
							{!props.songPreview && (
								<Avatar
									id="albumArt"
									className={classes.albumArt}
									alt={props.album + " album art"}
									src={props.art}
									variant="circular"
								/>
							)}
						</div>
						<div
							className={`${classes.containerItem} ${classes.songDescription}`}
						>
							<Typography
								variant="h4"
								sx={{
									lineHeight: "inherit",
								}}
							>
								{props.name}{" "}
								<Box component="span" sx={{ fontWeight: "fontWeightLight" }}>
									by
								</Box>{" "}
								{props.artistName}
							</Typography>
							<Typography
								variant="h6"
								sx={{
									lineHeight: "inherit",
									[theme.breakpoints.up("sm")]: {
										paddingTop: 3,
									},
								}}
							>
								<Box component="span" sx={{ fontWeight: "fontWeightLight" }}>
									from the album
								</Box>{" "}
								{props.album}
							</Typography>
							<Button
								variant="contained"
								component="a"
								href={songLink}
								sx={{
									marginTop: "10px",
									backgroundColor: "rgb(35, 207, 95)",
									color: "white",
									fontWeight: "fontWeightLight",
								}}
							>
								Open on Spotify
								<OpenInNewIcon
									style={{
										paddingLeft: 4,
									}}
								/>
							</Button>
							{rank && rank.numTimesAdded > 1 && (
								<Box
									sx={{
										display: "flex",
										justifyContent: "center",
										flexDirection: "column",
										alignItems: "center",
									}}
								>
									<Chip
										label={`#${rank.rank} by number of times added (${rank.numTimesAdded})`}
										icon={<EmojiEvents />}
										color="secondary"
										sx={{
											width: "fit-content",
											margin: "10px",
										}}
									/>
								</Box>
							)}
						</div>
					</div>
					<div className={classes.innerContainer}>
						<AlbumSongs artistId={props.artistId} album={props.album} />
					</div>
				</TabPanel>
				<TabPanel value={value} index={1}>
					<SongChars details={props.details} songName={props.name} />
				</TabPanel>
				<TabPanel value={value} index={2}>
					<SimilarSongs songId={props.id} />
				</TabPanel>
				<TabPanel value={value} index={3}>
					<SongHistory songId={props.id} />
				</TabPanel>
			</SwipeableViews>
		</Paper>
	)
}

export default SongDetails
