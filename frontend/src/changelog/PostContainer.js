import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import LoadingScreen from "../loading/LoadingScreen";
import Post from "./Post";
import { Alert } from "@mui/material";
import { CHANGE_LOG_POSTS_QUERY } from "../queries/miscQueries";

const PostContainer = () => {
  const [posts, setPosts] = useState([]);
  const { loading, error } = useQuery(CHANGE_LOG_POSTS_QUERY, {
    onCompleted: (data) => {
      const unpacked = [...data.getChangeLogPosts];
      setPosts(unpacked.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA < dateB ? 1 : -1;
      }));
    }
  });

  if (loading) {
    return <LoadingScreen text="Loading changelog..." />;
  }

  if (error) {
    return (
      <Alert severity="error">An error occurred during data retrieval :(</Alert>
    );
  }

  return (
    <>
      {posts.map((post, index, array) => (
        <>
          <Post key={post.date} date={post.date} content={post.post} />
          {array.length - 1 === index ? null : <hr />}
        </>
      ))}
    </>
  );
};

export default PostContainer;
