import React, { useState } from "react"
import { useQuery } from "@apollo/client"
import { Link } from "react-router-dom"
import LoadingScreen from "../loading/LoadingScreen"
import artistListStyles from "./ArtistListStyles"
import { Alert, Avatar } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { ALL_ARTISTS_QUERY } from "../queries/artistQueries"

// TODO - DataGrid API has changed
const columns = [
	{
		field: "artistArt",
		headerName: "Artist Art",
		width: 175,
		sortable: false,
		filterable: false,
		renderCell: (params) => (
			<Avatar
				src={params.row.art}
				variant="square"
				style={{
					width: "100%",
					height: "100%",
				}}
			/>
		),
	},
	{
		field: "artistName",
		headerName: "Artist",
		width: 300,
		renderCell: (params) => (
			<Link
				to={`/artists/${params.id}`}
				className={artistListStyles().artistListLink}
			>
				{params.value}
			</Link>
		),
	},
]

const ArtistList = () => {
	const classes = artistListStyles()
	const [rows, setRows] = useState([])

	const { loading, error } = useQuery(ALL_ARTISTS_QUERY, {
		onCompleted: (data) => {
			const temp = []
			for (const artist of data.getArtists) {
				const newRow = {
					id: artist.id,
					art: artist.art,
					artistName: artist.name,
				}
				temp.push(newRow)
			}
			setRows(temp)
		},
	})

	if (loading) {
		return <LoadingScreen text="Loading artists tracked by VaultBot..." />
	}

	if (error) {
		return (
			<Alert severity="error">An error occurred during data retrieval :(</Alert>
		)
	}

	return (
		<div className={classes.totalArtistResults}>
			<div
				style={{
					flexGrow: 1,
				}}
			>
				<DataGrid columns={columns} rows={rows} rowHeight={75} />
			</div>
		</div>
	)
}

export default ArtistList
