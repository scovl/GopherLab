---
title: Testes Unitários e Table-driven
description: testing.T, table-driven tests, subtests, cobertura e httptest.
estimatedMinutes: 45
recursos:
  - https://go.dev/doc/tutorial/add-a-test
  - https://gobyexample.com/testing
  - https://pkg.go.dev/net/http/httptest
experimentacao:
  desafio: Escreva testes table-driven com t.Run para uma função de validação de email. Depois, teste um HTTP handler usando httptest.NewRequest e httptest.NewRecorder.
  dicas:
    - t.Run("nome", func(t *testing.T) {...}) para subtests
    - go test -v para ver cada subtest
    - go test -cover para cobertura
    - httptest.NewRecorder() captura status e body
  codeTemplate: |
    package email

    import (
    	"net/http"
    	"net/http/httptest"
    	"regexp"
    	"strings"
    	"testing"
    )

    var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

    func ValidarEmail(e string) bool {
    	return emailRegex.MatchString(strings.TrimSpace(e))
    }

    func TestValidarEmail(t *testing.T) {
    	cases := []struct {
    		nome     string
    		email    string
    		expected bool
    	}{
    		{"válido simples", "user@go.dev", true},
    		{"válido com pontos", "a.b@example.com", true},
    		{"sem @", "usergo.dev", false},
    		{"sem domínio", "user@", false},
    		{"vazio", "", false},
    		{"espaços", "  user@go.dev  ", true},
    		{"duplo @", "user@@go.dev", false},
    	}

    	for _, tc := range cases {
    		t.Run(tc.nome, func(t *testing.T) {
    			got := ValidarEmail(tc.email)
    			if got != tc.expected {
    				t.Errorf("ValidarEmail(%q) = %v; want %v", tc.email, got, tc.expected)
    			}
    		})
    	}
    }

    // HTTP handler testing
    func helloHandler(w http.ResponseWriter, r *http.Request) {
    	w.Header().Set("Content-Type", "application/json")
    	w.Write([]byte(`{"msg":"olá"}`))
    }

    func TestHelloHandler(t *testing.T) {
    	req := httptest.NewRequest("GET", "/hello", nil)
    	rec := httptest.NewRecorder()

    	helloHandler(rec, req)

    	if rec.Code != http.StatusOK {
    		t.Errorf("status = %d; want 200", rec.Code)
    	}
    	if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
    		t.Errorf("Content-Type = %q; want application/json", ct)
    	}
    	if !strings.Contains(rec.Body.String(), "olá") {
    		t.Error("body não contém 'olá'")
    	}
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **Table-driven tests** — slice de struct com `nome`, `input`, `expected`. Cada caso vira um subtest via `t.Run(tc.nome, ...)`. Vantagem: adicionar um caso é adicionar uma linha. `go test -run TestValidarEmail/vazio` roda só esse subtest.

    **`t.Run` e subtests** — cada subtest é independente: pode ter seu próprio `t.Error`, `t.Fatal`, e `t.Parallel()`. `t.Run` retorna `bool` indicando se passou. Subtests aparecem hierarquicamente na saída com `-v`.

    **`t.Errorf` vs `t.Fatalf`** — `Errorf` marca falha mas **continua** os próximos subtests; `Fatalf` **para** imediatamente. Use `Fatal` apenas quando continuar não faz sentido (ex: setup falhou, conexão impossível).

    **`t.Helper()`** — em funções auxiliares (ex: `assertStatus(t, got, want)`), chame `t.Helper()` na primeira linha. Isso faz o reporter apontar para a **linha que chamou** o helper, não para dentro do helper. Sem `t.Helper()`, a mensagem de erro aponta para a linha errada.

    **`httptest.NewRecorder()`** — captura a response **sem abrir porta real**. `rec.Code` é o status HTTP, `rec.Body` é o body, `rec.Header()` os headers. Para testes de integração (com middleware, routing), use `httptest.NewServer(handler)` que abre porta real em localhost.

    **Cobertura** — `go test -cover` mostra porcentagem; `go test -coverprofile=c.out && go tool cover -html=c.out` abre visão interativa no browser. **80% com casos bem escolhidos vale mais que 100% com asserts triviais.**
