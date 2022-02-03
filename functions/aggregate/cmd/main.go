package main

import (
	"context"
	"github.com/GoogleCloudPlatform/functions-framework-go/funcframework"
	"github.com/tbrittain/vault-bot/functions/aggregate"
	"log"
	"os"
)

func main() {
	ctx := context.Background()
	if err := funcframework.RegisterHTTPFunctionContext(ctx, "/", aggregate.HelloHTTP); err != nil {
		log.Fatalf("funcframework.RegisterHTTPFunctionContext: %v\n", err)
	}
	// Use PORT environment variable, or default to 8080.
	port := "8080"
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}
	if err := funcframework.Start(port); err != nil {
		log.Fatalf("funcframework.Start: %v\n", err)
	}
}
