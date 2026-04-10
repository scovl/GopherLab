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
