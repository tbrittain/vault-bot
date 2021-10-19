import React from 'react'
import { useQuery, gql } from '@apollo/client'
import { Alert } from '@material-ui/lab'
import LoadingScreen from '../loading/LoadingScreen'
import Post from './Post'

const QUERY = gql`
  query {
    getChangeLogPosts {
      post
      date
    }
  }
`

function dateSort (a, b) {
  const dateA = new Date(a.date).getTime()
  const dateB = new Date(b.date).getTime()
  return dateA < dateB ? 1 : -1
}

const PostContainer = () => {
  const { loading, error, data } = useQuery(QUERY)

  let processing = true
  let formattedData
  if (data) {
    formattedData = data.getChangeLogPosts
    let dataToSort = [...formattedData]
    dataToSort = dataToSort.sort(dateSort)
    formattedData = dataToSort
    processing = false
  }

  if (loading || processing) {
    return (
      <LoadingScreen text='Loading changelog...' />
    )
  }

  if (error) {
    return (
      <Alert severity='error'>An error occurred during data retrieval :(</Alert>
    )
  }

  return (
    <>
      {formattedData.map(post => (
        <Post
          key={post.date}
          date={post.date}
          content={post.post}
        />
      ))}
    </>
  )
}

export default PostContainer