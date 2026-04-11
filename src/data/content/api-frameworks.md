---
title: "Frameworks: Chi, Gin e Echo"
description: Middleware chain, subrouters, binding e validação com frameworks populares.
estimatedMinutes: 45
recursos:
  - https://github.com/go-chi/chi
  - https://github.com/gin-gonic/gin
  - https://github.com/labstack/echo
experimentacao:
  desafio: Migre a API CRUD da lição anterior para Chi e depois para Gin. Compare linhas de código, middleware e developer experience.
  dicas:
    - "Chi: chi.URLParam(r, \"id\") para path params"
    - "Gin: c.Param(\"id\"), c.ShouldBindJSON(&input)"
    - "Echo: c.Bind(&input), c.JSON(200, result)"
  codeTemplate: |
    package main

    import (
    	"net/http"

    	"github.com/go-chi/chi/v5"
    	"github.com/go-chi/chi/v5/middleware"
    )

    type User struct {
    	ID    string `json:"id"`
    	Name  string `json:"name"`
    	Email string `json:"email"`
    }

    func main() {
    	r := chi.NewRouter()
    	r.Use(middleware.Logger)
    	r.Use(middleware.Recoverer)

    	r.Route("/api/v1", func(r chi.Router) {
    		r.Get("/users", func(w http.ResponseWriter, r *http.Request) {
    			w.Write([]byte(`[{"id":"1","name":"Gopher"}]`))
    		})
    		r.Route("/users/{id}", func(r chi.Router) {
    			r.Get("/", func(w http.ResponseWriter, r *http.Request) {
    				id := chi.URLParam(r, "id")
    				w.Write([]byte(`{"id":"` + id + `"}`))
    			})
    		})
    	})

    	http.ListenAndServe(":8080", r)
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **Chi** — router 100% compatível com `net/http`. `chi.NewRouter()` retorna um `http.Handler` padrão. Handlers são `func(http.ResponseWriter, *http.Request)` — o mesmo da stdlib. Migrar entre Chi e stdlib é trivial.

    **`r.Use(middleware.Logger)`** — middleware chain na ordem de declaração. Chi fornece middlewares prontos: Logger, Recoverer, RealIP, Timeout, Compress. Você também pode usar qualquer middleware compatível com `net/http`.

    **`r.Route("/api/v1", func(r chi.Router) {...})`** — subrouter com prefixo. Organiza rotas por versão ou recurso. Cada subrouter pode ter middlewares próprios (ex: autenticação apenas em `/api/v1/admin`).

    **`chi.URLParam(r, "id")`** — extrai path params. Em Chi v5, params ficam no `context` da request. Em Gin seria `c.Param("id")`, em Echo `c.Param("id")` — cada framework tem sua API para path params.

    **Gin binding** — `c.ShouldBindJSON(&input)` faz parsing + validação em um passo. Tags `binding:"required,email"` validam automaticamente. Chi e stdlib não têm binding integrado — use `go-playground/validator` separadamente.

    **Performance** — todos os frameworks Go são rápidos (10K+ req/s). A diferença real é **developer experience**: Chi é minimal, Gin tem mais features, Echo é familiar para devs Node.js. Fiber usa `fasthttp` (incompatível com `net/http`).
socializacao:
  discussao: "Chi vs Gin vs Echo vs Fiber – qual framework escolher?"
  pontos:
    - "Chi: stdlib-compatible, ideal para puristas"
    - "Gin: ecosystem grande, popular em empresas"
    - "Echo: DX similar ao Express"
    - "Fiber: fasthttp, max throughput mas não stdlib-compatible"
  diasDesafio: Dias 53–60
  sugestaoBlog: "Chi vs Gin vs Echo: comparando frameworks Go na prática"
  hashtagsExtras: '#golang #chi #gin #echo'
aplicacao:
  projeto: API RESTful com Chi ou Gin com versionamento, middleware de CORS e rate limiting.
  requisitos:
    - Subrouters para /api/v1
    - Middleware de CORS e rate limiting
    - Binding e validação de input
  criterios:
    - Rotas organizadas
    - Middleware funcional
    - Validação robusta
  starterCode: |
    package main

    import (
    	"encoding/json"
    	"net/http"
    	"sync"

    	"github.com/go-chi/chi/v5"
    	"github.com/go-chi/chi/v5/middleware"
    )

    type Nota struct {
    	ID    string `json:"id"`
    	Texto string `json:"texto"`
    }

    type NotaAPI struct {
    	mu    sync.Mutex
    	notas map[string]Nota
    	next  int
    }

    func (a *NotaAPI) Routes() chi.Router {
    	r := chi.NewRouter()
    	r.Get("/", a.listar)
    	r.Post("/", a.criar)
    	r.Route("/{id}", func(r chi.Router) {
    		r.Get("/", a.buscar)
    		r.Put("/", a.atualizar)
    		r.Delete("/", a.deletar)
    	})
    	return r
    }

    func (a *NotaAPI) listar(w http.ResponseWriter, r *http.Request) {
    	a.mu.Lock()
    	var lista []Nota
    	for _, n := range a.notas {
    		lista = append(lista, n)
    	}
    	a.mu.Unlock()
    	w.Header().Set("Content-Type", "application/json")
    	json.NewEncoder(w).Encode(lista)
    }

    // TODO: implemente criar, buscar, atualizar, deletar
    func (a *NotaAPI) criar(w http.ResponseWriter, r *http.Request)     { /* TODO */ }
    func (a *NotaAPI) buscar(w http.ResponseWriter, r *http.Request)    { /* TODO */ }
    func (a *NotaAPI) atualizar(w http.ResponseWriter, r *http.Request) { /* TODO */ }
    func (a *NotaAPI) deletar(w http.ResponseWriter, r *http.Request)   { /* TODO */ }

    func main() {
    	r := chi.NewRouter()
    	r.Use(middleware.Logger)
    	r.Use(middleware.Recoverer)

    	api := &NotaAPI{notas: make(map[string]Nota)}
    	r.Mount("/api/v1/notas", api.Routes())

    	http.ListenAndServe(":8080", r)
    }

---

## Chi

Idiomático e **100% compatível com `net/http`**:

```go
r := chi.NewRouter()
r.Use(middleware.Logger, middleware.Recoverer)
r.Route("/api/v1", func(r chi.Router) {
    r.Get("/users", listUsers)
    r.Post("/users", createUser)
    r.Route("/users/{id}", func(r chi.Router) {
        r.Get("/", getUser)
        r.Put("/", updateUser)
        r.Delete("/", deleteUser)
    })
})
```

Path params: `chi.URLParam(r, "id")`

## Gin

O framework mais popular em Go, com binding e validação integradas:

```go
type CreateUserInput struct {
    Name  string `json:"name" binding:"required"`
    Email string `json:"email" binding:"required,email"`
}

func createUser(c *gin.Context) {
    var input CreateUserInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    c.JSON(201, gin.H{"user": input})
}
```

Path params: `c.Param("id")`

## Comparativo

| Framework | Filosofia | Compatibilidade `net/http` |
|---|---|---|
| Chi | Idiomático, minimal | ✅ Total |
| Gin | Produtividade, binding | ❌ Usa gin.Context |
| Echo | Similar ao Express.js | ❌ Usa echo.Context |
| Fiber | Throughput máximo (fasthttp) | ❌ API completamente diferente |

> **Regra:** Go já é rápido por si só — frameworks adicionam **conveniência**, não performance.
