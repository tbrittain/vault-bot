import React from "react";
import { gql, useQuery } from "@apollo/client";
import songStyles from "./SongStyles";
import {
  Avatar,
  Box,
  CircularProgress,
  Typography,
  useTheme,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Link } from "react-router-dom";

const QUERY = gql`
  query getSimilarTracks($getSimilarTracksId: String!) {
    getSimilarTracks(id: $getSimilarTracksId) {
      song {
        id
        name
        art
        album
        artistId
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
  const theme = useTheme();

  let formattedData;
  let processing = true;

  if (data) {
    formattedData = data.getSimilarTracks;
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

  if (formattedData.length === 0) {
    return (
      <Box className={classes.noSongs}>
        <Typography variant="h6">No similar songs found :(</Typography>
      </Box>
    );
  }

  return (
    <div
      className={classes.innerContainer}
      style={{ flexDirection: "column", width: "100%" }}
    >
      {formattedData.map((song) => (
        <div key={song.song.id} className={classes.similarSong}>
          <div
            className={classes.similarSongInner}
            style={{
              zIndex: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Link
              to={`/songs/${song.song.id}`}
              style={{
                textDecoration: "none",
                width: "100%",
              }}
            >
              <div className={classes.similarSongDetails}>
                <Avatar
                  src={song.song.art}
                  alt={song.song.name}
                  className={classes.similarSongArt}
                />
                <div style={{ width: "80%" }}>
                  <Typography
                    variant="h6"
                    className={`${classes.albumText} ${classes.similarSongSongText}`}
                    style={{
                      textDecoration: "none",
                      lineHeight: "1.15",
                      [theme.breakpoints.down("sm")]: {
                        fontSize: "1.5rem",
                      },
                    }}
                  >
                    {song.song.name}
                  </Typography>
                  <Typography
                    variant="h6"
                    className={`${classes.albumText} ${classes.similarSongArtistText}`}
                  >
                    by {song.song.artist.name}
                  </Typography>
                </div>
              </div>
            </Link>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: "1rem",
              }}
            >
              <Avatar
                className={classes.similarSongScore}
                style={{
                  color:
                    song.score > 65
                      ? theme.palette.getContrastText(
                          `hsl(${song.score * 5.4}, 100%, 50%)`
                        )
                      : theme.palette.getContrastText("hsl(351, 100%, 50%)"),
                  backgroundColor:
                    song.score > 65
                      ? `hsl(${song.score * 5.4}, 100%, 50%)`
                      : "hsl(351, 100%, 50%)",
                }}
              >
                <Typography
                  variant="subtitle1"
                  className={classes.similarSongScoreText}
                >
                  {song.score.toFixed(1)}%
                </Typography>
              </Avatar>
            </div>
          </div>
          <div
            className={classes.similarSongInner}
            style={{
              backgroundImage: `url(${song.song.art})`,
              backgroundPosition: "center center",
              backgroundSize: "100vw 100vw",
              filter: "blur(20px)",
              WebkitFilter: "blur(20px)",
              overflow: "hidden",
              zIndex: 1,
              opacity: 0.5,
            }}
          />
        </div>
      ))}
    </div>
  );
}
