---
title: Servidores HTTP e Templates
description: Criando servidores HTTP, multiplexers, middleware e templates.
estimatedMinutes: 50
recursos:
  - https://gobyexample.com/http-servers
  - https://pkg.go.dev/net/http
  - https://pkg.go.dev/html/template
experimentacao:
  desafio: "Crie um servidor HTTP com: (1) API JSON CRUD para notas; (2) frontend HTML com templates; (3) middleware de logging que imprime método, path e duração."
  dicas:
    - "Middleware: func middleware(next http.Handler) http.Handler"
    - "Templates: template.ParseFiles para arquivos .html"
    - Use map como banco em memória para começar
  codeTemplate: |
    package main

    import (
    	"encoding/json"
    	"fmt"
    	"html/template"
    	"net/http"
    )

    func main() {
    	mux := http.NewServeMux()
    	mux.HandleFunc("GET /api/users/{id}", func(w http.ResponseWriter, r *http.Request) {
    		id := r.PathValue("id")
    		json.NewEncoder(w).Encode(map[string]string{"id": id})
    	})
    	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
    		tmpl := template.Must(template.New("index").Parse(`<h1>Olá, {{.Nome}}!</h1>`))
    		tmpl.Execute(w, map[string]string{"Nome": "Gopher"})
    	})
    	fmt.Println("Servidor rodando em :8080")
    	http.ListenAndServe(":8080", mux)
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`http.NewServeMux()`** — o multiplexer da stdlib. A partir do **Go 1.22**, suporta métodos HTTP e path params nativamente: `"GET /api/users/{id}"`. Antes, rotas como `/api/users/123` exigiam frameworks como Chi ou Gin.

    **`r.PathValue("id")`** — extrai o parâmetro `{id}` da URL. Funciona apenas com o novo padrão do Go 1.22+ no `ServeMux`. Retorna string vazia se o param não existir.

    **`json.NewEncoder(w).Encode(v)`** — serializa `v` diretamente no `ResponseWriter` como JSON. Define automaticamente `Content-Type: text/plain` (para JSON, defina manualmente `w.Header().Set("Content-Type", "application/json")` antes do Encode).

    **`template.Must`** — wrapper que panics se `template.New(...).Parse(...)` retornar erro. Use para templates estáticos carregados em `init()` ou `main()`. Para templates carregados em runtime (de disco), use `template.ParseFiles` com tratamento de erro.

    **`html/template` vs `text/template`** — `html/template` faz **escape automático** contra XSS: `<script>` vira `&lt;script&gt;`. Use `html/template` sempre que gerar HTML. `text/template` é para texto puro, configs, emails.

    **`http.ListenAndServe(":8080", mux)`** — bloqueia a goroutine current. Em produção, use `http.Server{Addr: ":8080", Handler: mux, ReadTimeout: 10*time.Second}` com `server.ListenAndServe()` para configurar timeouts.
socializacao:
  discussao: Quando usar a standard library vs frameworks como Gin ou Chi?
  pontos:
    - Stdlib é suficiente para muitos casos (Go 1.22+ melhorou muito)
    - "Frameworks: middleware chain, validação, binding automático"
    - "Performance: Go já é rápido — framework adiciona conveniência, não velocidade"
  diasDesafio: Dias 19–28
  sugestaoBlog: "Servidores HTTP em Go: net/http, templates e quando usar frameworks"
  hashtagsExtras: '#golang #http #server #webdev'
aplicacao:
  projeto: Servidor de arquivos com upload, download e listagem via HTML templates.
  requisitos:
    - Endpoint de upload (multipart/form-data)
    - Listagem de arquivos com template HTML
    - Download de arquivos
  criterios:
    - Multiplexer correto
    - Templates funcionais
    - Segurança básica
  starterCode: |
    package main

    import (
    	"encoding/json"
    	"fmt"
    	"html/template"
    	"log"
    	"net/http"
    	"sync"
    	"time"
    )

    type Nota struct {
    	ID    int    `json:"id"`
    	Texto string `json:"texto"`
    }

    var (
    	notas  = make(map[int]Nota)
    	nextID = 1
    	mu     sync.Mutex
    )

    func logMiddleware(next http.Handler) http.Handler {
    	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    		start := time.Now()
    		next.ServeHTTP(w, r)
    		log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    	})
    }

    func main() {
    	mux := http.NewServeMux()

    	mux.HandleFunc("GET /api/notas", func(w http.ResponseWriter, r *http.Request) {
    		mu.Lock()
    		var lista []Nota
    		for _, n := range notas {
    			lista = append(lista, n)
    		}
    		mu.Unlock()
    		w.Header().Set("Content-Type", "application/json")
    		json.NewEncoder(w).Encode(lista)
    	})

    	mux.HandleFunc("POST /api/notas", func(w http.ResponseWriter, r *http.Request) {
    		var n Nota
    		if err := json.NewDecoder(r.Body).Decode(&n); err != nil {
    			http.Error(w, "JSON inválido", http.StatusBadRequest)
    			return
    		}
    		mu.Lock()
    		n.ID = nextID
    		nextID++
    		notas[n.ID] = n
    		mu.Unlock()
    		w.Header().Set("Content-Type", "application/json")
    		w.WriteHeader(http.StatusCreated)
    		json.NewEncoder(w).Encode(n)
    	})

    	tmpl := template.Must(template.New("index").Parse(`<!DOCTYPE html>
    <html><body><h1>Notas</h1>
    {{range .}}<p>{{.ID}}: {{.Texto}}</p>{{end}}
    </body></html>`))

    	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
    		mu.Lock()
    		var lista []Nota
    		for _, n := range notas {
    			lista = append(lista, n)
    		}
    		mu.Unlock()
    		tmpl.Execute(w, lista)
    	})

    	fmt.Println("Servidor em :8080")
    	log.Fatal(http.ListenAndServe(":8080", logMiddleware(mux)))
    }

