import React from "react"
import footerStyles from "./FooterStyles"
import { Typography } from "@mui/material"

function Copyright() {
	const classes = footerStyles()
	return (
		<Typography variant="body2" color="textSecondary" align="center">
			{"Copyright © "}
			<a
				href="https://tbrittain.com/"
				target="_blank"
				rel="noopener noreferrer"
				className={classes.copyrightLink}
			>
				Trey Brittain
			</a>{" "}
			{new Date().getFullYear()}.
		</Typography>
	)
}

export default Copyright
