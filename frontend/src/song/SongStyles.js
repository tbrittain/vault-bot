import { makeStyles } from "@mui/styles"

const songStyles = makeStyles((theme) => ({
	albumArtRotate: {
		animation: "$rotate 4s",
		animationTimingFunction: "linear",
		animationIterationCount: "infinite",
	},
	albumArt: {
		height: "12vw !important",
		width: "12vw !important",
		margin: theme.spacing(4),
		boxShadow: "0px 0px 4px #adadad",
		minWidth: 175,
		minHeight: 175,
		[theme.breakpoints.down("sm")]: {
			margin: theme.spacing(2),
		},
	},
	outerContainer: {
		maxWidth: "100%",
		overflow: "auto",
	},
	innerContainer: {
		justifyContent: "center",
		alignItems: "center",
		display: "flex",
		overflow: "hidden",
		[theme.breakpoints.down("sm")]: {
			flexDirection: "column",
		},
	},
	songCharsContainer: {
		width: "100%",
		display: "grid",
		gridTemplateColumns: "1fr 1fr 1fr",
	},
	songChar: {
		[theme.breakpoints.down("sm")]: {
			fontSize: "3ch",
		},
	},
	artistContainer: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		flexWrap: "wrap",
		[theme.breakpoints.down("sm")]: {
			flexDirection: "column",
		},
	},
	containerItem: {
		margin: 0,
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center",
		display: "block",
		padding: "2vw",
	},
	songDescription: {
		width: "75%",
		textAlign: "center",
	},
	artistName: {
		textDecoration: "none",
		color: theme.palette.secondary.main,
		transition: "0.3s",
		lineHeight: 1,
		marginTop: "1rem",
		"&:hover": {
			color: theme.palette.primary.main,
		},
	},
	artistArt: {
		width: "10vw !important",
		height: "10vw !important",
		margin: "auto",
		boxShadow: "0px 0px 4px #adadad",
		minWidth: 150,
		minHeight: 150,
	},
	genreContainer: {
		width: "65%",
		[theme.breakpoints.down("sm")]: {
			width: "100%",
		},
	},
	navBar: {
		zIndex: 10,
	},
	albumGrid: {
		display: "flex",
		justifyContent: "center",
		flexFlow: "wrap",
	},
	albumSongCard: {
		margin: 5,
		display: "grid",
		gridTemplate: "1fr / 1fr",
		placeItems: "center",
		flex: "1 0 auto",
		maxWidth: "13vw",
		[theme.breakpoints.down("sm")]: {
			minWidth: 85,
		},
	},
	albumInner: {
		gridColumn: "1 / 1",
		gridRow: "1 / 1",
		height: "100%",
		width: "100%",
		textAlign: "center",
		justifyContent: "center",
		alignItems: "center",
		display: "flex",
	},
	albumText: {
		color: theme.palette.secondary.main,
		mixBlendMode: "color-burn",
		margin: 5,
		textDecoration: "none",
		transition: "0.3s",
		padding: 5,
		height: "fit-content",
		lineHeight: "inherit",
		"&:hover": {
			color: theme.palette.secondary.light,
		},
	},
	"@keyframes rotate": {
		from: {
			transform: "rotate(0deg)",
		},
		to: {
			transform: "rotate(359deg)",
		},
	},
	songComparison: {
		width: "10vw",
		margin: "auto auto",
		textAlign: "center",
		[theme.breakpoints.down("sm")]: {
			display: "none",
		},
	},
	songComparisonSmall: {
		display: "none",
		[theme.breakpoints.down("sm")]: {
			visibility: "visible",
			textAlign: "center",
			display: "flex",
			justifyContent: "center",
		},
	},
	similarSong: {
		display: "grid",
		gridTemplate: "1fr / 1fr",
		placeItems: "center",
		background: "none",
		width: "100%",
		margin: "1rem",
	},
	similarSongInner: {
		gridColumn: "1 / 1",
		gridRow: "1 / 1",
		height: "100%",
		width: "100%",
	},
	similarSongDetails: {
		display: "flex",
		alignItems: "center",
		justifyContent: "left",
		width: "100%",
	},
	similarSongArt: {
		marginLeft: "1rem",
		marginRight: "1rem",
		boxShadow: "0px 0px 4px #adadad",
		minWidth: 75,
		minHeight: 75,
	},
	similarSongSongText: {
		[theme.breakpoints.down("sm")]: {
			fontSize: "1.5rem",
		},
	},
	similarSongScore: {
		width: "5vw",
		height: "5vw",
		margin: "auto",
		boxShadow: "0px 0px 4px #adadad",
		minWidth: 75,
		minHeight: 75,
		[theme.breakpoints.down("sm")]: {
			minWidth: 60,
			minHeight: 60,
		},
	},
	similarSongScoreText: {
		fontSize: "1.5rem",
		fontWeight: theme.typography.fontWeightRegular,
		[theme.breakpoints.down("sm")]: {
			fontSize: "1.15rem",
		},
	},
}))
export default songStyles
