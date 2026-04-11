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

## O que é uma API REST?

Imagine um **restaurante**. Você (o cliente) não vai até a cozinha fazer sua comida. Você pede ao **garçom** (a API), que leva o pedido para a cozinha (o servidor), que prepara e devolve o prato.

```
Cliente (browser, app)  ──pedido──→  API (servidor Go)  ──consulta──→  Banco de dados
                        ←──prato──                      ←──dados───
```

Uma API REST usa **verbos HTTP** para dizer o que quer:

| Verbo | O que faz | Analogia no restaurante |
|---|---|---|
| `GET` | Buscar dados | "Me traz o cardápio" / "Me traz o prato 5" |
| `POST` | Criar algo novo | "Quero fazer um pedido novo" |
| `PUT` | Atualizar algo | "Muda o prato 5 para sem cebola" |
| `DELETE` | Remover algo | "Cancela o prato 5" |

### CRUD = as 4 operações básicas

| Letra | Significa | Verbo HTTP | SQL equivalente |
|---|---|---|---|
| **C**reate | Criar | `POST` | `INSERT` |
| **R**ead | Ler | `GET` | `SELECT` |
| **U**pdate | Atualizar | `PUT` | `UPDATE` |
| **D**elete | Deletar | `DELETE` | `DELETE` |

---

## Go 1.22+ mudou tudo — rotas na stdlib!

Antes do Go 1.22, a stdlib não suportava coisas básicas como diferenciar `GET` de `POST` na mesma rota. Precisava de frameworks (Gin, Chi). Agora:

```go
mux := http.NewServeMux()

// MÉTODO + ROTA + {parâmetro}
mux.HandleFunc("GET /api/livros", listar)         // lista todos
mux.HandleFunc("GET /api/livros/{id}", buscar)     // busca por ID
mux.HandleFunc("POST /api/livros", criar)          // cria novo
mux.HandleFunc("PUT /api/livros/{id}", atualizar)  // atualiza
mux.HandleFunc("DELETE /api/livros/{id}", deletar) // deleta
```

### Extraindo o parâmetro da URL

```go
func buscar(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")  // Go 1.22+ → pega o {id} da URL
    fmt.Println(id)           // se a URL é /api/livros/42 → id = "42"
}
```

---

## Construindo a API passo a passo

### Passo 1: Defina o "modelo" (a struct)

```go
type Livro struct {
    ID     string `json:"id"`
    Titulo string `json:"titulo"`
    Autor  string `json:"autor"`
}
```

As tags `json:"..."` controlam como a struct vira JSON:

```go
Livro{ID: "1", Titulo: "Go em Ação", Autor: "Kennedy"}
// Vira:
// {"id":"1","titulo":"Go em Ação","autor":"Kennedy"}
```

### Passo 2: Crie o "banco" em memória

```go
var (
    livros = map[string]Livro{
        "1": {ID: "1", Titulo: "The Go Programming Language", Autor: "Donovan"},
    }
    mu sync.Mutex  // protege o map contra data race (lembra da aula de sync?)
)
```

> Em produção, troque o `map` por um banco de dados real (PostgreSQL, etc.). O `sync.Mutex` é necessário porque o servidor HTTP atende vários requests **ao mesmo tempo** (cada um numa goroutine).

### Passo 3: Handler de LISTAR (GET)

```go
func listar(w http.ResponseWriter, r *http.Request) {
    mu.Lock()
    var lista []Livro
    for _, l := range livros {
        lista = append(lista, l)
    }
    mu.Unlock()

    w.Header().Set("Content-Type", "application/json")  // "estou devolvendo JSON"
    json.NewEncoder(w).Encode(lista)                     // converte para JSON e envia
}
```

### Passo 4: Handler de BUSCAR por ID (GET)

```go
func buscar(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")  // pega o {id} da URL

    mu.Lock()
    livro, ok := livros[id]
    mu.Unlock()

    if !ok {
        http.Error(w, `{"error":"não encontrado"}`, http.StatusNotFound)  // 404
        return  // ⚠️ OBRIGATÓRIO! Sem return, o código continua e envia 2 respostas
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(livro)
}
```

### Passo 5: Handler de CRIAR (POST)

