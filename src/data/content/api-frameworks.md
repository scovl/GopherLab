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

## Por que usar um framework se a stdlib já funciona?

Na aula anterior, criamos uma API CRUD com a stdlib (`net/http`). Funcionou! Mas conforme o projeto cresce, você vai sentir falta de:

| O que falta na stdlib | Exemplo |
|---|---|
| Middleware pronto | Logging, recover de panic, CORS |
| Agrupamento de rotas | `/api/v1/users`, `/api/v1/products` |
| Binding + Validação | "Parse o JSON e valida que `email` tem `@`" em **um** passo |
| Subrouters | Middleware diferente para `/admin` vs `/public` |

Frameworks resolvem isso. Mas qual escolher? Existem 4 populares:

```
Chi    → "sou a stdlib com superpoderes"
Gin    → "sou o mais popular, tenho tudo pronto"
Echo   → "sou parecido com Express.js (Node)"
Fiber  → "sou o mais rápido, mas incompatível"
```

---

## Chi — a stdlib com superpoderes

### Por que Chi é especial?

Chi é **100% compatível com `net/http`**. Isso significa:

- Seus handlers continuam sendo `func(w http.ResponseWriter, r *http.Request)` — o mesmo da stdlib
- Qualquer middleware de `net/http` funciona no Chi (e vice-versa)
- Se quiser voltar para stdlib, é só trocar o router — handlers não mudam

> **Analogia:** a stdlib é um **carro básico** (funciona, mas sem ar-condicionado). Chi é o **mesmo carro com acessórios** (ar, som, GPS). O motor é o mesmo.

### Exemplo completo com Chi

```go
package main

import (
    "encoding/json"
    "net/http"

    "github.com/go-chi/chi/v5"
    "github.com/go-chi/chi/v5/middleware"
)

func main() {
    r := chi.NewRouter()

    // Middlewares prontos — uma linha cada!
    r.Use(middleware.Logger)     // loga todas as requests
    r.Use(middleware.Recoverer)  // pega panics (não crasha o server)

    // Agrupamento de rotas com prefixo
    r.Route("/api/v1", func(r chi.Router) {
        r.Get("/users", listUsers)       // GET /api/v1/users
        r.Post("/users", createUser)     // POST /api/v1/users

        // Sub-rotas para um recurso específico
        r.Route("/users/{id}", func(r chi.Router) {
            r.Get("/", getUser)          // GET /api/v1/users/42
            r.Put("/", updateUser)       // PUT /api/v1/users/42
            r.Delete("/", deleteUser)    // DELETE /api/v1/users/42
        })
    })

    http.ListenAndServe(":8080", r)
}
```

### Diferenças da stdlib

| O que | stdlib (Go 1.22+) | Chi |
|---|---|---|
| Criar router | `http.NewServeMux()` | `chi.NewRouter()` |
| Definir rota | `mux.HandleFunc("GET /users/{id}", fn)` | `r.Get("/users/{id}", fn)` |
| Path param | `r.PathValue("id")` | `chi.URLParam(r, "id")` |
| Middleware | Manual (wrapping) | `r.Use(middleware.Logger)` |
| Subrouter | Não tem | `r.Route("/prefix", func(r) {...})` |
| Handler | `func(w, r)` | `func(w, r)` — **igual!** |

```go
// Extraindo path param no Chi:
func getUser(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")  // ← única diferença da stdlib
    // resto é igual...
}
```

### Middlewares prontos do Chi

```go
r.Use(middleware.Logger)       // loga: "GET /api/users 200 3.2ms"
r.Use(middleware.Recoverer)    // pega panic → retorna 500 (server não morre)
r.Use(middleware.RealIP)       // pega IP real atrás de proxy/nginx
r.Use(middleware.Timeout(30 * time.Second))  // mata requests lentas
r.Use(middleware.Compress(5))  // comprime responses (gzip)
```

> **Sem Chi:** você teria que escrever cada um desses middlewares na mão (vimos como na aula anterior — funciona, mas é chato).

---

## Gin — o framework mais popular

Gin é o framework Go **mais usado** (70K+ stars no GitHub). A diferença principal: ele tem seu **próprio Context** (`gin.Context`) em vez de usar `http.ResponseWriter` + `*http.Request`.

### Exemplo com Gin

```go
package main

import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()  // já vem com Logger + Recovery

    r.GET("/api/users", func(c *gin.Context) {
        c.JSON(200, gin.H{"users": []string{"Alice", "Bob"}})
        //          ^^^^^ gin.H é um atalho para map[string]any
    })

    r.GET("/api/users/:id", func(c *gin.Context) {
        id := c.Param("id")  // path param
        c.JSON(200, gin.H{"id": id})
    })

    r.Run(":8080")
}
```

### Binding + Validação — o superpoder do Gin

No Gin, parse de JSON **e** validação acontecem ao mesmo tempo:

```go
type CriarUsuarioInput struct {
    Nome  string `json:"nome"  binding:"required"`           // obrigatório
    Email string `json:"email" binding:"required,email"`     // obrigatório + formato email
    Idade int    `json:"idade" binding:"required,min=0,max=150"` // entre 0 e 150
}

func criarUsuario(c *gin.Context) {
    var input CriarUsuarioInput

    // ShouldBindJSON faz TUDO: lê JSON + valida campos
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        // Mensagem: "Key: 'CriarUsuarioInput.Email' Error:Field validation for 'Email' failed"
        return
    }

    // Se chegou aqui, input está válido!
    c.JSON(201, gin.H{"usuario": input})
}
```

