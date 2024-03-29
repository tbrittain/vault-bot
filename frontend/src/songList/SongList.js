import React, { useState } from "react"
import { useQuery } from "@apollo/client"
import { Link } from "react-router-dom"
import LoadingScreen from "../loading/LoadingScreen"
import minTommss from "../utils/minTommss"
import songListStyles from "./SongListStyles"
import { Alert, Avatar } from "@mui/material"
import { withStyles } from "@mui/styles"
import { DataGrid, GridToolbar } from "@mui/x-data-grid"
import { ALL_SONGS_QUERY } from "../queries/songQueries"

// Wrap DataGrid toolbar
const GlobalCss = withStyles({
	"@global": {
		".MuiDataGrid-toolbarContainer": {
			flexFlow: "wrap",
		},
	},
})(() => null)

const columns = [
	{
		field: "albumArt",
		headerName: "Album Art",
		width: 50,
		sortable: false,
		filterable: false,
		renderCell: (params) => <Avatar src={params.row.art} variant="square" />,
	},
	{
		field: "songName",
		headerName: "Song",
		width: 160,
		renderCell: (params) => (
			<Link
				to={`/songs/${params.id}`}
				className={songListStyles().songListLink}
			>
				{params.value}
			</Link>
		),
	},
	{
		field: "artists",
		headerName: "Artists",
		width: 250,
		renderCell: (params) => {
			const artists = params.formattedValue
			return (
				<>
					{artists.map((artist, index, self) => (
						<>
							<Link
								to={`/artists/${artist.id}`}
								className={songListStyles().songListLink}
							>
								{artist.name}
							</Link>
							{index !== self.length - 1 && ", "}
						</>
					))}
				</>
			)
		},
	},
	{
		field: "albumName",
		headerName: "Album",
		width: 125,
	},
	{
		field: "numTimesAdded",
		headerName: "# Times Added",
	},
	{
		field: "rank",
		headerName: "Rank",
	},
	{
		field: "length",
		headerName: "Song Length",
		type: "number",
		width: 110,
		valueFormatter: (params) => minTommss(params.value),
	},
	{
		field: "danceability",
		headerName: "Danceability",
		type: "number",
	},
	{
		field: "energy",
		headerName: "Energy",
		type: "number",
	},
	{
		field: "valence",
		headerName: "Valence",
		description:
			'A measure of "happiness" in a sense, with a higher number meaning more happy',
		type: "number",
	},
	{
		field: "loudness",
		headerName: "Loudness",
		description:
			"Average loudness in dB (probably RMS) relative to 0 dB being the maximum speaker output until distortion",
		type: "number",
	},
]

const SongList = () => {
	const classes = songListStyles()
	const [rows, setRows] = useState([])

	const { loading, error } = useQuery(ALL_SONGS_QUERY, {
		onCompleted: (data) => {
			const temp = []
			for (const track of data.getTracks) {
				const newRow = {
					id: track.id,
					art: track.art,
					songName: track.name,
					albumName: track.album,
					length: track.details.length,
					danceability: track.details.danceability,
					energy: track.details.energy,
					valence: track.details.valence,
					loudness: track.details.loudness,
					artists: track.artists,
					numTimesAdded: track.songRank?.numTimesAdded,
					rank: track.songRank?.rank,
				}
				temp.push(newRow)
			}
			setRows(temp)
		},
	})

	if (loading) {
		return <LoadingScreen text="Loading songs tracked by VaultBot..." />
	}

	if (error) {
		return (
			<Alert severity="error">An error occurred during data retrieval :(</Alert>
		)
	}

	return (
		<div className={classes.totalSongResults}>
			<div
				style={{
					flexGrow: 1,
				}}
			>
				<GlobalCss />
				<DataGrid
					columns={columns}
					rows={rows}
					rowHeight={35}
					components={{
						Toolbar: GridToolbar,
					}}
					initialState={{
						sorting: {
							sortModel: [
								{ field: "numTimesAdded", sort: "desc" },
								{ field: "rank", sort: "asc" },
							],
						},
					}}
				/>
			</div>
		</div>
	)
}

export default SongList