socializacao:
  discussao: "Table-driven tests: por que são o padrão em Go? Quanto de cobertura é suficiente?"
  pontos:
    - "Fáceis de estender — adicionar caso é adicionar linha"
    - Subtests com t.Run permitem rodar caso isolado
    - "80% cobertura é bom; 100% nem sempre vale o esforço"
  diasDesafio: Dias 45–52
  sugestaoBlog: "Table-driven tests em Go: o padrão que todo dev Go precisa conhecer"
  hashtagsExtras: '#golang #testing #tdd'
aplicacao:
  projeto: Suite de testes completa para um pacote de utilitários com table-driven + httptest.
  requisitos:
    - Table-driven tests com t.Run
    - Cobertura > 80% (go test -cover)
    - Testes HTTP com httptest
  criterios:
    - Testes passando
    - Edge cases cobertos
    - Boa cobertura
  starterCode: |
    package utils

    import (
    	"net/http"
    	"net/http/httptest"
    	"testing"
    )

    // Função a testar: Slugify converte texto em URL slug
    // "Hello World!" → "hello-world"
    // "  Go é Demais  " → "go-é-demais"  (mantém acentos)
    func Slugify(s string) string {
    	// TODO: implemente
    	//  1. TrimSpace
    	//  2. ToLower
    	//  3. Substitua espaços por "-"
    	//  4. Remova caracteres não alfanuméricos (exceto - e acentos)
    	//  5. Colapse múltiplos "-" em um
    	return ""
    }

    // TODO: implemente TestSlugify com table-driven tests
    //   Casos: string normal, vazia, com espaços extras, com acentos,
    //   com caracteres especiais, com números
    func TestSlugify(t *testing.T) {
    	// TODO
    }

    // Handler a testar
    func statusHandler(w http.ResponseWriter, r *http.Request) {
    	w.Header().Set("Content-Type", "application/json")
    	w.Write([]byte(`{"status":"ok","version":"1.0"}`))
    }

    // TODO: implemente TestStatusHandler com httptest
    //   Verifique: status code, Content-Type, campos do JSON
    func TestStatusHandler(t *testing.T) {
    	_ = httptest.NewRequest
    	_ = httptest.NewRecorder
    	// TODO
    }

---

Go tem testes nativos: arquivos `_test.go` no mesmo diretório do código; funções `TestNome(t *testing.T)` são detectadas automaticamente por `go test`.

| Função | Comportamento |
|---|---|
| `t.Error` / `t.Errorf` | Marca falha, mas **continua** executando o teste |
| `t.Fatal` / `t.Fatalf` | Marca falha e **para** imediatamente |
| `t.Helper()` | Faz o reporter apontar para o **caller**, não para a função auxiliar |

## Table-driven tests

O idioma padrão em Go: define-se um slice de structs com campos `nome`, `input` e `expected`:

```go
cases := []struct {
    nome     string
    a, b     int
    expected int
}{
    {"positivos", 1, 2, 3},
    {"zeros", 0, 0, 0},
}
for _, tc := range cases {
    t.Run(tc.nome, func(t *testing.T) {
        got := Soma(tc.a, tc.b)
        if got != tc.expected {
            t.Errorf("got %d; want %d", got, tc.expected)
        }
    })
}
```

`go test -run TestSoma/positivos` roda somente o subtest `"positivos"`. Subtests podem chamar `t.Parallel()` — mas cuidado com captura de variável de loop (**Go 1.22+ corrigiu isso**).

## Cobertura

```bash
go test -cover                         # porcentagem na saída
go test -coverprofile=c.out            # gera arquivo
go tool cover -html=c.out              # visão interativa no browser
```

> **Cobertura não é métrica de qualidade por si só** — 80% com casos bem escolhidos vale mais que 100% com asserts triviais.

## HTTP testing

- `httptest.NewRecorder()` — captura status, headers e body sem bind em porta real
- `httptest.NewServer(handler)` — sobe servidor real em porta aleatória para testes de integração
