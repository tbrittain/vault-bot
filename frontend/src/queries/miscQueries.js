import { gql } from "@apollo/client"

export const CHANGE_LOG_POSTS_QUERY = gql`
	query changeLogPostsQuery {
		getChangeLogPosts {
			post
			date
		}
	}
`
