import { makeStyles } from "@mui/styles"

const artistStyles = makeStyles((theme) => ({
	artistTop: {
		background: theme.palette.primary.light,
		boxShadow: `0px 0px 4px ${theme.palette.primary.main}`,
	},
	artistTopContent: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
	},
	artistName: {
		color:
			theme.palette.mode === "light"
				? theme.palette.secondary.main
				: theme.palette.primary.contrastText,
		textAlign: "center",
	},
	artistNumSongs: {
		color:
			theme.palette.mode === "light"
				? theme.palette.secondary.main
				: theme.palette.primary.contrastText,
	},
	artistSongName: {
		color:
			theme.palette.mode === "light"
				? theme.palette.secondary.main
				: theme.palette.primary.contrastText,
	},
	artistArt: {
		width: "12vw",
		height: "12vw",
		margin: "auto",
		boxShadow: "0px 0px 4px #adadad",
		minHeight: 125,
		minWidth: 125,
		[theme.breakpoints.down("sm")]: {
			minHeight: 175,
			minWidth: 175,
		},
	},
	album: {
		display: "grid",
		gridTemplate: "1fr / 1fr",
		placeItems: "center",
		background: "none",
		marginTop: 50,
		marginBottom: 50,
	},
	albumInner: {
		gridColumn: "1 / 1",
		gridRow: "1 / 1",
		height: "100%",
		width: "100%",
	},
	albumDetails: {
		display: "flex",
	},
	albumArtContainer: {
		paddingLeft: "5vw",
		textAlign: "center",
		display: "flex",
		flexDirection: "column",
		width: 300,
		[theme.breakpoints.down("sm")]: {
			paddingLeft: 0,
			width: 150,
		},
	},
	albumArt: {
		width: "12vw",
		height: "12vw",
		boxShadow: "0px 0px 4px #adadad",
		minHeight: 125,
		minWidth: 125,
		margin: "0 auto",
		[theme.breakpoints.down("sm")]: {
			minHeight: 75,
			minWidth: 75,
		},
	},
	albumSongGrid: {
		display: "flex",
		flexWrap: "wrap",
		justifyContent: "center",
		alignItems: "center",
		flexFlow: "wrap",
	},
	artistSongButton: {
		height: "fit-content",
		alignItems: "center",
		transition: "0.5s ease-in-out",
		background: theme.palette.primary.light,
		"&:hover": {
			background: theme.palette.primary.main,
		},
	},
	artistBio: {
		padding: "3% 15%",
		textIndent: "3ch",
		textAlign: "justify",
		maxHeight: "20vw",
		overflowY: "auto",
		[theme.breakpoints.down("sm")]: {
			maxHeight: "75vw",
			padding: "5%",
		},
	},
	link: {
		textDecoration: "none",
		color:
			theme.palette.mode === "light"
				? theme.palette.secondary.dark
				: theme.palette.secondary.contrastText,
		transition: "0.3s",
		"&:hover": {
			color: "white",
		},
	},
}))

export default artistStyles
