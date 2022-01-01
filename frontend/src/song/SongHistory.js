import React from "react";
import { gql, useQuery } from "@apollo/client";
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@material-ui/core";
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

  let formattedData;
  let processing = true;

  const { loading, error, data } = useQuery(QUERY, {
    variables: { getWhenTrackAddedByUsersId: songId },
  });

  if (data) {
    formattedData = data.getWhenTrackAddedByUsers;
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
      <List>
        {formattedData.map((historyEntry, index) => {
          const dateTime = new Date(historyEntry.addedAt);
          return (
            <ListItem key={index} divider>
              <ListItemText>
                <Typography variant="subtitle1" style={{ fontSize: "1.3rem" }}>
                  {index + 1}.{" "}
                  <Box display="inline" style={{ fontWeight: "bold" }}>
                    {historyEntry.addedBy}
                  </Box>{" "}
                  added this song on{" "}
                  <Box display="inline" style={{ fontWeight: "bold" }}>
                    {dateTime.toLocaleDateString()}
                  </Box>{" "}
                  at{" "}
                  <Box display="inline" style={{ fontWeight: "bold" }}>
                    {dateTime.toLocaleTimeString()}
                  </Box>
                </Typography>
              </ListItemText>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
};

export default SongHistory;
