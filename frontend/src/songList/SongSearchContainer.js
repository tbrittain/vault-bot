import React, { useState } from 'react'
import songListStyles from './SongListStyles'
import { useQuery } from '@apollo/client'
import SongSearchResult from './SongSearchResult'
import { Alert, Grid, Paper, Typography } from '@mui/material'
import { SONG_SEARCH_QUERY } from '../queries/songQueries'

const SongSearchContainer = (props) => {
	const classes = songListStyles()
	const { searchQuery } = props
	const [results, setResults] = useState([])

	const { error } = useQuery(SONG_SEARCH_QUERY, {
		variables: {
			searchQuery,
		},
		onCompleted: (data) => {
			setResults(data?.findTracksLike)
		},
	})

	if (error) {
		return (
			<Alert severity='error'>An error occurred during data retrieval :(</Alert>
		)
	}

	return (
		<Grid container spacing={1} className={classes.queryResultContainer}>
			{results &&
				results.map((song) => (
					<SongSearchResult
						key={song.id}
						name={song.name}
						id={song.id}
						art={song.art}
						artist={song.artists[0].name}
						album={song.album}
						searchQuery={searchQuery}
					/>
				))}
			{(results && results.length === 0) && (
				<Grid item className={classes.songResultNoneFound}>
					<Paper
						style={{
							padding: 10,
						}}
					>
						<Typography variant='subtitle1'>No results found :(</Typography>
					</Paper>
				</Grid>
			)}
		</Grid>
	)
}

export default SongSearchContainer
