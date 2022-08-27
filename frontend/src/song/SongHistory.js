import React from "react"
import { useQuery } from "@apollo/client"
import {
	Alert,
	Box,
	CircularProgress,
	List,
	ListItem,
	ListItemText,
	Typography,
} from "@mui/material"
import { SONG_ADDED_HISTORY_QUERY } from "../queries/songQueries"

const SongHistory = (props) => {
	const { songId } = props

	const [history, setHistory] = React.useState([])
	const { loading, error } = useQuery(SONG_ADDED_HISTORY_QUERY, {
		variables: { getWhenTrackAddedByUsersId: songId },
		onCompleted: (data) => {
			setHistory(data?.getWhenTrackAddedByUsers)
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
		<div>
			<List>
				{history.map((historyEntry, index, array) => {
					const dateTime = new Date(historyEntry.addedAt)
					const finalItem = index === array.length - 1
					return (
						<ListItem key={index} divider={!finalItem}>
							<ListItemText>
								<Typography
									variant="subtitle1"
									sx={{ fontSize: "1.3rem", fontWeight: "fontWeightLight" }}
								>
									{index + 1}.{" "}
									<Box
										display="inline"
										sx={{ fontWeight: "fontWeightRegular" }}
									>
										{historyEntry.addedBy}
									</Box>{" "}
									added this song on{" "}
									<Box
										display="inline"
										sx={{ fontWeight: "fontWeightRegular" }}
									>
										{dateTime.toLocaleDateString()}
									</Box>{" "}
									at{" "}
									<Box
										display="inline"
										sx={{ fontWeight: "fontWeightRegular" }}
									>
										{dateTime.toLocaleTimeString()}
									</Box>
								</Typography>
							</ListItemText>
						</ListItem>
					)
				})}
			</List>
		</div>
	)
}

export default SongHistory
