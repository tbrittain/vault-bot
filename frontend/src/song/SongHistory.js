import React from "react";
import songStyles from "./SongStyles";
import { gql, useQuery } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

const QUERY = gql`
  query getWhenTrackAddedByUsers($getWhenTrackAddedByUsersId: String!) {
    getWhenTrackAddedByUsers(id: $getWhenTrackAddedByUsersId) {
      addedAt
      addedBy
    }
  }
`;

const SongHistory = (props) => {
  const { songId } = props;
  const classes = songStyles();

  let formattedData;
  let processing = true;

  const { loading, error, data } = useQuery(QUERY, {
    variables: { getWhenTrackAddedByUsersId: songId },
  });

  if (data) {
    console.log(data);
    processing = false;
  }

  if (loading || processing) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    <Alert severity="error">An error occurred during data retrieval :(</Alert>;
  }

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default SongHistory;
