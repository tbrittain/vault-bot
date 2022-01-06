import React from "react";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import AlbumSong from "./AlbumSong";
import songStyles from "./SongStyles";
import { Typography } from "@mui/material";

const QUERY = gql`
  query ($artistId: String!, $album: String!) {
    getTracksFromAlbum(artistId: $artistId, album: $album) {
      name
      id
      art
    }
  }
`;

const AlbumSongs = (props) => {
  const classes = songStyles();
  const { songId } = useParams();
  const { artistId, album } = props;
  const { data } = useQuery(QUERY, {
    variables: {
      artistId,
      album,
    },
  });

  let formattedData;
  if (data) {
    formattedData = data.getTracksFromAlbum;
    formattedData = formattedData.filter((song) => song.id !== songId);
  }
  return (
    <div>
      {formattedData && formattedData.length > 0 && (
        <div>
          <Typography
            variant="subtitle1"
            style={{
              textAlign: "center",
            }}
          >
            Other songs from this album tracked by VaultBot:
          </Typography>
          <div className={classes.albumGrid}>
            {formattedData.map((song) => (
              <AlbumSong
                key={song.id}
                songId={song.id}
                name={song.name}
                art={song.art}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumSongs;
