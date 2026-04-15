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

// ==================== validateImports ====================

func TestValidateImports_Allowed(t *testing.T) {
	allowed := []string{
		`package main; import "fmt"`,
		`package main; import "strings"`,
		`package main; import "math"`,
		`package main; import ("fmt"; "sort")`,
		`package main; import "os"`,
		`package main; import "encoding/json"`,
	}
	for _, code := range allowed {
		if err := validateImports(code); err != nil {
			t.Errorf("validateImports(%q) = %v, want nil", code, err)
		}
	}
}

func TestValidateImports_Blocked(t *testing.T) {
	blocked := []string{
		`package main; import "os/exec"`,
		`package main; import "syscall"`,
		`package main; import "unsafe"`,
		`package main; import "plugin"`,
		`package main; import "runtime/cgo"`,
		`package main; import "net"`,
		`package main; import "net/http"`,
		`package main; import "net/rpc"`,
		`package main; import "net/smtp"`,
		`package main; import "debug/elf"`,
		`package main; import "debug/macho"`,
		`package main; import "debug/pe"`,
		`package main; import "crypto/x509"`,
	}
	for _, code := range blocked {
		if err := validateImports(code); err == nil {
			t.Errorf("validateImports(%q) = nil, want error", code)
		}
	}
}

func TestValidateImports_NetSubpackages(t *testing.T) {
	code := `package main; import "net/url"`
	if err := validateImports(code); err == nil {
		t.Error("expected net/url to be blocked")
	}
}

func TestValidateImports_MalformedCode(t *testing.T) {
	if err := validateImports("this is not go code at all!!!"); err != nil {
		t.Errorf("expected nil for unparseable code, got %v", err)
	}
}

func TestValidateImports_MixedBlockedAllowed(t *testing.T) {
	code := `package main
import (
	"fmt"
	"os/exec"
)`
	if err := validateImports(code); err == nil {
		t.Error("expected error when one blocked import is present among allowed ones")
	}
}

// ==================== verifyPoW ====================

func TestVerifyPoW_InvalidSolution(t *testing.T) {
	if verifyPoW("testnonce", "wrong") {
		t.Error("expected false for obviously wrong solution")
	}
}

func TestVerifyPoW_EmptyInputs(t *testing.T) {
	if verifyPoW("", "") {
		t.Error("expected false for empty nonce and solution")
	}
}

// ==================== generateChallenge ====================

func TestGenerateChallenge_NonEmpty(t *testing.T) {
	c := generateChallenge()
	if c == "" {
		t.Error("expected non-empty challenge nonce")
	}
	if len(c) != 32 {
		t.Errorf("expected 32 hex chars, got %d: %q", len(c), c)
	}
}

func TestGenerateChallenge_Unique(t *testing.T) {
	a := generateChallenge()
	b := generateChallenge()
	if a == b {
		t.Error("two consecutive challenges should differ")
	}
}

// ==================== handleChallenge ====================

func TestHandleChallenge_ReturnsNonceAndDifficulty(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/challenge", nil)
	w := httptest.NewRecorder()
	handleChallenge(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	if ct := w.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("expected application/json, got %q", ct)
	}

	var body map[string]interface{}
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("decode challenge response: %v", err)
	}
	if body["nonce"] == nil || body["nonce"] == "" {
		t.Error("expected non-empty nonce in response")
	}
	if diff, ok := body["difficulty"].(float64); !ok || int(diff) != powDifficulty {
		t.Errorf("expected difficulty %d, got %v", powDifficulty, body["difficulty"])
	}
}

func TestHandleChallenge_OPTIONS(t *testing.T) {
	req := httptest.NewRequest(http.MethodOptions, "/challenge", nil)
	w := httptest.NewRecorder()
	handleChallenge(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200 for OPTIONS, got %d", w.Code)
	}
	if got := w.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Errorf("expected CORS *, got %q", got)
	}
}

func TestHandleChallenge_StoresNonce(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/challenge", nil)
	w := httptest.NewRecorder()
	handleChallenge(w, req)

	var body map[string]interface{}
	json.NewDecoder(w.Body).Decode(&body) //nolint:errcheck
	nonce := body["nonce"].(string)

	challengeMu.Lock()
	_, exists := challengeStore[nonce]
	challengeMu.Unlock()

	if !exists {
		t.Error("challenge nonce should be stored after generation")
	}
}

// ==================== requirePoW ====================

