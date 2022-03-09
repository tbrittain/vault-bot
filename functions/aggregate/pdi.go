package aggregate

import (
	"context"
	"github.com/jackc/pgx/v4"
)

func Pdi(conn *pgx.Conn) (float64, error) {
	var pdi float64
	err := conn.QueryRow(context.Background(),
		"select pdi($1)",
	).Scan(&pdi)
	return pdi, err
}
