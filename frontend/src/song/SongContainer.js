import React from "react";
import { useParams } from "react-router-dom";
import { gql, useQuery } from "@apollo/client";
import { Grid, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import SongDetails from "./SongDetails";
import SongArtist from "./SongArtist";
import LoadingScreen from "../loading/LoadingScreen";

// TODO: create fragments for these long queries and present
// each fragment in their required component
// https://www.apollographql.com/docs/react/data/fragments/#colocating-fragments

const QUERY = gql`
  query ($songId: String!) {
    getTrack(id: $songId) {
      name
      id
      album
      art
      previewUrl
      artist {
        id
        name
        art
        genres {
          genre
        }
      }
      details {
        length
        tempo
        danceability
        energy
        loudness
        acousticness
        instrumentalness
        liveness
        valence
      }
    }
  }
`;

const SongContainer = () => {
  const { songId } = useParams();
  const { loading, error, data } = useQuery(QUERY, {
    variables: {
      songId,
    },
  });

  let formattedData;
  let artistGenres;
  let processing = true;
  if (data) {
    formattedData = data;
    formattedData = data.getTrack;
    if (formattedData.artist.genres.length > 0) {
      artistGenres = formattedData.artist.genres;
      artistGenres = artistGenres.map((genreObject) => genreObject.genre);
    }
    processing = false;
  }

  if (loading || processing) {
    return <LoadingScreen text="Loading song..." />;
  }

  if (error) {
    return (
      <Alert severity="error">An error occurred during data retrieval :(</Alert>
    );
  }

  return (
    <>
      <Grid container direction="column" justify="space-evenly">
        <Typography variant="h1">Song Details</Typography>
        <SongDetails
          album={formattedData.album}
          name={formattedData.name}
          artistName={formattedData.artist.name}
          artistId={formattedData.artist.id}
          art={formattedData.art}
          songPreview={formattedData.previewUrl}
          details={formattedData.details}
          id={songId}
        />
        <Typography variant="h2">Artist Preview</Typography>
        <SongArtist
          id={formattedData.artist.id}
          name={formattedData.artist.name}
          art={formattedData.artist.art}
          genres={artistGenres}
        />
      </Grid>
    </>
  );
};

export default SongContainer;
