import React from 'react'
import SongViewer from './SongViewer'
import { Typography } from '@mui/material'

const SongListContainer = () => {
	return (
		<div>
			<Typography variant='h1'>Songs</Typography>
			<Typography variant='subtitle1'>
				Total list of all the songs tracked by VaultBot
			</Typography>
			<SongViewer />
		</div>
	)
}

export default SongListContainer
