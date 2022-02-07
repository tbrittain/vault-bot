package config

import (
	secretmanager "cloud.google.com/go/secretmanager/apiv1"
	"context"
	"encoding/json"
	"fmt"
	"github.com/joho/godotenv"
	secretmanagerpb "google.golang.org/genproto/googleapis/cloud/secretmanager/v1"
	"log"
	"os"
)

func LoadEnvVars() {
	// If environment set to production, use secret manager
	if os.Getenv("ENVIRONMENT") == "production" {
		projectId := os.Getenv("GOOGLE_CLOUD_PROJECT")

		// Create a client.
		ctx := context.Background()

		client, err := secretmanager.NewClient(ctx)
		if err != nil {
			log.Fatalf("failed to setup client: %v", err)
		}
		defer func(client *secretmanager.Client) {
			err := client.Close()
			if err != nil {
				log.Fatalf("failed to close client: %v", err)
			}
		}(client)

		keys := []string{"vb-postgres-db-host", "vb-postgres-db-name", "vb-postgres-db-port", "vb-postgres-user", "vb-postgres-db-pass"}
		for _, key := range keys {
			go func(key string) {
				req := &secretmanagerpb.AccessSecretVersionRequest{
					Name: fmt.Sprintf("projects/%s/secrets/%s/versions/latest", projectId, key),
				}

				result, err := client.AccessSecretVersion(ctx, req)
				if err != nil {
					log.Fatalf("failed to access secret version: %v", err)
				}

				var secret map[string]string
				if err := json.Unmarshal(result.Payload.Data, &secret); err != nil {
					log.Fatalf("failed to decode secret data: %v", err)
				}

				err = os.Setenv(key, secret[key])
				if err != nil {
					log.Fatalf("failed to set environment variable: %v", err)
				}
			}(key)
		}
	} else {
		// If not production, use environment variables
		// Working directory is not the functions directory
		err := godotenv.Load("vault-bot/functions/.env")
		if err != nil {
			log.Fatalf("failed to load environment variables from dotenv: %v", err)
		}
	}
}
