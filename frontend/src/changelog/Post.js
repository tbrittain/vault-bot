import React from 'react'
import {
  Paper,
  Typography
} from '@material-ui/core'
import ReactMarkdown from 'react-markdown'
import changeLogStyles from './ChangelogStyles'

const Post = (props) => {
  const classes = changeLogStyles()
  const { content, date } = props
  const formattedDate = new Date(date)

  return (
    <Paper
      className={classes.post}
      elevation={1}
      square={false}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
      <Typography
        variant='subtitle1'
      >
        <i>Updated on {formattedDate.toLocaleString()}</i>
      </Typography>
    </Paper>
  )
}

export default Post
