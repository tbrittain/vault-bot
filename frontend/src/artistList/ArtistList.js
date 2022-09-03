import React, { useState } from "react"
import { useQuery } from "@apollo/client"
import { Link } from "react-router-dom"
import LoadingScreen from "../loading/LoadingScreen"
import artistListStyles from "./ArtistListStyles"
import { Alert, Avatar } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { ALL_ARTISTS_QUERY } from "../queries/artistQueries"

const columns = [
	{
		field: "art",
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
		field: "name",
		headerName: "Artist",
		width: 150,
		renderCell: (params) => (
			<Link
				to={`/artists/${params.id}`}
				className={artistListStyles().artistListLink}
			>
				{params.value}
			</Link>
		),
	},
	{
		field: "numUniqueSongs",
		headerName: "# Unique Songs",
		width: 150,
		type: "number",
	},
	{
		field: "numUniqueSongsRank",
		headerName: "# Unique Songs Rank",
		width: 150,
		type: "number",
	},
	{
		field: "numNonUniqueSongs",
		headerName: "# Songs",
		width: 150,
		type: "number",
	},
	{
		field: "numNonUniqueSongsRank",
		headerName: "# Songs Rank",
		width: 150,
		type: "number",
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
					name: artist.name,
					numUniqueSongs: artist.artistRank?.numUniqueSongs,
					numUniqueSongsRank: artist.artistRank?.numUniqueSongsRank,
					numNonUniqueSongs: artist.artistRank?.numNonUniqueSongs,
					numNonUniqueSongsRank: artist.artistRank?.numNonUniqueSongsRank,
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
				<DataGrid
					columns={columns}
					rows={rows}
					rowHeight={75}
					initialState={{
						sorting: {
							sortModel: [
								{ field: "numUniqueSongs", sort: "desc" },
								{ field: "numUniqueSongsRank", sort: "asc" },
							],
						},
					}}
				/>
			</div>
		</div>
	)
}

export default ArtistList
