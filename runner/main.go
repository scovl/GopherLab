package main

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"go/parser"
	"go/token"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

const (
	runTimeout    = 10 * time.Second
	maxOutputSize = 64 * 1024
	maxCodeSize   = 64 * 1024
	maxConcurrent = 4
	errInternal   = "erro interno"
	goModFile     = "go.mod"
	goModContent  = "module sandbox\n\ngo 1.23\n"
)

var sem = make(chan struct{}, maxConcurrent)

// sandboxBaseDir is the parent for sandbox execution directories.
// Set SANDBOX_BASE to a non-temp path to avoid the Go 1.23+ restriction
// on go.mod files inside the system temp root (os.TempDir()).
var sandboxBaseDir = os.Getenv("SANDBOX_BASE")

// ── Proof-of-Work challenge system ──────────────────────────────────────

const (
	powDifficulty = 20 // leading zero bits required (~1M hashes)
	challengeTTL  = 60 * time.Second
	maxChallenges = 10000
)

type challenge struct {
	nonce     string
	createdAt time.Time
}

var (
	challengeStore = make(map[string]challenge)
	challengeMu    sync.Mutex
)

func generateChallenge() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		log.Printf("rand.Read: %v", err)
		return hex.EncodeToString([]byte(fmt.Sprintf("%d", time.Now().UnixNano())))
	}
	return hex.EncodeToString(b)
}

func handleChallenge(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	if r.Method == http.MethodOptions {
		return
	}

	nonce := generateChallenge()

	challengeMu.Lock()
	// Evict expired challenges
	now := time.Now()
	if len(challengeStore) > maxChallenges/2 {
		for k, v := range challengeStore {
			if now.Sub(v.createdAt) > challengeTTL {
				delete(challengeStore, k)
			}
		}
	}
	challengeStore[nonce] = challenge{nonce: nonce, createdAt: now}
	challengeMu.Unlock()

	json.NewEncoder(w).Encode(map[string]interface{}{
		"nonce":      nonce,
		"difficulty": powDifficulty,
	})
}

func verifyPoW(nonce, solution string) bool {
	hash := sha256.Sum256([]byte(nonce + solution))
	bits := powDifficulty
	for _, b := range hash {
		if bits >= 8 {
			if b != 0 {
				return false
			}
			bits -= 8
		} else if bits > 0 {
			mask := byte(0xFF) << (8 - bits)
			return (b & mask) == 0
		} else {
			break
		}
	}
	return bits <= 0
}

func requirePoW(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-PoW-Nonce, X-PoW-Solution")

		if r.Method == http.MethodOptions {
			return
		}

		nonce := r.Header.Get("X-PoW-Nonce")
		solution := r.Header.Get("X-PoW-Solution")

		if nonce == "" || solution == "" {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(runResponse{Errors: "prova de trabalho ausente"})
			return
		}

		challengeMu.Lock()
		ch, exists := challengeStore[nonce]
		if exists {
			delete(challengeStore, nonce) // single-use
		}
		challengeMu.Unlock()

		if !exists || time.Since(ch.createdAt) > challengeTTL {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(runResponse{Errors: "desafio expirado ou inválido"})
			return
		}

		if !verifyPoW(nonce, solution) {
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(runResponse{Errors: "prova de trabalho inválida"})
			return
		}

		next(w, r)
	}
}

// ── Import validation ──────────────────────────────────────────────────

var blockedImports = map[string]bool{
	"os/exec":     true,
	"syscall":     true,
	"unsafe":      true,
	"plugin":      true,
	"runtime/cgo": true,
	"net":         true,
	"net/http":    true,
	"net/rpc":     true,
	"net/smtp":    true,
	"debug/elf":   true,
	"debug/macho": true,
	"debug/pe":    true,
	"crypto/x509": true,
}

func validateImports(code string) error {
	fset := token.NewFileSet()
	f, err := parser.ParseFile(fset, "", code, parser.ImportsOnly)
	if err != nil {
		return nil // parse errors will be caught by the compiler
	}
	for _, imp := range f.Imports {
		path := strings.Trim(imp.Path.Value, `"`)
		if blockedImports[path] {
			return fmt.Errorf("import %q não permitido no sandbox", path)
		}
		if strings.HasPrefix(path, "net/") {
			return fmt.Errorf("import %q não permitido no sandbox", path)
		}
	}
	return nil
}

type runRequest struct {
	Body string `json:"body"`
}

// labFile represents a named file in a multi-file project.
type labFile struct {
	Name string `json:"name"`
	Body string `json:"body"`
}

// labRequest is used by /lab for multi-file projects with optional go test.
type labRequest struct {
	Files []labFile `json:"files"`
	Mode  string    `json:"mode"` // "run" or "test"
}

type runResponse struct {
	Output string `json:"output"`
	Errors string `json:"errors"`
}

