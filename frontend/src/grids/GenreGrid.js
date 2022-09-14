import React from "react"
import { Link } from "react-router-dom"
import gridStyles from "./GridStyles"
import genreToMuiColor from "../utils/genreToMuiColor"
import {
	Button,
	ImageList,
	ImageListItem,
	lighten,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material"

const GenreGrid = (props) => {
	const classes = gridStyles()
	const theme = useTheme()
	const isSmallScreen = useMediaQuery("(max-width:800px)")

	return (
		<div className={classes.gridContainer}>
			{props?.genres && (
				<ImageList
					className={classes.gridList}
					cols={
						isSmallScreen
							? 2
							: props.genres.length < 4
							? props.genres.length
							: 4
					}
				>
					{props.genres.map((genre) => {
						return (
							<ImageListItem key={genre.id} className={classes.tile}>
								<Button
									variant="contained"
									size="large"
									className={classes.button}
									component={Link}
									to={`/genres/${genre.id}`}
									lang="en"
									sx={{
										backgroundColor: genreToMuiColor(genre.name),
										"&:hover": {
											backgroundColor: lighten(
												genreToMuiColor(genre.name),
												0.25
											),
										},
									}}
								>
									<Typography
										variant="body1"
										sx={{
											color: theme.palette.getContrastText(
												genreToMuiColor(genre.name)
											),
										}}
									>
										{genre.name}
									</Typography>
								</Button>
							</ImageListItem>
						)
					})}
				</ImageList>
			)}
			{(typeof props.genres === "undefined" || props.genres.length === 0) && (
				<Typography variant="subtitle1">
					No genres present for this artist :(
				</Typography>
			)}
		</div>
	)
}

export default GenreGrid
