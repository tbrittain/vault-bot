package aggregate

import (
	"encoding/json"
	"fmt"
	"github.com/jackc/pgx/v4"
	"html"
	"net/http"
)

// https://cloud.google.com/functions/docs/concepts/go-runtime
// https://cloud.google.com/functions/docs/writing#functions-writing-file-structuring-go
// https://cloud.google.com/functions/docs/writing/background
// https://cloud.google.com/functions/docs/writing/http

// HelloHTTP is an HTTP Cloud Function with a request parameter.
func HelloHTTP(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.Method)
	fmt.Println(r.URL)

	var d struct {
		Name string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
		_, err := fmt.Fprint(w, "Hello, World!")
		if err != nil {
			return
		}
		return
	}
	if d.Name == "" {
		_, err := fmt.Fprint(w, "Hello, World!")
		if err != nil {
			return
		}
		return
	}
	_, err := fmt.Fprintf(w, "Hello, %s!", html.EscapeString(d.Name))
	if err != nil {
		return
	}
}
