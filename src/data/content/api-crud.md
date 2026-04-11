---
title: API CRUD com Standard Library
description: REST API completa com net/http, JSON e middleware básico.
estimatedMinutes: 40
recursos:
  - https://pkg.go.dev/net/http
experimentacao:
  desafio: "Crie uma API CRUD para livros com a stdlib: GET (lista e por ID), POST, PUT, DELETE. Use map como banco em memória. Adicione middleware de logging."
  dicas:
    - r.PathValue("id") para path params (Go 1.22+)
    - w.WriteHeader(http.StatusCreated) para POST
    - json.NewDecoder(r.Body).Decode(&struct) para parse
  codeTemplate: |
    package main

    import (
    	"encoding/json"
    	"fmt"
    	"log"
    	"net/http"
    	"sync"
    	"time"
    )

    type Livro struct {
    	ID     string `json:"id"`
    	Titulo string `json:"titulo"`
    	Autor  string `json:"autor"`
    }

    var (
    	livros = map[string]Livro{
    		"1": {ID: "1", Titulo: "The Go Programming Language", Autor: "Donovan & Kernighan"},
    	}
    	mu sync.Mutex
    )

    func logMiddleware(next http.Handler) http.Handler {
    	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    		start := time.Now()
    		next.ServeHTTP(w, r)
    		log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    	})
    }

    func listar(w http.ResponseWriter, r *http.Request) {
    	mu.Lock()
    	var lista []Livro
    	for _, l := range livros {
    		lista = append(lista, l)
    	}
    	mu.Unlock()
    	w.Header().Set("Content-Type", "application/json")
    	json.NewEncoder(w).Encode(lista)
    }

    func buscar(w http.ResponseWriter, r *http.Request) {
    	id := r.PathValue("id")
    	mu.Lock()
    	livro, ok := livros[id]
    	mu.Unlock()
    	if !ok {
    		http.Error(w, `{"error":"não encontrado"}`, http.StatusNotFound)
    		return
    	}
    	w.Header().Set("Content-Type", "application/json")
    	json.NewEncoder(w).Encode(livro)
    }

    func criar(w http.ResponseWriter, r *http.Request) {
    	var livro Livro
    	if err := json.NewDecoder(r.Body).Decode(&livro); err != nil {
    		http.Error(w, `{"error":"JSON inválido"}`, http.StatusBadRequest)
    		return
    	}
    	livro.ID = fmt.Sprintf("%d", time.Now().UnixNano())
    	mu.Lock()
    	livros[livro.ID] = livro
    	mu.Unlock()
    	w.Header().Set("Content-Type", "application/json")
    	w.WriteHeader(http.StatusCreated)
    	json.NewEncoder(w).Encode(livro)
    }

    func main() {
    	mux := http.NewServeMux()
    	mux.HandleFunc("GET /api/livros", listar)
    	mux.HandleFunc("GET /api/livros/{id}", buscar)
    	mux.HandleFunc("POST /api/livros", criar)
    	fmt.Println("Servidor em :8080")
    	log.Fatal(http.ListenAndServe(":8080", logMiddleware(mux)))
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`"GET /api/livros/{id}"`** — a partir do **Go 1.22**, o `ServeMux` suporta métodos HTTP e path params nativamente. `r.PathValue("id")` extrai o parâmetro. Antes do 1.22, isso exigia frameworks como Chi ou Gin.

    **`json.NewDecoder(r.Body).Decode(&livro)`** — decodifica JSON **direto do stream** do request body. Alternativa: `io.ReadAll` + `json.Unmarshal`, mas o decoder é mais eficiente (não carrega tudo na memória).

    **`w.WriteHeader(http.StatusCreated)`** — define o status **201 Created** antes de escrever o body. DEVE ser chamado antes de qualquer `w.Write` ou `json.NewEncoder(w).Encode`. Se não chamar, Go usa 200 OK por padrão.

    **`w.Header().Set("Content-Type", "application/json")`** — define o header **antes** de `WriteHeader` ou `Write`. Headers escritos após o body são ignorados. Em produção, crie um helper `respondJSON(w, status, data)`.

    **Middleware pattern** — `func middleware(next http.Handler) http.Handler` é o padrão Go. Middleware é uma função que recebe um handler e retorna um handler wrapping. Encadear: `logMiddleware(authMiddleware(mux))`.

    **`sync.Mutex`** — protege o mapa `livros` contra data races. Em produção, substitua o map por um banco de dados real.
socializacao:
  discussao: Standard library é suficiente para APIs em produção?
  pontos:
    - Go 1.22 melhorou muito – path params e métodos nativos
    - Middleware é manual mas funcional
    - Frameworks adicionam conveniência, não performance
  diasDesafio: Dias 53–60
  sugestaoBlog: "REST API em Go com standard library: CRUD completo sem frameworks"
  hashtagsExtras: '#golang #api #rest'
aplicacao:
  projeto: API CRUD de tarefas (todo) com standard library e testes com httptest.
  requisitos:
    - GET/POST/PUT/DELETE
    - JSON I/O
    - Status codes corretos
    - Testes httptest
  criterios:
    - RESTful
    - Tratamento de erros
    - Testes cobrindo happy path e erros
  starterCode: |
    package main

    import (
    	"encoding/json"
    	"fmt"
    	"log"
    	"net/http"
    	"sync"
    	"time"
    )

    type Tarefa struct {
    	ID        string `json:"id"`
    	Titulo    string `json:"titulo"`
    	Concluida bool   `json:"concluida"`
    }

    type API struct {
    	mu      sync.Mutex
    	tarefas map[string]Tarefa
    	nextID  int
    }

    func (a *API) listar(w http.ResponseWriter, r *http.Request) {
    	a.mu.Lock()
    	var lista []Tarefa
    	for _, t := range a.tarefas {
    		lista = append(lista, t)
    	}
    	a.mu.Unlock()
    	w.Header().Set("Content-Type", "application/json")
    	json.NewEncoder(w).Encode(lista)
    }

    func (a *API) criar(w http.ResponseWriter, r *http.Request) {
    	var t Tarefa
    	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
    		http.Error(w, `{"error":"JSON inválido"}`, http.StatusBadRequest)
    		return
    	}
    	a.mu.Lock()
    	a.nextID++
    	t.ID = fmt.Sprintf("%d", a.nextID)
    	a.tarefas[t.ID] = t
    	a.mu.Unlock()
    	w.Header().Set("Content-Type", "application/json")
    	w.WriteHeader(http.StatusCreated)
    	json.NewEncoder(w).Encode(t)
    }

    // TODO: implemente buscar (GET /api/tarefas/{id})
    // TODO: implemente atualizar (PUT /api/tarefas/{id})
    // TODO: implemente deletar (DELETE /api/tarefas/{id})
    // TODO: adicione middleware de logging
    // TODO: adicione testes com httptest

    func main() {
    	api := &API{tarefas: make(map[string]Tarefa)}
    	mux := http.NewServeMux()
    	mux.HandleFunc("GET /api/tarefas", api.listar)
    	mux.HandleFunc("POST /api/tarefas", api.criar)
    	fmt.Println("Servidor em :8080")
    	log.Fatal(http.ListenAndServe(":8080", mux))
    }

---

Com **Go 1.22+**, o `ServeMux` suporta métodos HTTP e path params nativamente:

```go
mux.HandleFunc("GET /api/users/{id}", getUser)
mux.HandleFunc("POST /api/users", createUser)
mux.HandleFunc("PUT /api/users/{id}", updateUser)
mux.HandleFunc("DELETE /api/users/{id}", deleteUser)
```

Combine com `json.NewDecoder`/`Encoder` para I/O JSON, status codes corretos (`http.StatusCreated`, `http.StatusNotFound`) e middleware como funções que wrappam handlers:

```go
func logMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}
```

## Pattern: handler struct

Ao compartilhar dependências (DB, logger, cache) entre handlers, use uma struct:

```go
type API struct {
    db     *sql.DB
    logger *slog.Logger
}

func (a *API) getUser(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    // usa a.db e a.logger
}
```

## Melhores práticas REST

- Use os status codes corretos: `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`
- Retorne `Content-Type: application/json` explicitamente
- Valide input antes de processar — nunca confie em dados do cliente
