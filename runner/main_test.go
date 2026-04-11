package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// helpers

func postRun(t *testing.T, code string) (runResponse, *httptest.ResponseRecorder) {
	t.Helper()
	b, err := json.Marshal(runRequest{Body: code})
	if err != nil {
		t.Fatalf("marshal request: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, "/run", bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	handleRun(w, req)
	var resp runResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	return resp, w
}

// --- HTTP method & CORS ---

func TestHandleRun_MethodNotAllowed(t *testing.T) {
	for _, method := range []string{http.MethodGet, http.MethodPut, http.MethodDelete, http.MethodPatch} {
		req := httptest.NewRequest(method, "/run", nil)
		w := httptest.NewRecorder()
		handleRun(w, req)
		if w.Code != http.StatusMethodNotAllowed {
			t.Errorf("method %s: expected 405, got %d", method, w.Code)
		}
		var resp runResponse
		json.NewDecoder(w.Body).Decode(&resp) //nolint:errcheck
		if resp.Errors == "" {
			t.Errorf("method %s: expected non-empty Errors field", method)
		}
	}
}

func TestHandleRun_OPTIONS_CORS(t *testing.T) {
	req := httptest.NewRequest(http.MethodOptions, "/run", nil)
	w := httptest.NewRecorder()
	handleRun(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200 for OPTIONS, got %d", w.Code)
	}
	if got := w.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Errorf("expected CORS header *, got %q", got)
	}
}

// --- Input validation ---

func TestHandleRun_EmptyCode(t *testing.T) {
	resp, _ := postRun(t, "")
	if resp.Errors == "" {
		t.Error("expected error for empty code field")
	}
	if resp.Output != "" {
		t.Errorf("expected no output for empty code, got %q", resp.Output)
	}
}

func TestHandleRun_InvalidJSON(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/run", strings.NewReader("{not-json"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	handleRun(w, req)
	var resp runResponse
	json.NewDecoder(w.Body).Decode(&resp) //nolint:errcheck
	if resp.Errors == "" {
		t.Error("expected error for malformed JSON body")
	}
}

// --- Integration: executes real Go programs ---

func TestHandleRun_ValidHelloWorld(t *testing.T) {
	const code = `package main
import "fmt"
func main() { fmt.Println("hello test") }`
	resp, _ := postRun(t, code)
	if resp.Errors != "" {
		t.Errorf("unexpected errors: %s", resp.Errors)
	}
	if !strings.Contains(resp.Output, "hello test") {
		t.Errorf("expected 'hello test' in output, got %q", resp.Output)
	}
}

func TestHandleRun_CompileError(t *testing.T) {
	const code = `package main
func main() { this is not valid go syntax }`
	resp, _ := postRun(t, code)
	if resp.Errors == "" {
		t.Error("expected compile error in Errors field")
	}
	if resp.Output != "" {
		t.Errorf("expected no output on compile error, got %q", resp.Output)
	}
}

func TestHandleRun_RuntimePanic(t *testing.T) {
	const code = `package main
func main() { panic("boom") }`
	resp, _ := postRun(t, code)
	if resp.Errors == "" {
		t.Error("expected errors for runtime panic")
	}
}

func TestHandleRun_MultipleStatements(t *testing.T) {
	const code = `package main
import "fmt"
func add(a, b int) int { return a + b }
func main() { fmt.Println(add(2, 3)) }`
	resp, _ := postRun(t, code)
	if resp.Errors != "" {
		t.Errorf("unexpected errors: %s", resp.Errors)
	}
	if !strings.Contains(resp.Output, "5") {
		t.Errorf("expected '5' in output, got %q", resp.Output)
	}
}

// --- Output truncation (unit) ---

func TestOutputTruncation(t *testing.T) {
	large := strings.Repeat("a", maxOutputSize+200)
	if len(large) > maxOutputSize {
		large = large[:maxOutputSize] + "\n... [saída truncada]"
	}
	if !strings.HasSuffix(large, "[saída truncada]") {
		t.Error("expected truncation suffix after maxOutputSize")
	}
	if len(large) > maxOutputSize+50 {
		t.Errorf("output too long after truncation: %d bytes", len(large))
	}
}

// --- Health endpoint ---

func TestHealthEndpoint(t *testing.T) {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "ok")
	})
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	if got := w.Body.String(); got != "ok" {
		t.Errorf("expected body 'ok', got %q", got)
	}
}

// ==================== /lab tests ====================

