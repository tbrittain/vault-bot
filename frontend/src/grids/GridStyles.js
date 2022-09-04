import { makeStyles } from "@mui/styles"

const gridStyles = makeStyles((theme) => ({
	gridList: {},
	gridContainer: {
		padding: theme.spacing(2),
	},
	tile: {
		gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr)) !important",
		minWidth: "10vw",
		overflow: "hidden",
	},
	button: {
		minWidth: "10vw",
		height: "75px !important",
		wordBreak: "initial",
	},
	artistGrid: {
		display: "flex",
		flexFlow: "row wrap",
		justifyContent: "center",
	},
	artistCard: {},
	artistArt: {
		height: "12vw !important",
		width: "12vw !important",
		objectFit: "cover",
		minWidth: 100,
		minHeight: 100,
		transition: "transform .2s",
		"&:hover": {
			transform: "scale(1.75)",
			zIndex: 10,
			boxShadow: "0px 0px 2px #adadad",
		},
	},
}))

export default gridStyles
