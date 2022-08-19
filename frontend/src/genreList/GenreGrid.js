import React, { useState } from "react"
import { useQuery } from "@apollo/client"
import { Link } from "react-router-dom"
import LoadingScreen from "../loading/LoadingScreen"
import genreListStyles from "./GenreListStyles"
import genreToMuiColor from "../utils/genreToMuiColor"
import { Alert, Paper, Typography } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import { ALL_GENRES_QUERY } from "../queries/genreQueries"

const columns = [
	{
		field: "name",
		headerName: "Genre",
		width: 300,
		renderCell: (params) => (
			<Paper
				component={Link}
				to={`/genres/${params.id}`}
				style={{
					width: "97%",
					height: "97%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					textDecoration: "none",
					background: genreToMuiColor(params.formattedValue),
				}}
			>
				<Typography
					variant="body1"
					sx={{
						textTransform: "capitalize",
						margin: 5,
						fontWeight: "fontWeightLight",
						color: (theme) =>
							theme.palette.getContrastText(
								genreToMuiColor(params.formattedValue)
							),
					}}
				>
					{params.formattedValue}
				</Typography>
			</Paper>
		),
	},
	{
		field: "numArtists",
		headerName: "# Artists",
		width: 150,
		type: "number",
	},
	{
		field: "numArtistsRank",
		headerName: "# Artists Rank",
		width: 150,
		type: "number",
	},
	{
		field: "numSongs",
		headerName: "# Songs",
		width: 150,
		type: "number",
	},
	{
		field: "numSongsRank",
		headerName: "# Songs Rank",
		width: 150,
		type: "number",
	},
]

const GenreGrid = () => {
	const classes = genreListStyles()
	const [rows, setRows] = useState([])

	const { loading, error } = useQuery(ALL_GENRES_QUERY, {
		onCompleted: (data) => {
			const temp = []
			for (const genre of data.getGenres) {
				const row = {
					id: genre.id,
					name: genre.name,
					numArtists: genre.genreRank?.numArtists,
					numArtistsRank: genre.genreRank?.numArtistsRank,
					numSongs: genre.genreRank?.numSongs,
					numSongsRank: genre.genreRank?.numSongsRank,
				}
				temp.push(row)
			}
			setRows(temp)
		},
	})

	if (loading) {
		return <LoadingScreen text="Loading genres tracked by VaultBot..." />
	}

	if (error) {
		return (
			<Alert severity="error">An error occurred during data retrieval :(</Alert>
		)
	}

	return (
		<div className={classes.totalGenreResults}>
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
								{ field: "numArtists", sort: "desc" },
								{ field: "numArtistsRank", sort: "asc" },
							],
						},
					}}
				/>
			</div>
		</div>
	)
}

export default GenreGrid
