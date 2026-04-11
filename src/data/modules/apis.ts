import { Module } from '../../types';

export const apisModule: Module = {
    id: 'apis',
    title: 'APIs REST',
    description: 'APIs completas: stdlib, Chi, Gin, JWT, middleware e Swagger.',
    icon: 'Globe',
    color: '#7B68EE',
    lessons: [
      {
        id: 'api-crud',
        title: 'API CRUD com Standard Library',
        description: 'REST API completa com net/http, JSON e middleware básico.',
        estimatedMinutes: 40,
        vesa: {
          visaoGeral: {
            explicacao: 'Com Go 1.22+, o ServeMux suporta métodos HTTP e path params nativamente: `GET /users/{id}`. Combine com `json.NewDecoder/Encoder` para I/O JSON, status codes corretos e middleware como funções que wrappam handlers.',
            codeExample: 'package main\n\nimport (\n\t"encoding/json"\n\t"log"\n\t"net/http"\n\t"time"\n)\n\n// Middleware de logging\nfunc logMiddleware(next http.Handler) http.Handler {\n\treturn http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\tstart := time.Now()\n\t\tnext.ServeHTTP(w, r)\n\t\tlog.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))\n\t})\n}\n\nfunc main() {\n\tmux := http.NewServeMux()\n\n\tmux.HandleFunc("GET /api/products", listProducts)\n\tmux.HandleFunc("POST /api/products", createProduct)\n\tmux.HandleFunc("GET /api/products/{id}", getProduct)\n\tmux.HandleFunc("PUT /api/products/{id}", updateProduct)\n\tmux.HandleFunc("DELETE /api/products/{id}", deleteProduct)\n\n\tlog.Fatal(http.ListenAndServe(":8080", logMiddleware(mux)))\n}\n\n// Handlers usam r.PathValue("id"), json.NewDecoder(r.Body), json.NewEncoder(w)',
            recursos: ['https://pkg.go.dev/net/http'],
          },
          experimentacao: {
            desafio: 'Crie uma API CRUD para "livros" com a stdlib: GET (lista e por ID), POST, PUT, DELETE. Use map como banco em memória. Adicione middleware de logging.',
            dicas: [
              'r.PathValue("id") para path params (Go 1.22+)',
              'w.WriteHeader(http.StatusCreated) para POST',
              'json.NewDecoder(r.Body).Decode(&struct) para parse',
            ],
          },
          socializacao: {
            discussao: 'Standard library é suficiente para APIs em produção?',
            pontos: [
              'Go 1.22 melhorou muito — path params e métodos nativos',
              'Middleware é manual mas funcional',
              'Frameworks adicionam conveniência, não performance',
            ],
            diasDesafio: 'Dias 53–60',
            sugestaoBlog: 'REST API em Go com standard library: CRUD completo sem frameworks',
            hashtagsExtras: '#golang #api #rest',
          },
          aplicacao: {
            projeto: 'API CRUD de tarefas (todo) com standard library e testes com httptest.',
            requisitos: ['GET/POST/PUT/DELETE', 'JSON I/O', 'Status codes corretos', 'Testes httptest'],
            criterios: ['RESTful', 'Tratamento de erros', 'Testes cobrindo happy path e erros'],
          },
        },
      },
      {
        id: 'api-frameworks',
        title: 'Frameworks: Chi, Gin e Echo',
        description: 'Middleware chain, subrouters, binding e validação com frameworks populares.',
        estimatedMinutes: 45,
        vesa: {
          visaoGeral: {
            explicacao: 'Chi é idiomático e compatível com net/http. Gin é o mais popular, com binding e validação integradas. Echo oferece API similar ao Express.js. Fiber usa fasthttp para performance extrema. Escolha Chi para projetos que valorizam stdlib; Gin para produtividade; Fiber para throughput máximo.',
            codeExample: '// Chi — idiomático, compatível net/http\nr := chi.NewRouter()\nr.Use(middleware.Logger, middleware.Recoverer)\nr.Route("/api/v1", func(r chi.Router) {\n\tr.Get("/users", listUsers)\n\tr.Post("/users", createUser)\n\tr.Route("/users/{id}", func(r chi.Router) {\n\t\tr.Get("/", getUser)\n\t\tr.Put("/", updateUser)\n\t\tr.Delete("/", deleteUser)\n\t})\n})\n\n// Gin — binding e validação\ntype CreateUserInput struct {\n\tName  string `json:"name" binding:"required"`\n\tEmail string `json:"email" binding:"required,email"`\n}\nfunc createUser(c *gin.Context) {\n\tvar input CreateUserInput\n\tif err := c.ShouldBindJSON(&input); err != nil {\n\t\tc.JSON(400, gin.H{"error": err.Error()})\n\t\treturn\n\t}\n\tc.JSON(201, gin.H{"user": input})\n}',
            recursos: [
              'https://github.com/go-chi/chi',
              'https://github.com/gin-gonic/gin',
              'https://github.com/labstack/echo',
            ],
          },
          experimentacao: {
            desafio: 'Migre a API CRUD da lição anterior para Chi e depois para Gin. Compare: linhas de código, middleware e developer experience.',
            dicas: [
              'Chi: chi.URLParam(r, "id") para path params',
              'Gin: c.Param("id"), c.ShouldBindJSON(&input)',
              'Echo: c.Bind(&input), c.JSON(200, result)',
            ],
          },
          socializacao: {
            discussao: 'Chi vs Gin vs Echo vs Fiber — qual framework escolher?',
            pontos: [
              'Chi: stdlib-compatible, ideal para puristas',
              'Gin: ecosystem grande, popular em empresas',
              'Echo: DX similar ao Express',
              'Fiber: fasthttp, max throughput mas não stdlib-compatible',
            ],
            diasDesafio: 'Dias 53–60',
            sugestaoBlog: 'Chi vs Gin vs Echo: comparando frameworks Go na prática',
            hashtagsExtras: '#golang #chi #gin #echo',
          },
          aplicacao: {
            projeto: 'API RESTful com Chi ou Gin: versionamento, middleware de CORS e rate limiting.',
            requisitos: [
              'Subrouters para /api/v1',
              'Middleware de CORS e rate limiting',
              'Binding e validação de input',
            ],
            criterios: ['Rotas organizadas', 'Middleware funcional', 'Validação robusta'],
          },
        },
      },
      {
        id: 'api-jwt',
        title: 'Autenticação JWT',
        description: 'JWT: geração, validação, middleware de autenticação e refresh tokens.',
        estimatedMinutes: 45,
        vesa: {
          visaoGeral: {
            explicacao: 'JWT (JSON Web Token) é o padrão para autenticação stateless em APIs. Token = header.payload.signature (base64). Em Go, use `golang-jwt` para gerar e validar. Middleware intercepta requests, extrai token do header `Authorization: Bearer <token>` e valida. Refresh tokens permitem renovação sem re-login.',
            codeExample: 'package main\n\nimport (\n\t"time"\n\t"github.com/golang-jwt/jwt/v5"\n)\n\nvar jwtSecret = []byte("chave-secreta-use-env-var")\n\nfunc gerarToken(userID string) (string, error) {\n\tclaims := jwt.MapClaims{\n\t\t"sub": userID,\n\t\t"exp": time.Now().Add(24 * time.Hour).Unix(),\n\t\t"iat": time.Now().Unix(),\n\t}\n\ttoken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)\n\treturn token.SignedString(jwtSecret)\n}\n\nfunc validarToken(tokenStr string) (*jwt.MapClaims, error) {\n\ttoken, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {\n\t\treturn jwtSecret, nil\n\t})\n\tif err != nil {\n\t\treturn nil, err\n\t}\n\tclaims := token.Claims.(jwt.MapClaims)\n\treturn &claims, nil\n}',
            recursos: [
              'https://github.com/golang-jwt/jwt',
              'https://jwt.io/',
            ],
          },
          experimentacao: {
            desafio: 'Crie middleware JWT que proteja rotas: extraia token do header, valide e injete user ID no context da request.',
            dicas: [
              'Header: Authorization: Bearer <token>',
              'strings.TrimPrefix para extrair token',
              'context.WithValue para passar claims adiante',
            ],
          },
          socializacao: {
            discussao: 'JWT vs Sessions: quando usar cada abordagem?',
            pontos: [
              'JWT: stateless, escalável, mas revogação é difícil',
              'Sessions: stateful, fácil revogar, mas precisa de storage',
              'Refresh tokens: balance entre segurança e UX',
            ],
            diasDesafio: 'Dias 53–60',
            sugestaoBlog: 'Autenticação JWT em Go: do login ao middleware com segurança',
            hashtagsExtras: '#golang #jwt #auth #security',
          },
          aplicacao: {
            projeto: 'Sistema de autenticação: register, login, refresh token e rotas protegidas.',
            requisitos: [
              'bcrypt para hash de senha',
              'JWT com expiração',
              'Middleware de autenticação',
              'Refresh token',
            ],
            criterios: ['Senhas hasheadas', 'Tokens com expiração', 'Rotas protegidas funcionais'],
          },
        },
      },
    ],
};
