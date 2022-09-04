import { makeStyles } from "@mui/styles"

const appStyles = makeStyles((theme) => ({
	app: {
		marginTop: "4.5rem",
		[theme.breakpoints.down("sm")]: {
			marginTop: "7rem",
		},
	},
}))

export default appStyles