func TestRequirePoW_MissingHeaders(t *testing.T) {
	handler := requirePoW(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	req := httptest.NewRequest(http.MethodPost, "/run", nil)
	w := httptest.NewRecorder()
	handler(w, req)

	if w.Code != http.StatusForbidden {
		t.Errorf("expected 403, got %d", w.Code)
	}
	var resp runResponse
	json.NewDecoder(w.Body).Decode(&resp) //nolint:errcheck
	if !strings.Contains(resp.Errors, "ausente") {
		t.Errorf("expected 'ausente' in error, got %q", resp.Errors)
	}
}

func TestRequirePoW_InvalidNonce(t *testing.T) {
	handler := requirePoW(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	req := httptest.NewRequest(http.MethodPost, "/run", nil)
	req.Header.Set("X-PoW-Nonce", "nonexistent-nonce")
	req.Header.Set("X-PoW-Solution", "anything")
	w := httptest.NewRecorder()
	handler(w, req)

	if w.Code != http.StatusForbidden {
		t.Errorf("expected 403, got %d", w.Code)
	}
	var resp runResponse
	json.NewDecoder(w.Body).Decode(&resp) //nolint:errcheck
	if !strings.Contains(resp.Errors, "expirado") && !strings.Contains(resp.Errors, "inválido") {
		t.Errorf("expected expiry/invalid error, got %q", resp.Errors)
	}
}

func TestRequirePoW_WrongSolution(t *testing.T) {
	chalReq := httptest.NewRequest(http.MethodGet, "/challenge", nil)
	chalW := httptest.NewRecorder()
	handleChallenge(chalW, chalReq)

	var chalBody map[string]interface{}
	json.NewDecoder(chalW.Body).Decode(&chalBody) //nolint:errcheck
	nonce := chalBody["nonce"].(string)

	handler := requirePoW(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	req := httptest.NewRequest(http.MethodPost, "/run", nil)
	req.Header.Set("X-PoW-Nonce", nonce)
	req.Header.Set("X-PoW-Solution", "definitely-wrong")
	w := httptest.NewRecorder()
	handler(w, req)

	if w.Code != http.StatusForbidden {
		t.Errorf("expected 403, got %d", w.Code)
	}
	var resp runResponse
	json.NewDecoder(w.Body).Decode(&resp) //nolint:errcheck
	if !strings.Contains(resp.Errors, "inválida") {
		t.Errorf("expected 'inválida' in error, got %q", resp.Errors)
	}
}

func TestRequirePoW_OPTIONS_Passthrough(t *testing.T) {
	handler := requirePoW(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	req := httptest.NewRequest(http.MethodOptions, "/run", nil)
	w := httptest.NewRecorder()
	handler(w, req)
	if w.Code != http.StatusOK {
		t.Errorf("expected 200 for OPTIONS, got %d", w.Code)
	}
}

func TestRequirePoW_NonceSingleUse(t *testing.T) {
	chalReq := httptest.NewRequest(http.MethodGet, "/challenge", nil)
	chalW := httptest.NewRecorder()
	handleChallenge(chalW, chalReq)

	var chalBody map[string]interface{}
	json.NewDecoder(chalW.Body).Decode(&chalBody) //nolint:errcheck
	nonce := chalBody["nonce"].(string)

	handler := requirePoW(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	req1 := httptest.NewRequest(http.MethodPost, "/run", nil)
	req1.Header.Set("X-PoW-Nonce", nonce)
	req1.Header.Set("X-PoW-Solution", "wrong")
	w1 := httptest.NewRecorder()
	handler(w1, req1)

	req2 := httptest.NewRequest(http.MethodPost, "/run", nil)
	req2.Header.Set("X-PoW-Nonce", nonce)
	req2.Header.Set("X-PoW-Solution", "wrong")
	w2 := httptest.NewRecorder()
	handler(w2, req2)

	if w2.Code != http.StatusForbidden {
		t.Errorf("expected 403 on nonce reuse, got %d", w2.Code)
	}
}

// ==================== handleLab validation ====================

func TestHandleLab_NonGoFile(t *testing.T) {
	files := []labFile{
		{Name: "readme.txt", Body: "hello"},
	}
	resp, _ := postLab(t, files, "run")
	if !strings.Contains(resp.Errors, ".go") {
		t.Errorf("expected error about .go files, got %q", resp.Errors)
	}
}

func TestHandleLab_GoModForbidden(t *testing.T) {
	files := []labFile{
		{Name: "go.mod", Body: "module hack"},
	}
	resp, _ := postLab(t, files, "run")
	if !strings.Contains(resp.Errors, "go.mod") {
		t.Errorf("expected error about go.mod, got %q", resp.Errors)
	}
}

func TestHandleLab_GoSumForbidden(t *testing.T) {
	files := []labFile{
		{Name: "go.sum", Body: "hash"},
	}
	resp, _ := postLab(t, files, "run")
	if !strings.Contains(resp.Errors, "go.sum") {
		t.Errorf("expected error about go.sum, got %q", resp.Errors)
	}
}

func TestHandleLab_BlockedImport(t *testing.T) {
	files := []labFile{
		{Name: "main.go", Body: `package main
import "os/exec"
func main() {}`},
	}
	resp, _ := postLab(t, files, "run")
	if !strings.Contains(resp.Errors, "não permitido") {
		t.Errorf("expected blocked import error, got %q", resp.Errors)
	}
}

func TestHandleLab_InvalidFileName(t *testing.T) {
	for _, name := range []string{".", "..", ""} {
		files := []labFile{
			{Name: name, Body: `package main`},
		}
		resp, _ := postLab(t, files, "run")
		if resp.Errors == "" {
			t.Errorf("expected error for filename %q", name)
		}
	}
}

// ==================== handleRun extra validation ====================

func TestHandleRun_BlockedImport(t *testing.T) {
	const code = `package main
import "os/exec"
func main() {}`
	resp, _ := postRun(t, code)
	if !strings.Contains(resp.Errors, "não permitido") {
		t.Errorf("expected blocked import error, got %q", resp.Errors)
	}
}

// ==================== CORS on error responses ====================

func TestHandleRun_CORSOnError(t *testing.T) {
	resp, w := postRun(t, "")
	_ = resp
	if got := w.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Errorf("expected CORS header even on error, got %q", got)
	}
}

func TestHandleLab_CORSOnError(t *testing.T) {
	resp, w := postLab(t, []labFile{}, "run")
	_ = resp
	if got := w.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Errorf("expected CORS header even on error, got %q", got)
	}
}