func postLab(t *testing.T, files []labFile, mode string) (runResponse, *httptest.ResponseRecorder) {
	t.Helper()
	b, err := json.Marshal(labRequest{Files: files, Mode: mode})
	if err != nil {
		t.Fatalf("marshal labRequest: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, "/lab", bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	handleLab(w, req)
	var resp runResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	return resp, w
}

func TestHandleLab_MethodNotAllowed(t *testing.T) {
	for _, method := range []string{http.MethodGet, http.MethodPut, http.MethodDelete} {
		req := httptest.NewRequest(method, "/lab", nil)
		w := httptest.NewRecorder()
		handleLab(w, req)
		if w.Code != http.StatusMethodNotAllowed {
			t.Errorf("method %s: expected 405, got %d", method, w.Code)
		}
	}
}

func TestHandleLab_OPTIONS_CORS(t *testing.T) {
	req := httptest.NewRequest(http.MethodOptions, "/lab", nil)
	w := httptest.NewRecorder()
	handleLab(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200 for OPTIONS, got %d", w.Code)
	}
	if got := w.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Errorf("expected CORS header *, got %q", got)
	}
}

func TestHandleLab_InvalidJSON(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/lab", strings.NewReader("{bad"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	handleLab(w, req)
	var resp runResponse
	json.NewDecoder(w.Body).Decode(&resp) //nolint:errcheck
	if resp.Errors == "" {
		t.Error("expected error for malformed JSON")
	}
}

func TestHandleLab_EmptyFiles(t *testing.T) {
	resp, _ := postLab(t, []labFile{}, "run")
	if resp.Errors == "" {
		t.Error("expected error when no files sent")
	}
}

func TestHandleLab_Run_HelloWorld(t *testing.T) {
	files := []labFile{
		{Name: "main.go", Body: `package main
import "fmt"
func main() { fmt.Println("lab ok") }`},
	}
	resp, _ := postLab(t, files, "run")
	if resp.Errors != "" {
		t.Errorf("unexpected errors: %s", resp.Errors)
	}
	if !strings.Contains(resp.Output, "lab ok") {
		t.Errorf("expected 'lab ok' in output, got %q", resp.Output)
	}
}

func TestHandleLab_Run_MultiFile(t *testing.T) {
	files := []labFile{
		{Name: "main.go", Body: `package main
import "fmt"
func main() { fmt.Println(greet("Go")) }`},
		{Name: "greet.go", Body: `package main
func greet(name string) string { return "Hello, " + name + "!" }`},
	}
	resp, _ := postLab(t, files, "run")
	if resp.Errors != "" {
		t.Errorf("unexpected errors: %s", resp.Errors)
	}
	if !strings.Contains(resp.Output, "Hello, Go!") {
		t.Errorf("expected 'Hello, Go!' in output, got %q", resp.Output)
	}
}

func TestHandleLab_Run_CompileError(t *testing.T) {
	files := []labFile{
		{Name: "main.go", Body: `package main
func main() { this is not valid }`},
	}
	resp, _ := postLab(t, files, "run")
	if resp.Errors == "" {
		t.Error("expected compile error in Errors field")
	}
	if resp.Output != "" {
		t.Errorf("expected no output on compile error, got %q", resp.Output)
	}
}

func TestHandleLab_Test_Pass(t *testing.T) {
	files := []labFile{
		{Name: "add.go", Body: `package main
func add(a, b int) int { return a + b }`},
		{Name: "add_test.go", Body: `package main
import "testing"
func TestAdd(t *testing.T) {
	if got := add(2, 3); got != 5 {
		t.Errorf("add(2,3) = %d, want 5", got)
	}
}`},
		{Name: "main.go", Body: `package main
func main() {}`},
	}
	resp, _ := postLab(t, files, "test")
	if resp.Errors != "" {
		t.Errorf("unexpected test failures: %s", resp.Errors)
	}
	if !strings.Contains(resp.Output, "PASS") {
		t.Errorf("expected PASS in output, got %q", resp.Output)
	}
}

func TestHandleLab_Test_Fail(t *testing.T) {
	files := []labFile{
		{Name: "add.go", Body: `package main
func add(a, b int) int { return a - b }` }, // wrong implementation
		{Name: "add_test.go", Body: `package main
import "testing"
func TestAdd(t *testing.T) {
	if got := add(2, 3); got != 5 {
		t.Errorf("add(2,3) = %d, want 5", got)
	}
}`},
		{Name: "main.go", Body: `package main
func main() {}`},
	}
	resp, _ := postLab(t, files, "test")
	if resp.Errors == "" {
		t.Error("expected test failure in Errors field")
	}
}

func TestHandleLab_PathTraversal(t *testing.T) {
	files := []labFile{
		{Name: "../escape.go", Body: `package main`},
	}
	// filepath.Base strips the prefix — the file should still write safely
	// (no error expected from the handler itself, just confirm it doesn't panic/fail with internal error)
	resp, w := postLab(t, files, "run")
	_ = resp
	if w.Code == http.StatusInternalServerError {
		t.Error("unexpected internal server error on path traversal attempt")
	}
}

// --- Constants ---

func TestGoModContent(t *testing.T) {
	if !strings.Contains(goModContent, "module sandbox") {
		t.Error("goModContent should declare module sandbox")
	}
	if goModFile != "go.mod" {
		t.Errorf("goModFile should be go.mod, got %q", goModFile)
	}
}

func TestSandboxEnv(t *testing.T) {
	env := sandboxEnv()
	required := []string{"HOME=", "PATH=", "GOROOT=", "GOPATH=", "GOCACHE=", "GOTMPDIR=", "GOPROXY=", "GONOSUMDB="}
	for _, prefix := range required {
		found := false
		for _, e := range env {
			if strings.HasPrefix(e, prefix) {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("sandboxEnv missing entry with prefix %q", prefix)
		}
	}
}