```go
func criar(w http.ResponseWriter, r *http.Request) {
    var livro Livro

    // Decodifica o JSON do body do request → preenche a struct
    if err := json.NewDecoder(r.Body).Decode(&livro); err != nil {
        http.Error(w, `{"error":"JSON inválido"}`, http.StatusBadRequest)  // 400
        return
    }

    // Gera um ID simples (em produção, use UUID)
    livro.ID = fmt.Sprintf("%d", time.Now().UnixNano())

    mu.Lock()
    livros[livro.ID] = livro
    mu.Unlock()

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)  // 201 = "criei com sucesso"
    json.NewEncoder(w).Encode(livro)
}
```

### Passo 6: Handler de DELETAR (DELETE)

```go
func deletar(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")

    mu.Lock()
    _, ok := livros[id]
    if ok {
        delete(livros, id)
    }
    mu.Unlock()

    if !ok {
        http.Error(w, `{"error":"não encontrado"}`, http.StatusNotFound)
        return
    }

    w.WriteHeader(http.StatusNoContent)  // 204 = "feito, sem body para devolver"
}
```

---

## Status codes — o que responder em cada caso

| Código | Nome | Quando usar |
|---|---|---|
| `200` | OK | GET/PUT deu certo |
| `201` | Created | POST criou com sucesso |
| `204` | No Content | DELETE deu certo (sem body) |
| `400` | Bad Request | JSON inválido, campo faltando |
| `404` | Not Found | ID não existe |
| `500` | Internal Server Error | Bug no servidor |

```go
// Go tem constantes para todos:
http.StatusOK                  // 200
http.StatusCreated             // 201
http.StatusNoContent           // 204
http.StatusBadRequest          // 400
http.StatusNotFound            // 404
http.StatusInternalServerError // 500
```

---

## Respondendo JSON — as 3 armadilhas

### Armadilha 1: Esquecer o Content-Type

```go
// ❌ O browser não sabe que é JSON
json.NewEncoder(w).Encode(livro)

// ✅ Diz "estou mandando JSON"
w.Header().Set("Content-Type", "application/json")
json.NewEncoder(w).Encode(livro)
```

### Armadilha 2: Ordem errada — WriteHeader depois de Write

```go
// ❌ Header é ignorado! Write já enviou o status 200
json.NewEncoder(w).Encode(livro)
w.WriteHeader(http.StatusCreated)  // tarde demais!

// ✅ Primeiro o status, depois o body
w.WriteHeader(http.StatusCreated)
json.NewEncoder(w).Encode(livro)
```

> **Regra:** a ordem é sempre **Header → WriteHeader → Body**. Se inverter, Go já enviou status 200 e não pode mudar.

### Armadilha 3: Esquecer o `return` depois de erro

```go
// ❌ Envia 404 E depois envia o JSON → resposta corrompida!
if !ok {
    http.Error(w, "not found", http.StatusNotFound)
    // falta return!
}
json.NewEncoder(w).Encode(livro)  // AINDA EXECUTA!

// ✅ Com return, para aqui
if !ok {
    http.Error(w, "not found", http.StatusNotFound)
    return
}
```

---

## Helper `respondJSON` — evite repetição

Em vez de repetir `w.Header().Set(...)` em todo handler, crie um helper:

```go
func respondJSON(w http.ResponseWriter, status int, data any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, msg string) {
    respondJSON(w, status, map[string]string{"error": msg})
}

// Agora os handlers ficam limpos:
func buscar(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    livro, ok := livros[id]
    if !ok {
        respondError(w, http.StatusNotFound, "não encontrado")
        return
    }
    respondJSON(w, http.StatusOK, livro)
}
```

---

## Middleware — código que roda ANTES de todo handler

### O que é middleware?

É uma função que **envolve** o handler, adicionando comportamento extra:

```
Request → [Middleware de Log] → [Middleware de Auth] → [Handler real] → Response
```

> **Analogia:** middleware é como um **porteiro** de prédio. Todo mundo que entra (request) passa por ele primeiro. Ele anota quem entrou (log), verifica identidade (auth), e só então deixa subir (handler).

### Middleware de logging

```go
func logMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)  // chama o handler real
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

// Aplicando:
log.Fatal(http.ListenAndServe(":8080", logMiddleware(mux)))
```

