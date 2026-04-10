package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"
)

const (
	runTimeout    = 10 * time.Second
	maxOutputSize = 64 * 1024
	maxCodeSize   = 64 * 1024
	maxConcurrent = 4
	errInternal   = "erro interno"
)

var sem = make(chan struct{}, maxConcurrent)

type runRequest struct {
	Body string `json:"body"`
}

type runResponse struct {
	Output string `json:"output"`
	Errors string `json:"errors"`
}

func handleRun(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if r.Method == http.MethodOptions {
		return
	}
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(runResponse{Errors: "method not allowed"})
		return
	}

	// Acquire concurrency slot
	select {
	case sem <- struct{}{}:
		defer func() { <-sem }()
	default:
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(runResponse{Errors: "muitas execuções simultâneas, tente novamente em instantes"})
		return
	}

	var req runRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxCodeSize)).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(runResponse{Errors: "requisição inválida: " + err.Error()})
		return
	}
	if req.Body == "" {
		json.NewEncoder(w).Encode(runResponse{Errors: "código vazio"})
		return
	}

	dir, err := os.MkdirTemp("", "gorun-*")
	if err != nil {
		log.Printf("MkdirTemp: %v", err)
		json.NewEncoder(w).Encode(runResponse{Errors: errInternal})
		return
	}
	defer os.RemoveAll(dir)

	// Write go.mod and user code
	gomod := "module sandbox\n\ngo 1.22\n"
	if err := os.WriteFile(filepath.Join(dir, "go.mod"), []byte(gomod), 0600); err != nil {
		json.NewEncoder(w).Encode(runResponse{Errors: errInternal})
		return
	}
	if err := os.WriteFile(filepath.Join(dir, "main.go"), []byte(req.Body), 0600); err != nil {
		json.NewEncoder(w).Encode(runResponse{Errors: errInternal})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), runTimeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "go", "run", ".")
	cmd.Dir = dir
	cmd.Env = []string{
		"HOME=/tmp",
		"PATH=" + os.Getenv("PATH"),
		"GOROOT=" + os.Getenv("GOROOT"),
		"GOPATH=/tmp/gopath",
		"GOCACHE=/tmp/gocache",
		"GOTMPDIR=/tmp",
		"GOPROXY=off",
		"GONOSUMDB=*",
		"GOFLAGS=",
	}

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	runErr := cmd.Run()

	resp := runResponse{}
	switch {
	case ctx.Err() == context.DeadlineExceeded:
		resp.Errors = "timeout: o programa excedeu " + runTimeout.String()
	case runErr != nil:
		resp.Errors = stderr.String()
		if resp.Errors == "" {
			resp.Errors = runErr.Error()
		}
	default:
		resp.Output = stdout.String()
	}

	if len(resp.Output) > maxOutputSize {
		resp.Output = resp.Output[:maxOutputSize] + "\n... [saída truncada]"
	}
	if len(resp.Errors) > maxOutputSize {
		resp.Errors = resp.Errors[:maxOutputSize]
	}

	json.NewEncoder(w).Encode(resp)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	// Pre-warm Go build cache so first run is fast
	go warmCache()

	mux := http.NewServeMux()
	mux.HandleFunc("/run", handleRun)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "ok")
	})

	log.Printf("runner ouvindo em :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

func warmCache() {
	dir, err := os.MkdirTemp("", "gowarm-*")
	if err != nil {
		return
	}
	defer os.RemoveAll(dir)
	os.WriteFile(filepath.Join(dir, "go.mod"), []byte("module sandbox\n\ngo 1.22\n"), 0600)
	os.WriteFile(filepath.Join(dir, "main.go"), []byte(`package main
import "fmt"
func main() { fmt.Println("warm") }
`), 0600)
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	cmd := exec.CommandContext(ctx, "go", "run", ".")
	cmd.Dir = dir
	cmd.Env = []string{
		"HOME=/tmp",
		"PATH=" + os.Getenv("PATH"),
		"GOROOT=" + os.Getenv("GOROOT"),
		"GOPATH=/tmp/gopath",
		"GOCACHE=/tmp/gocache",
		"GOTMPDIR=/tmp",
		"GOPROXY=off",
		"GONOSUMDB=*",
	}
	cmd.Run()
	log.Println("cache aquecido")
}
