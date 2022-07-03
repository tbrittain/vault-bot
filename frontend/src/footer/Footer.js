import React from "react"
import Copyright from "./Copyright"
import { Link } from "react-router-dom"
import footerStyles from "./FooterStyles"
import { Breadcrumbs } from "@mui/material"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"

const Footer = () => {
	const classes = footerStyles()
	return (
		<div className={classes.footer}>
			<Breadcrumbs
				className={classes.footerActions}
				separator={<NavigateNextIcon fontSize="small" />}
			>
				<Link to="/about" className={classes.link}>
					About VaultBot
				</Link>
				<a
					href="https://github.com/tbrittain/vault-bot/issues/new"
					className={classes.link}
					target="_blank"
					rel="noopener noreferrer"
				>
					Report an issue
				</a>
				<Link to="/changelog" className={classes.link}>
					Changelog (v0.3.3)
				</Link>
			</Breadcrumbs>
			<Copyright />
		</div>
	)
}

export default Footer
