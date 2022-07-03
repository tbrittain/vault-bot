import React, { useState } from "react"
import { useQuery } from "@apollo/client"
import CharCompare from "./CharCompare"
import songStyles from "./SongStyles"
import { Alert, CircularProgress, Typography } from "@mui/material"
import { AVG_SONG_CHARS_QUERY } from "../queries/songQueries"

// TODO: replace with radar chart
// https://www.chartjs.org/docs/latest/charts/radar.html

const SongChars = (props) => {
	const [characteristics, setCharacteristics] = useState()
	const classes = songStyles()

	const { loading, error } = useQuery(AVG_SONG_CHARS_QUERY, {
		onCompleted: (data) => {
			setCharacteristics(data?.getAvgTrackDetails)
		},
	})

	if (loading) {
		return (
			<div style={{ display: "flex", justifyContent: "center" }}>
				<CircularProgress />
			</div>
		)
	}

	if (error) {
		return (
			<Alert severity="error">An error occurred during data retrieval :(</Alert>
		)
	}

	return (
		<div
			className={classes.innerContainer}
			style={{
				flexDirection: "column",
				marginTop: 10,
			}}
		>
			<div className={classes.songComparisonSmall}>
				<div
					style={{
						width: "50%",
						margin: "auto",
						textAlign: "left",
					}}
				>
					<Typography
						variant="subtitle1"
						sx={{
							lineHeight: "inherit",
							marginBottom: 10,
							fontSize: "2ch",
							fontWeight: "fontWeightLight",
						}}
					>
						{props.songName}
					</Typography>
				</div>
				<div
					style={{
						width: "50%",
						margin: "auto",
						textAlign: "right",
					}}
				>
					<Typography
						variant="subtitle1"
						sx={{
							lineHeight: "inherit",
							fontSize: "2ch",
							fontWeight: "fontWeightLight",
						}}
					>
						Total song average
					</Typography>
				</div>
			</div>
			<div style={{ display: "flex" }}>
				<div className={classes.songComparison}>
					<Typography
						variant="h6"
						sx={{
							fontWeight: "fontWeightLight",
							lineHeight: "inherit",
						}}
					>
						{props.songName}
					</Typography>
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						margin: 15,
					}}
				>
					<CharCompare
						name="length"
						avgStat={characteristics.length}
						stat={props.details.length}
					/>
					<CharCompare
						name="tempo"
						avgStat={characteristics.tempo}
						stat={props.details.tempo}
					/>
					<CharCompare
						name="energy"
						avgStat={characteristics.energy}
						stat={props.details.energy}
					/>
					<CharCompare
						name="danceability"
						avgStat={characteristics.danceability}
						stat={props.details.danceability}
					/>
					<CharCompare
						name="valence"
						avgStat={characteristics.valence}
						stat={props.details.valence}
					/>
					<CharCompare
						name="loudness"
						avgStat={characteristics.loudness}
						stat={props.details.loudness}
					/>
				</div>
				<div className={classes.songComparison}>
					<Typography
						variant="h6"
						sx={{
							fontWeight: "fontWeightLight",
							lineHeight: "inherit",
						}}
					>
						Total song average
					</Typography>
				</div>
			</div>
		</div>
	)
}

export default SongChars