func sandboxEnv() []string {
	tmp := os.TempDir()
	return []string{
		"HOME=" + tmp,
		"PATH=" + os.Getenv("PATH"),
		"GOROOT=" + os.Getenv("GOROOT"),
		"GOPATH=" + filepath.Join(tmp, "gopath"),
		"GOCACHE=" + filepath.Join(tmp, "gocache"),
		"GOTMPDIR=" + tmp,
		"GOPROXY=off",
		"GONOSUMDB=*",
		"GOFLAGS=",
	}
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

	if err := validateImports(req.Body); err != nil {
		json.NewEncoder(w).Encode(runResponse{Errors: err.Error()})
		return
	}

	dir, err := os.MkdirTemp(sandboxBaseDir, "gorun-*")
	if err != nil {
		log.Printf("MkdirTemp: %v", err)
		json.NewEncoder(w).Encode(runResponse{Errors: errInternal})
		return
	}
	defer os.RemoveAll(dir)

	// Write go.mod and user code
	if err := os.WriteFile(filepath.Join(dir, goModFile), []byte(goModContent), 0600); err != nil {
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
	cmd.Env = sandboxEnv()

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

// handleLab executes a multi-file Go project (go run or go test).
func handleLab(w http.ResponseWriter, r *http.Request) {
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

	select {
	case sem <- struct{}{}:
		defer func() { <-sem }()
	default:
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(runResponse{Errors: "muitas execuções simultâneas, tente novamente em instantes"})
		return
	}

	var req labRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxCodeSize*4)).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(runResponse{Errors: "requisição inválida: " + err.Error()})
		return
	}
	if len(req.Files) == 0 {
		json.NewEncoder(w).Encode(runResponse{Errors: "nenhum arquivo enviado"})
		return
	}

	dir, err := os.MkdirTemp(sandboxBaseDir, "golab-*")
	if err != nil {
		log.Printf("MkdirTemp: %v", err)
		json.NewEncoder(w).Encode(runResponse{Errors: errInternal})
		return
	}
	defer os.RemoveAll(dir)

	if err := os.WriteFile(filepath.Join(dir, goModFile), []byte(goModContent), 0600); err != nil {
		json.NewEncoder(w).Encode(runResponse{Errors: errInternal})
		return
	}

	for _, f := range req.Files {
		// Only allow simple filenames — no path traversal.
		name := filepath.Base(f.Name)
		if name == "." || name == ".." || name == "" {
			json.NewEncoder(w).Encode(runResponse{Errors: "nome de arquivo inválido: " + f.Name})
			return
		}
		if name == "go.mod" || name == "go.sum" {
			json.NewEncoder(w).Encode(runResponse{Errors: "não é permitido enviar go.mod ou go.sum"})
			return
		}
		if !strings.HasSuffix(name, ".go") {
			json.NewEncoder(w).Encode(runResponse{Errors: "apenas arquivos .go são aceitos"})
			return
		}
		if err := validateImports(f.Body); err != nil {
			json.NewEncoder(w).Encode(runResponse{Errors: err.Error()})
			return
		}
		if err := os.WriteFile(filepath.Join(dir, name), []byte(f.Body), 0600); err != nil {
			json.NewEncoder(w).Encode(runResponse{Errors: errInternal})
			return
		}
	}

	ctx, cancel := context.WithTimeout(r.Context(), runTimeout)
	defer cancel()

	var cmd *exec.Cmd
	if req.Mode == "test" {
		cmd = exec.CommandContext(ctx, "go", "test", "-v", "-count=1", ".")
	} else {
		cmd = exec.CommandContext(ctx, "go", "run", ".")
	}
	cmd.Dir = dir
	cmd.Env = sandboxEnv()

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	runErr := cmd.Run()

	resp := runResponse{}
	switch {
	case ctx.Err() == context.DeadlineExceeded:
		resp.Errors = "timeout: o programa excedeu " + runTimeout.String()
	case runErr != nil:
		// go test writes failures to stdout; include both
		out := stdout.String() + stderr.String()
		resp.Errors = out
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
	mux.HandleFunc("/run", requirePoW(handleRun))
	mux.HandleFunc("/lab", requirePoW(handleLab))
	mux.HandleFunc("/challenge", handleChallenge)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "ok")
	})

	log.Printf("runner ouvindo em :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

func warmCache() {
	dir, err := os.MkdirTemp(sandboxBaseDir, "gowarm-*")
	if err != nil {
		return
	}
	defer os.RemoveAll(dir)
	os.WriteFile(filepath.Join(dir, goModFile), []byte(goModContent), 0600)
	os.WriteFile(filepath.Join(dir, "main.go"), []byte(`package main
import "fmt"
func main() { fmt.Println("warm") }
`), 0600)
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	cmd := exec.CommandContext(ctx, "go", "run", ".")
	cmd.Dir = dir
	cmd.Env = sandboxEnv()
	cmd.Run()
	log.Println("cache aquecido")
}
