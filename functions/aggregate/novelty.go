package aggregate

import (
	"context"
	"github.com/jackc/pgx/v4"
)

func Novelty(conn *pgx.Conn) (float64, error) {
	var novelty float64
	err := conn.QueryRow(context.Background(), `
		WITH num_unique_songs AS (
			SELECT COUNT(*)
			FROM (SELECT d.song_id, COUNT(a.song_id) AS count
				  FROM dynamic d
						   INNER JOIN archive a ON d.song_id = a.song_id
				  GROUP BY d.song_id
				  HAVING COUNT(a.song_id) = 1) AS sic
		),
		num_songs AS (
			SELECT COUNT(*)
			FROM dynamic
		)
		SELECT num_unique_songs.count::numeric / num_songs.count::numeric AS ratio
		FROM num_unique_songs, num_songs;
	`).Scan(&novelty)
	return novelty, err
}
