import React, { useState } from "react"
import homeStyles from "./HomeStyles"
import { useQuery } from "@apollo/client"
import CountUpAnimation from "../effects/CountUpAnimation"
import "./textAnimate.css"
import { Alert, CircularProgress, Grid, Typography } from "@mui/material"
import { GENERAL_STATS_QUERY } from "../queries/statsQueries"

const GeneralStats = () => {
	const classes = homeStyles()
	const [stats, setStats] = useState()

	const { loading, error } = useQuery(GENERAL_STATS_QUERY, {
		onCompleted: (data) => {
			setStats(data.getCurrentOverallStats)
		},
	})

	if (loading) {
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

	if (!stats) return null

	return (
		<div className={classes.generalStats}>
			<div
				style={{
					width: "100%",
				}}
			>
				<svg className={classes.animateText}>
					<symbol id="s-text">
						<text textAnchor="middle" x="50%" y="80%">
							At a Glance:
						</text>
					</symbol>
					<g className="g-ants">
						<use xlinkHref="#s-text" className="textCopy" />
						<use xlinkHref="#s-text" className="textCopy" />
						<use xlinkHref="#s-text" className="textCopy" />
						<use xlinkHref="#s-text" className="textCopy" />
						<use xlinkHref="#s-text" className="textCopy" />
					</g>
				</svg>
			</div>
			<Grid
				className={classes.statsContainer}
				container
				direction="column"
				justifyContent="space-between"
				alignItems="center"
			>
				<Grid item className={classes.animateContainer}>
					<Typography variant="h6" className={classes.statDescription}>
						Tracks in dynamic playlist:
					</Typography>
					<Typography variant="h6" className={classes.numberHighlight}>
						<i>
							<CountUpAnimation>
								{Number(stats.dynamicNumTracks)}
							</CountUpAnimation>
						</i>
					</Typography>
				</Grid>
				<Grid
					item
					className={classes.animateContainer}
					style={{
						animationDelay: "0.25s",
					}}
				>
					<Typography variant="h6" className={classes.statDescription}>
						Tracks in archive playlist:
					</Typography>
					<Typography variant="h6" className={classes.numberHighlight}>
						<i>
							<CountUpAnimation>
								{Number(stats.archiveNumTracks)}
							</CountUpAnimation>
						</i>
					</Typography>
				</Grid>
				<Grid
					item
					className={classes.animateContainer}
					style={{
						animationDelay: "0.5s",
					}}
				>
					<Typography variant="h6" className={classes.statDescription}>
						Unique tracks:
					</Typography>
					<Typography variant="h6" className={classes.numberHighlight}>
						<i>
							<CountUpAnimation>
								{Number(stats.totalNumTracks)}
							</CountUpAnimation>
						</i>
					</Typography>
				</Grid>
				<Grid
					item
					className={classes.animateContainer}
					style={{
						animationDelay: "0.75s",
					}}
				>
					<Typography variant="h6" className={classes.statDescription}>
						Unique artists:
					</Typography>
					<Typography variant="h6" className={classes.numberHighlight}>
						<i>
							<CountUpAnimation>
								{Number(stats.totalNumArtists)}
							</CountUpAnimation>
						</i>
					</Typography>
				</Grid>
				<Grid
					item
					className={classes.animateContainer}
					style={{
						animationDelay: "1s",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						textAlign: "center",
					}}
				>
					<div
						style={{
							display: "inline-flex",
						}}
					>
						<Typography variant="h6" className={classes.statDescription}>
							Unique genres:
						</Typography>
						<Typography variant="h6" className={classes.numberHighlight}>
							<i>
								<CountUpAnimation>
									{Number(stats.totalNumGenres)}
								</CountUpAnimation>
							</i>
						</Typography>
					</div>
					<div>
						<Typography
							variant="subtitle1"
							style={{
								color: "grey",
							}}
						>
							<i>
								({((Number(stats.totalNumGenres) / 5508) * 100).toFixed(2)}% of
								total genres tracked by Spotify!)
							</i>
						</Typography>
					</div>
				</Grid>
			</Grid>
		</div>
	)
}

export default GeneralStats
