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

Go tem servidor HTTP robusto na stdlib. A partir do **Go 1.22**, o `ServeMux` suporta métodos HTTP e path params nativamente:

```go
mux := http.NewServeMux()
mux.HandleFunc("GET /api/users/{id}", func(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    json.NewEncoder(w).Encode(map[string]string{"id": id})
})
http.ListenAndServe(":8080", mux)
```

## Templates HTML

`html/template` renderiza HTML **seguro** — escape automático contra XSS. `text/template` é para texto puro sem preocupação com HTML. `template.Must` panics se o template tiver erros de parse — use para templates estáticos em init.

## Arquivos estáticos

```go
mux.Handle("GET /static/",
    http.StripPrefix("/static/", http.FileServer(http.Dir("./public"))))
```

## Middleware

Funções que wrappam `http.Handler`:

```go
func logMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}
```

## Quando usar frameworks

A stdlib (Go 1.22+) é suficiente para muitos casos. Frameworks como Chi, Gin e Echo adicionam **conveniência** (middleware chain, binding automático, validação) — não performance.
