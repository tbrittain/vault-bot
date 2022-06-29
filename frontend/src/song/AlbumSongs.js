import React, { useState } from "react"
import { useQuery } from "@apollo/client"
import { useParams } from "react-router-dom"
import AlbumSong from "./AlbumSong"
import songStyles from "./SongStyles"
import { Typography } from "@mui/material"
import { SONGS_FROM_ALBUM_QUERY } from "../queries/songQueries"

const AlbumSongs = (props) => {
	const classes = songStyles()
	const { songId } = useParams()
	const { artistId, album } = props
	const [songs, setSongs] = useState([])

	useQuery(SONGS_FROM_ALBUM_QUERY, {
		variables: {
			artistId,
			album,
		},
		onCompleted: (data) => {
			setSongs(data?.getTracksFromAlbum?.filter((song) => song.id !== songId))
		},
	})

	if (!songs.length) return null

	return (
		<div>
			<Typography
				variant="subtitle1"
				style={{
					textAlign: "center",
				}}
			>
				Other songs from this album tracked by VaultBot:
			</Typography>
			<div className={classes.albumGrid}>
				{songs.map((song) => (
					<AlbumSong
						key={song.id}
						songId={song.id}
						name={song.name}
						art={song.art}
					/>
				))}
			</div>
		</div>
	)
}

export default AlbumSongs
