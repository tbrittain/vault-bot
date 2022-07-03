import { makeStyles } from "@mui/styles"
import { alpha } from "@mui/material"

const genreListStyles = makeStyles((theme) => ({
	search: {
		position: "relative",
		borderRadius: theme.shape.borderRadius,
		backgroundColor: alpha(theme.palette.common.white, 0.15),
		"&:hover": {
			backgroundColor: alpha(theme.palette.common.white, 0.25),
		},
		marginLeft: 0,
		width: "100%",
		[theme.breakpoints.up("sm")]: {
			marginLeft: theme.spacing(1),
			width: "auto",
		},
	},
	searchIcon: {
		padding: theme.spacing(0, 2),
		height: "100%",
		position: "absolute",
		pointerEvents: "none",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	inputRoot: {
		color: "inherit",
		fontWeight: theme.typography.fontWeightLight,
	},
	inputInput: {
		padding: theme.spacing(1, 1, 1, 0),
		paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
		transition: theme.transitions.create("width"),
		width: "100%",
		[theme.breakpoints.up("sm")]: {
			width: "20ch",
			"&:focus": {
				width: "30ch",
			},
		},
	},
	queryResultContainer: {
		width: "35ch",
		maxHeight: "35ch",
		overflowY: "auto",
		background: "none",
	},
	genreResultItem: {
		display: "flex",
		transition: "0.1s",
		"&:hover": {
			outline: `2px solid ${theme.palette.primary.main}`,
		},
	},
	totalGenreResults: {
		display: "flex",
		width: "100%",
		height: "calc(50vh + 100px)",
	},
}))

export default genreListStyles