---

## O servidor HTTP mais simples do mundo

Em muitas linguagens, você precisa instalar um framework para criar um servidor web. Em Go, a stdlib já vem com tudo. Olha como é simples:

```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "Olá, mundo!")
    })
    http.ListenAndServe(":8080", nil)
}
```

Rode esse código e abra `http://localhost:8080` no navegador — você vai ver "Olá, mundo!".

### Anatomia desse código

| Parte | O que faz |
|---|---|
| `http.HandleFunc("/", ...)` | "Quando alguém acessar `/`, execute essa função" |
| `w http.ResponseWriter` | É a **caneta** — você escreve nela o que quer enviar de volta |
| `r *http.Request` | É o **envelope** — contém tudo que o cliente enviou (URL, headers, body) |
| `fmt.Fprintln(w, ...)` | Escreve texto na resposta HTTP |
| `http.ListenAndServe(":8080", nil)` | "Fique escutando na porta 8080" — **bloqueia** o programa |

> Pense no servidor como um **restaurante**: `ListenAndServe` abre as portas, `HandleFunc` define o cardápio (quais rotas existem), `w` é o prato onde você coloca a comida, e `r` é o pedido do cliente.

---

## Rotas com método e parâmetros (Go 1.22+)

Antes do Go 1.22, a stdlib não sabia diferenciar GET de POST nem extrair parâmetros da URL. Precisava de frameworks. Agora não precisa mais:

```go
mux := http.NewServeMux()

// GET /api/users/42 → id = "42"
mux.HandleFunc("GET /api/users/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")           // extrai o {id} da URL
    fmt.Fprintf(w, "Usuário: %s", id)
})

// POST /api/users → cria usuário
mux.HandleFunc("POST /api/users", func(w http.ResponseWriter, r *http.Request) {
    // ... ler body JSON, criar usuário
    w.WriteHeader(http.StatusCreated)  // responde 201
})

http.ListenAndServe(":8080", mux)
```

### O que mudou com Go 1.22?

| Antes (Go < 1.22) | Depois (Go 1.22+) |
|---|---|
| `"/api/users"` — aceita GET, POST, PUT, tudo | `"GET /api/users"` — só GET |
| Precisa de framework para path params | `"/users/{id}"` nativo, com `r.PathValue("id")` |
| Rotas ambíguas → bugs difíceis | Rotas com prioridade clara |

### `ServeMux` vs `nil` — qual a diferença?

```go
// Opção 1: usa o mux global (simples, bom pra protótipos)
http.HandleFunc("/", handler)
http.ListenAndServe(":8080", nil)  // nil = usa mux global

// Opção 2: cria seu próprio mux (melhor para apps reais)
mux := http.NewServeMux()
mux.HandleFunc("GET /", handler)
http.ListenAndServe(":8080", mux)  // passa o seu mux
```

Use a Opção 2 em projetos reais — ela evita conflitos quando você tem testes ou múltiplos servidores.

---

## Respondendo com JSON

Na prática, APIs retornam JSON, não texto puro. O padrão em Go:

```go
mux.HandleFunc("GET /api/users/{id}", func(w http.ResponseWriter, r *http.Request) {
    user := map[string]string{
        "id":   r.PathValue("id"),
        "nome": "Ana",
    }

    w.Header().Set("Content-Type", "application/json")  // ⚠️ ANTES de escrever!
    json.NewEncoder(w).Encode(user)
})
```

> **Armadilha:** se você não setar `Content-Type` antes de chamar `Encode`, Go envia como `text/plain`. O navegador/cliente pode não interpretar como JSON.

### Lendo JSON do body (POST/PUT)

```go
mux.HandleFunc("POST /api/users", func(w http.ResponseWriter, r *http.Request) {
    var user User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        http.Error(w, "JSON inválido", http.StatusBadRequest)  // 400
        return
    }
    // user agora tem os dados do cliente
    fmt.Fprintf(w, "Recebi: %s", user.Nome)
})
```