### Tags `binding` mais comuns

| Tag | O que valida | Exemplo |
|---|---|---|
| `required` | Campo não pode ser vazio/zero | `binding:"required"` |
| `email` | Formato de email | `binding:"email"` |
| `min=N` | Valor mínimo (número) ou tamanho mínimo (string) | `binding:"min=1"` |
| `max=N` | Valor máximo ou tamanho máximo | `binding:"max=150"` |
| `len=N` | Tamanho exato | `binding:"len=11"` |
| `oneof=a b c` | Deve ser um dos valores | `binding:"oneof=admin user"` |

> **Na stdlib/Chi:** não existe binding automático. Você faz `json.Decode` + valida campo por campo manualmente (ou usa a biblioteca `go-playground/validator` separadamente).

---

## Chi vs Gin — a grande diferença

```go
// Chi — handler IGUAL à stdlib
func getUser(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"id": id})
}

// Gin — handler com gin.Context (API própria)
func getUser(c *gin.Context) {
    id := c.Param("id")
    c.JSON(200, gin.H{"id": id})
}
```

| Aspecto | Chi | Gin |
|---|---|---|
| Handler recebe | `(w, r)` — **igual stdlib** | `gin.Context` — **API própria** |
| Ler JSON | `json.NewDecoder(r.Body).Decode(&x)` | `c.ShouldBindJSON(&x)` |
| Enviar JSON | `json.NewEncoder(w).Encode(x)` | `c.JSON(200, x)` |
| Validação | Manual ou biblioteca separada | **Integrada** (tags `binding`) |
| Path param | `chi.URLParam(r, "id")` | `c.Param("id")` |
| Compatível com net/http | ✅ Total | ❌ Precisa de adaptadores |

> **Traduzindo:** Chi escreve mais código, mas é tudo padrão Go. Gin escreve menos código, mas você fica "preso" na API do Gin.

---

## Echo — familiar para quem vem de Node.js

Se você já usou **Express.js** (Node), Echo vai parecer familiar:

```go
e := echo.New()
e.Use(middleware.Logger())

e.GET("/users/:id", func(c echo.Context) error {
    id := c.Param("id")
    return c.JSON(200, map[string]string{"id": id})
})

e.Start(":8080")
```

Echo tem `echo.Context` (como Gin), binding integrado, e uma API limpa. É menos popular que Gin mas tem fãs fiéis.

---

## Fiber — o mais rápido (mas com custo)

Fiber usa **fasthttp** (não `net/http`), o que o torna o mais rápido em benchmarks:

```go
app := fiber.New()

app.Get("/users/:id", func(c *fiber.Ctx) error {
    id := c.Params("id")
    return c.JSON(fiber.Map{"id": id})
})

app.Listen(":8080")
```

### ⚠️ O custo: incompatibilidade total

```go
// ❌ Middlewares de net/http NÃO funcionam com Fiber
// ❌ Bibliotecas que esperam http.Handler NÃO funcionam
// ❌ Migrar para outro framework exige reescrever tudo
```

> **Use Fiber apenas se:** throughput extremo é sua prioridade E você aceita ficar preso ao ecossistema Fiber.

---

## Tabela comparativa — qual escolher?

| | Chi | Gin | Echo | Fiber |
|---|---|---|---|---|
| **Filosofia** | Stdlib++ | Tudo incluso | Express-like | Performance máxima |
| **Handler** | `func(w, r)` | `func(c *gin.Context)` | `func(c echo.Context)` | `func(c *fiber.Ctx)` |
| **Compatível net/http** | ✅ Total | ❌ | ❌ | ❌ |
| **Binding/Validação** | Manual | ✅ Integrado | ✅ Integrado | ✅ Integrado |
| **Middleware pronto** | ~15 | ~20 | ~15 | ~20 |
| **GitHub Stars** | 18K+ | 70K+ | 28K+ | 30K+ |
| **Curva de aprendizado** | Fácil (é stdlib) | Fácil | Fácil | Médio |
| **Migrar para stdlib** | Trivial | Reescrita | Reescrita | Reescrita total |

---

## Fluxograma: qual framework escolher?

```
Preciso de framework? (stdlib Go 1.22+ já tem rotas e params)
│
├── Não → use net/http puro (projetos simples)
│
└── Sim → Preciso de compatibilidade com net/http?
    │
    ├── Sim → Chi ✅
    │
    └── Não → Preciso de binding/validação integrada?
        │
        ├── Sim → Gin (mais popular) ou Echo (mais limpo)
        │
        └── Preciso de throughput extremo?
            │
            ├── Sim → Fiber (aceita incompatibilidade)
            │
            └── Não → Gin ou Chi (qualquer um resolve)
```

> **Regra prática:** na dúvida entre Chi e Gin? Se você gosta da forma como Go funciona (interfaces, stdlib), vá de **Chi**. Se quer produtividade máxima e não se importa com API própria, vá de **Gin**. Os dois são excelentes.

---

## Resumo — o que cada um faz de melhor

| Preciso de... | Melhor escolha |
|---|---|
| Ficar próximo da stdlib | **Chi** |
| Binding + validação automática | **Gin** |
| API familiar (vindo de Express/Node) | **Echo** |
| Performance extrema (benchmarks) | **Fiber** |
| Projeto simples sem dependências | **stdlib** (`net/http`) |
| Migrar facilmente entre frameworks | **Chi** (handlers são stdlib) |
