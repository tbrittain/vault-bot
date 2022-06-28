import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import songStyles from './SongStyles'
import { Link } from 'react-router-dom'
import {
	Alert,
	Avatar,
	Box,
	CircularProgress,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material'
import { SIMILAR_SONGS_QUERY } from '../queries/songQueries'

export default function SimilarSongs(props) {
	const { songId } = props
	const [similarSongs, setSimilarSongs] = useState([])
	const { loading, error } = useQuery(SIMILAR_SONGS_QUERY, {
		variables: { getSimilarTracksId: songId },
		onCompleted: (data) => {
			setSimilarSongs(data?.getSimilarTracks)
		},
	})
	const isMobile = useMediaQuery('(max-width:400px)')

	const classes = songStyles()
	const theme = useTheme()

	if (loading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<CircularProgress />
			</div>
		)
	}

	if (error) {
		return (
			<Alert severity="error">An error occurred during data retrieval :(</Alert>
		)
	}

	if (similarSongs.length === 0) {
		return (
			<Box>
				<Typography variant="h6">No similar songs found :(</Typography>
			</Box>
		)
	}

	return (
		<div
			className={classes.innerContainer}
			style={{ flexDirection: 'column', width: '100%' }}
		>
			{similarSongs.map((song) => (
				<div key={song.song.id} className={classes.similarSong}>
					<div
						className={classes.similarSongInner}
						style={{
							zIndex: 2,
							display: 'flex',
							justifyContent: 'space-between',
						}}
					>
						<Link
							to={`/songs/${song.song.id}`}
							style={{
								textDecoration: 'none',
								width: '100%',
							}}
						>
							<div className={classes.similarSongDetails}>
								{!isMobile && (
									<Avatar
										src={song.song.art}
										alt={song.song.name}
										className={classes.similarSongArt}
									/>
								)}
								<div style={{ width: '80%' }}>
									<Typography
										variant="h6"
										className={classes.albumText}
										sx={{
											textDecoration: 'none',
											lineHeight: '1.15',
											fontWeight: 'fontWeightRegular',
											[theme.breakpoints.down('sm')]: {
												fontSize: '1.5rem',
											},
										}}
									>
										{song.song.name}
									</Typography>
									<Typography
										variant="h6"
										className={classes.albumText}
										sx={{
											fontWeight: 'fontWeightLight',
											[theme.breakpoints.down('sm')]: {
												fontSize: '1.5rem',
											},
										}}
									>
										by{' '}
										<Box
											display="inline"
											sx={{
												fontWeight: 'fontWeightRegular',
												[theme.breakpoints.down('sm')]: {
													fontSize: '1.5rem',
												},
											}}
										>
											{song.song.artists[0].name}
										</Box>
									</Typography>
								</div>
							</div>
						</Link>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								marginRight: '1rem',
							}}
						>
							<Avatar
								className={classes.similarSongScore}
								style={{
									color:
										song.score > 65
											? theme.palette.getContrastText(
													`hsl(${song.score * 5.4}, 100%, 50%)`
											  )
											: theme.palette.getContrastText('hsl(351, 100%, 50%)'),
									backgroundColor:
										song.score > 65
											? `hsl(${song.score * 5.4}, 100%, 50%)`
											: 'hsl(351, 100%, 50%)',
								}}
							>
								<Typography
									variant="subtitle1"
									className={classes.similarSongScoreText}
								>
									{song.score.toFixed(1)}%
								</Typography>
							</Avatar>
						</div>
					</div>
					<div
						className={classes.similarSongInner}
						style={{
							backgroundImage: `url(${song.song.art})`,
							backgroundPosition: 'center center',
							backgroundSize: '100vw 100vw',
							filter: 'blur(20px)',
							WebkitFilter: 'blur(20px)',
							overflow: 'hidden',
							zIndex: 1,
							opacity: 0.5,
						}}
					/>
				</div>
			))}
		</div>
	)
}
