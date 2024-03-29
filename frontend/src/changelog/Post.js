import React from "react"
import ReactMarkdown from "react-markdown"
import changeLogStyles from "./ChangelogStyles"
import { Typography } from "@mui/material"

const Post = (props) => {
	const classes = changeLogStyles()
	const { content, date } = props
	const formattedDate = new Date(date)

	return (
		<div className={classes.post}>
			<ReactMarkdown>{content}</ReactMarkdown>
			<Typography variant="subtitle1">
				<i>Updated on {formattedDate.toLocaleDateString()}</i>
			</Typography>
		</div>
	)
}

export default Post
