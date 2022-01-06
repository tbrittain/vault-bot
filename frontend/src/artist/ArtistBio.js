import React from "react";
import artistStyles from "./ArtistStyles";
import { gql, useQuery } from "@apollo/client";
import {
  Alert,
  CircularProgress,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";

const QUERY = gql`
  query ($artistId: String!) {
    getArtist(id: $artistId) {
      wikiBio {
        bio
        url
      }
    }
  }
`;

const ArtistBio = (props) => {
  const classes = artistStyles();
  const { artistId } = props;
  const theme = useTheme();
  const { loading, error, data } = useQuery(QUERY, {
    variables: {
      artistId,
    },
  });

  let bio;
  let url;
  let processing = true;
  if (data) {
    if (data.getArtist.wikiBio) {
      bio = data.getArtist.wikiBio.bio;
      url = data.getArtist.wikiBio.url;
    }
    processing = false;
  }

  if (loading || processing) {
    return (
      <div
        style={{
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "3%",
        }}
      >
        <CircularProgress />
        <Typography variant="body1">
          Searching for artist biography...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error">An error occurred during data retrieval :(</Alert>
    );
  }

  return (
    <>
      <Typography variant="h1">Artist Bio</Typography>
      <Typography
        variant="subtitle2"
        style={{
          color: theme.palette.secondary.main,
        }}
      >
        <i>Experimental</i>
      </Typography>
      {!bio && (
        <Typography>
          <i>No bio available for this artist yet</i>
        </Typography>
      )}
      {bio && (
        <Paper
          elevation={3}
          className={classes.artistBio}
          style={{
            backgroundColor: theme.palette.primary.main,
          }}
        >
          <Typography
            variant="body1"
            style={{
              fontWeight: 300,
              color:
                theme.palette.mode === "light"
                  ? theme.palette.secondary.main
                  : theme.palette.primary.contrastText,
            }}
          >
            {bio}
          </Typography>
          <hr
            style={{
              border: `1px solid ${theme.palette.primary.dark}`,
            }}
          />
          <Typography
            variant="body1"
            style={{
              fontWeight: 300,
              textAlign: "center",
            }}
          >
            See more on{" "}
            <a
              href={url}
              className={classes.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Wikipedia
            </a>
          </Typography>
        </Paper>
      )}
    </>
  );
};

export default ArtistBio;