### Encadeando middlewares

```go
// Cada middleware envolve o próximo, como uma cebola:
handler := logMiddleware(authMiddleware(mux))
//         camada externa → camada interna → handler real
```

---

## Handler Struct — o jeito profissional

Quando seus handlers precisam acessar **banco de dados, logger, cache**, etc., use uma struct:

```go
type API struct {
    db     *sql.DB
    logger *slog.Logger
}

// Os handlers são métodos da struct — acessam db e logger diretamente
func (a *API) buscar(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    livro, err := a.db.QueryRow("...", id)  // usa a.db
    a.logger.Info("buscou livro", "id", id)  // usa a.logger
    // ...
}

func main() {
    api := &API{
        db:     conectarBanco(),
        logger: slog.Default(),
    }

    mux := http.NewServeMux()
    mux.HandleFunc("GET /api/livros/{id}", api.buscar)
    //                                      ^^^ método da struct
}
```

> **Por que struct?** Variáveis globais (como nosso `var livros = map...`) funcionam para exemplos, mas em projetos reais você quer **injeção de dependência** — a struct recebe o banco, o logger, etc. Isso facilita testes (pode injetar um banco fake).

---

## Validação — nunca confie no cliente

```go
func criar(w http.ResponseWriter, r *http.Request) {
    var livro Livro
    if err := json.NewDecoder(r.Body).Decode(&livro); err != nil {
        respondError(w, http.StatusBadRequest, "JSON inválido")
        return
    }

    // ✅ Valide ANTES de salvar
    if livro.Titulo == "" {
        respondError(w, http.StatusBadRequest, "titulo é obrigatório")
        return
    }
    if livro.Autor == "" {
        respondError(w, http.StatusBadRequest, "autor é obrigatório")
        return
    }

    // Agora sim, salva...
}
```

> **Regra:** tudo que vem do cliente (body, query params, headers) pode estar errado, vazio ou malicioso. Sempre valide.

---

## Subindo o servidor — tudo junto

```go
func main() {
    mux := http.NewServeMux()

    mux.HandleFunc("GET /api/livros", listar)
    mux.HandleFunc("GET /api/livros/{id}", buscar)
    mux.HandleFunc("POST /api/livros", criar)
    mux.HandleFunc("PUT /api/livros/{id}", atualizar)
    mux.HandleFunc("DELETE /api/livros/{id}", deletar)

    fmt.Println("Servidor em http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", logMiddleware(mux)))
}
```

### Testando com curl

```bash
# Listar todos
curl http://localhost:8080/api/livros

# Buscar por ID
curl http://localhost:8080/api/livros/1

# Criar
curl -X POST http://localhost:8080/api/livros \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Go em Ação","autor":"Kennedy"}'

# Deletar
curl -X DELETE http://localhost:8080/api/livros/1
```

---

## Resumo — o mapa mental da API REST em Go

```
http.NewServeMux()
├── "GET /api/recursos"       → listar
├── "GET /api/recursos/{id}"  → buscar por ID
├── "POST /api/recursos"      → criar
├── "PUT /api/recursos/{id}"  → atualizar
└── "DELETE /api/recursos/{id}" → deletar

Cada handler: func(w http.ResponseWriter, r *http.Request)
│  w = onde você ESCREVE a resposta (caneta)
│  r = de onde você LÊ o request (envelope)
│
├── r.PathValue("id")          → parâmetro da URL
├── json.NewDecoder(r.Body)    → ler JSON do request
├── json.NewEncoder(w).Encode  → enviar JSON na resposta
├── w.WriteHeader(status)      → definir status code
└── w.Header().Set(...)        → definir headers
```

| Preciso de... | Use |
|---|---|
| Rotas com método e parâmetro | `"GET /api/x/{id}"` + `r.PathValue("id")` |
| Ler JSON do request | `json.NewDecoder(r.Body).Decode(&struct)` |
| Enviar JSON na resposta | `json.NewEncoder(w).Encode(data)` |
| Status code diferente de 200 | `w.WriteHeader(http.StatusCreated)` |
| Código antes de todo handler | Middleware: `func(next http.Handler) http.Handler` |
| Compartilhar DB entre handlers | Handler struct com métodos |