---

## Templates HTML — gerando páginas dinâmicas

Go tem um sistema de templates embutido. Pense neles como **HTML com buracos** que você preenche com dados:

```go
tmpl := template.Must(template.New("page").Parse(`
    <h1>Olá, {{.Nome}}!</h1>
    <p>Você tem {{.Idade}} anos.</p>
`))

mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
    dados := map[string]any{"Nome": "Ana", "Idade": 28}
    tmpl.Execute(w, dados)
})
```

O `{{.Nome}}` é substituído pelo valor do campo `Nome` dos dados. Simples assim.

### `html/template` vs `text/template` — segurança!

| Pacote | O que faz com `<script>alert('xss')</script>` |
|---|---|
| `html/template` | Converte para `&lt;script&gt;...` — **seguro** ✅ |
| `text/template` | Envia do jeito que está — **perigoso para HTML** ❌ |

**Regra:** se vai gerar HTML, use `html/template`. Sempre.

### `template.Must` — o que é?

```go
// Sem Must — você trata o erro
tmpl, err := template.New("x").Parse(`<h1>{{.Nome}}</h1>`)
if err != nil { log.Fatal(err) }

// Com Must — panic se der erro (bom para templates fixos)
tmpl := template.Must(template.New("x").Parse(`<h1>{{.Nome}}</h1>`))
```

Use `Must` para templates que você escreve no código (nunca mudam). Para templates carregados de arquivos em runtime, trate o erro.

---

## Servindo arquivos estáticos (CSS, JS, imagens)

```go
// Tudo em ./public/ fica acessível em /static/
mux.Handle("GET /static/",
    http.StripPrefix("/static/", http.FileServer(http.Dir("./public"))))
```

| URL no navegador | Arquivo servido |
|---|---|
| `/static/style.css` | `./public/style.css` |
| `/static/js/app.js` | `./public/js/app.js` |

`StripPrefix` remove `/static/` da URL antes de procurar o arquivo na pasta `./public/`.

---

## Middleware — funções que "abraçam" o handler

Middleware é uma função que roda **antes e/ou depois** do seu handler. Imagine como uma **cebola**: cada camada de middleware envolve o handler interno.

```
Request → [Log] → [Auth] → [SeuHandler] → Response
```

Um middleware de log que mede quanto tempo cada request leva:

```go
func logMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()           // ⏱️ Marca o início
        next.ServeHTTP(w, r)          // Chama o próximo handler
        log.Printf("%s %s %v",        // 📝 Registra depois
            r.Method, r.URL.Path, time.Since(start))
    })
}

// Usando:
http.ListenAndServe(":8080", logMiddleware(mux))
```

### Como o middleware funciona, passo a passo:

1. Request chega → entra no `logMiddleware`
2. `start := time.Now()` — anota a hora
3. `next.ServeHTTP(w, r)` — passa a bola pro seu handler real
4. Handler responde
5. `log.Printf(...)` — imprime quanto tempo levou

### Encadeando vários middlewares:

```go
// Leitura: auth roda primeiro, depois log, depois o mux
handler := authMiddleware(logMiddleware(mux))
http.ListenAndServe(":8080", handler)
```

---

## Servidor em produção — timeouts são obrigatórios

`http.ListenAndServe` é bom para aprender, mas em produção você precisa de timeouts:

```go
// ❌ Sem timeouts — um cliente lento pode travar o servidor
http.ListenAndServe(":8080", mux)

// ✅ Com timeouts — protege seu servidor
server := &http.Server{
    Addr:         ":8080",
    Handler:      mux,
    ReadTimeout:  10 * time.Second,   // tempo máximo para ler o request
    WriteTimeout: 15 * time.Second,   // tempo máximo para escrever o response
    IdleTimeout:  60 * time.Second,   // tempo máximo de conexão ociosa
}
log.Fatal(server.ListenAndServe())
```

---

## Quando usar frameworks (Gin, Chi, Echo)?

| Preciso de... | Stdlib basta? | Framework ajuda? |
|---|---|---|
| Rotas GET/POST com params | ✅ Sim (Go 1.22+) | — |
| Middleware simples | ✅ Sim | — |
| JSON request/response | ✅ Sim | — |
| Validação automática de body | ❌ Não | ✅ Gin, Echo |
| Binding de query params/headers | ❌ Manual | ✅ Gin, Echo |
| Middleware chain organizado | 🟡 Possível | ✅ Chi, Echo |
| Swagger/OpenAPI automático | ❌ Não | ✅ Swag + Gin |

**Resumo:** a stdlib do Go 1.22+ é surpreendentemente completa. Use frameworks quando precisar de **conveniência extra** (validação, binding, documentação), não por performance — Go já é rápido de fábrica.
