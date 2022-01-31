import React from "react";
import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import LoadingScreen from "../loading/LoadingScreen";
import genreListStyles from "./GenreListStyles";
import genreToMuiColor from "../utils/genreToMuiColor";
import { v4 as uuidv4 } from "uuid";
import { Alert, Paper, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const QUERY = gql`
  query {
    getGenres {
      genre
      numArtists
      rank
    }
  }
`;
// FIXME - DataGrid API has changed
const columns = [
  {
    field: "genreName",
    headerName: "Genre",
    width: 300,
    renderCell: (params) => (
      <Paper
        component={Link}
        to={`/genres/${params.value}`}
        style={{
          width: "97%",
          height: "97%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textDecoration: "none",
          background: genreToMuiColor(params.value),
        }}
      >
        <Paper>
          <Typography
            variant="body1"
            sx={{
              textTransform: "capitalize",
              margin: 5,
              fontWeight: "fontWeightLight",
            }}
          >
            {params.value}
          </Typography>
        </Paper>
      </Paper>
    ),
  },
  {
    field: "numArtists",
    headerName: "Artists",
    width: 150,
    type: "number",
  },
  {
    field: "rank",
    headerName: "Rank",
    width: 150,
    type: "number",
  },
];

const GenreList = () => {
  const classes = genreListStyles();
  const { loading, error, data } = useQuery(QUERY);
  let formattedData;
  const rows = [];
  let processing = true;

  if (data) {
    formattedData = data.getGenres;
    for (const genre of formattedData) {
      rows.push({
        id: uuidv4(),
        genreName: genre.genre,
        numArtists: genre.numArtists,
        rank: genre.rank,
      });
    }
    processing = false;
  }

  if (loading || processing) {
    return <LoadingScreen text="Loading genres tracked by VaultBot..." />;
  }

  if (error) {
    return (
      <Alert severity="error">An error occurred during data retrieval :(</Alert>
    );
  }

  return (
    <div className={classes.totalGenreResults}>
      <div
        style={{
          flexGrow: 1,
        }}
      >
        <DataGrid columns={columns} rows={rows} rowHeight={75} />
      </div>
    </div>
  );
};

export default GenreList;
