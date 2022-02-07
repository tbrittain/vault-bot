package aggregate

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4"
	"github.com/tbrittain/vault-bot/functions/config"
	"net/http"
	"os"
)

func HelloHTTP(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.Header)
	fmt.Println(r.UserAgent())

	config.LoadEnvVars()

	conn, err := dbConnect()
	if err != nil {
		_, err := fmt.Fprintf(os.Stderr, "Error connecting to DB: %v\n", err)
		if err != nil {
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	defer func(conn *pgx.Conn, ctx context.Context) {
		err := conn.Close(ctx)
		if err != nil {
			_, err := fmt.Fprintf(os.Stderr, "Error closing DB connection: %v\n", err)
			if err != nil {
				return
			}
		}
	}(conn, context.Background())

	sql := `SELECT s.id AS song_id,
			s.name  AS name,
			s.album AS album,
			a.id AS artist_id,
			a.name  AS artist_name
			FROM songs s
			JOIN artists a ON s.artist_id = a.id
			WHERE RANDOM() < 0.01
			LIMIT 5;`

	var songs []*SongExample
	err = pgxscan.Select(context.Background(), conn, &songs, sql)
	if err != nil {
		_, err := fmt.Fprintf(os.Stderr, "Error retrieving database rows: %v\n", err)
		if err != nil {
			return
		}
	}
	w.Header().Set("Content-Type", "application/json")

	jsonResponse, err := json.Marshal(songs)
	if err != nil {
		_, err := fmt.Fprintf(os.Stderr, "Error marshalling response: %v\n", err)
		if err != nil {
			return
		}
	}

	_, err = w.Write(jsonResponse)
	if err != nil {
		_, err := fmt.Fprintf(os.Stderr, "Error writing response: %v\n", err)
		if err != nil {
			return
		}
	}
}

type SongExample struct {
	SongId     string `json:"song_id"`
	Name       string `json:"name"`
	Album      string `json:"album"`
	ArtistId   string `json:"artist_id"`
	ArtistName string `json:"artist_name"`
}

func dbConnect() (*pgx.Conn, error) {
	connectionString := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s",
		os.Getenv("vb-postgres-user"),
		os.Getenv("vb-postgres-db-pass"),
		os.Getenv("vb-postgres-db-host"),
		os.Getenv("vb-postgres-db-port"),
		os.Getenv("vb-postgres-db-name"),
	)
	conn, err := pgx.Connect(context.Background(), connectionString)
	if err != nil {
		return nil, err
	}
	return conn, nil
}
