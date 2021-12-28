import React from "react";
import { gql, useQuery } from "@apollo/client";
import songStyles from "./SongStyles";
import { CircularProgress } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

const QUERY = gql`
  query getSimilarTracks($getSimilarTracksId: String!) {
    getSimilarTracks(id: $getSimilarTracksId) {
      song {
        id
        name
        artist {
          name
        }
      }
      score
    }
  }
`;

export default function SimilarSongs(props) {
  const { songId } = props;
  const { loading, error, data } = useQuery(QUERY, {
    variables: { getSimilarTracksId: songId },
  });

  const classes = songStyles();

  let formattedData;
  let processing = true;

  if (data) {
    formattedData = data.getSimilarTracks;
    processing = false;
    console.log(formattedData);
  }

  if (loading || processing) {
    return <CircularProgress />;
  }

  if (error) {
    <Alert severity="error">An error occurred during data retrieval :(</Alert>;
  }

  return (
    <div className={classes.root}>
      <h2>Similar Songs</h2>
      <div className={classes.songList}>
        {formattedData.map((song) => (
          <div key={song.song.id} className={classes.song}>
            <div className={classes.songName}>
              {song.song.name} by {song.song.artist.name}
            </div>
            <div className={classes.songScore}>{song.score.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
