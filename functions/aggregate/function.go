package aggregate

import (
	"context"
	"fmt"
	"github.com/jackc/pgx/v4"
	"github.com/tbrittain/vault-bot/functions/config"
	"net/http"
	"os"
)

// https://cloud.google.com/functions/docs/concepts/go-runtime
// https://cloud.google.com/functions/docs/writing#functions-writing-file-structuring-go
// https://cloud.google.com/functions/docs/writing/background
// https://cloud.google.com/functions/docs/writing/http

func HelloHTTP(w http.ResponseWriter, r *http.Request) {
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
			LIMIT 1;`

	rows, err := conn.Query(context.Background(), sql)
	if err != nil {
		_, err := fmt.Fprintf(os.Stderr, "Error querying DB: %v\n", err)
		if err != nil {
			return
		}
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
}

type SongExampleResponse struct {
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
