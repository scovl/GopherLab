---
title: Autenticação JWT
description: "JWT: geração, validação, middleware de autenticação e refresh tokens."
estimatedMinutes: 45
recursos:
  - https://github.com/golang-jwt/jwt
  - https://jwt.io/
  - https://pkg.go.dev/golang.org/x/crypto/bcrypt
experimentacao:
  desafio: "Crie middleware JWT que proteja rotas: extraia token do header, valide e injete user ID no context da request."
  dicas:
    - "Header: Authorization: Bearer <token>"
    - strings.TrimPrefix para extrair token
    - context.WithValue para passar claims adiante
  codeTemplate: |
    package main

    import (
    	"encoding/json"
    	"fmt"
    	"net/http"
    	"strings"
    	"time"

    	"github.com/golang-jwt/jwt/v5"
    )

    var secretKey = []byte("minha-chave-secreta")

    func gerarToken(userID string) (string, error) {
    	claims := jwt.MapClaims{
    		"sub": userID,
    		"exp": time.Now().Add(15 * time.Minute).Unix(),
    		"iat": time.Now().Unix(),
    	}
    	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    	return token.SignedString(secretKey)
    }

    func validarToken(tokenStr string) (*jwt.MapClaims, error) {
    	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
    		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
    			return nil, fmt.Errorf("método inesperado: %v", t.Header["alg"])
    		}
    		return secretKey, nil
    	})
    	if err != nil {
    		return nil, err
    	}
    	claims, ok := token.Claims.(jwt.MapClaims)
    	if !ok || !token.Valid {
    		return nil, fmt.Errorf("token inválido")
    	}
    	return &claims, nil
    }

    func authMiddleware(next http.Handler) http.Handler {
    	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    		auth := r.Header.Get("Authorization")
    		tokenStr := strings.TrimPrefix(auth, "Bearer ")
    		if tokenStr == auth || tokenStr == "" {
    			http.Error(w, `{"error":"token ausente"}`, http.StatusUnauthorized)
    			return
    		}
    		_, err := validarToken(tokenStr)
    		if err != nil {
    			http.Error(w, `{"error":"token inválido"}`, http.StatusUnauthorized)
    			return
    		}
    		next.ServeHTTP(w, r)
    	})
    }

    func main() {
    	mux := http.NewServeMux()
    	mux.HandleFunc("POST /login", func(w http.ResponseWriter, r *http.Request) {
    		token, _ := gerarToken("user1")
    		w.Header().Set("Content-Type", "application/json")
    		json.NewEncoder(w).Encode(map[string]string{"token": token})
    	})
    	mux.Handle("GET /protegido", authMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    		w.Write([]byte(`{"msg":"acesso autorizado"}`))
    	})))
    	fmt.Println("Servidor em :8080")
    	http.ListenAndServe(":8080", mux)
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`jwt.NewWithClaims(jwt.SigningMethodHS256, claims)`** — cria um token com algoritmo HMAC-SHA256. O payload (`claims`) contém `sub` (subject/user ID), `exp` (expiração Unix) e `iat` (issued at). O token é assinado com `token.SignedString(secretKey)`.

    **Validação com callback** — `jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {...})` recebe uma função que retorna a chave de validação. **Sempre verifique o algoritmo** (`t.Method.(*jwt.SigningMethodHMAC)`) antes de retornar a chave — sem isso, um atacante pode forjar tokens com `alg: none`.

    **`strings.TrimPrefix(auth, "Bearer ")`** — extrai o token do header `Authorization`. Se o header não começa com `"Bearer "`, `TrimPrefix` retorna a string original (sem alteração) — usamos isso para detectar formato inválido.

    **Access token curto (15min)** — tokens JWT não podem ser revogados (são stateless). Expiração curta limita a janela de vulnerabilidade. Combine com **refresh token** (7 dias, cookie HttpOnly) para renovação sem re-login.

    **Segurança essencial** — (1) nunca armazene JWT em `localStorage` (XSS); use cookies HttpOnly + SameSite=Strict. (2) Use `bcrypt` para hash de senhas, nunca texto plano. (3) Chave secreta deve vir de variável de ambiente, não hardcoded no código.
socializacao:
  discussao: "JWT vs Sessions: quando usar cada abordagem?"
  pontos:
    - "JWT: stateless, escalável, mas revogação é difícil"
    - "Sessions: stateful, fácil revogar, mas precisa de storage"
    - "Refresh tokens: balance entre segurança e UX"
  diasDesafio: Dias 53–60
  sugestaoBlog: "Autenticação JWT em Go: do login ao middleware com segurança"
  hashtagsExtras: '#golang #jwt #auth #security'
aplicacao:
  projeto: "Sistema de autenticação: register, login, refresh token e rotas protegidas."
  requisitos:
    - bcrypt para hash de senha
    - JWT com expiração
    - Middleware de autenticação
    - Refresh token
  criterios:
    - Senhas hasheadas
    - Tokens com expiração
    - Rotas protegidas funcionais
  starterCode: |
    package main

    import (
    	"encoding/json"
    	"fmt"
    	"net/http"
    	"strings"
    	"time"

    	"github.com/golang-jwt/jwt/v5"
    	"golang.org/x/crypto/bcrypt"
    )

    var jwtSecret = []byte("trocar-por-env-var")

    type Usuario struct {
    	Email string `json:"email"`
    	Senha string `json:"senha,omitempty"`
    	Hash  string `json:"-"`
    }

    var usuarios = map[string]Usuario{}

    func registrar(w http.ResponseWriter, r *http.Request) {
    	var u Usuario
    	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
    		http.Error(w, `{"error":"JSON inválido"}`, http.StatusBadRequest)
    		return
    	}
    	hash, err := bcrypt.GenerateFromPassword([]byte(u.Senha), bcrypt.DefaultCost)
    	if err != nil {
    		http.Error(w, `{"error":"erro interno"}`, http.StatusInternalServerError)
    		return
    	}
    	u.Hash = string(hash)
    	u.Senha = ""
    	usuarios[u.Email] = u
    	w.WriteHeader(http.StatusCreated)
    	json.NewEncoder(w).Encode(map[string]string{"msg": "registrado"})
    }

    func login(w http.ResponseWriter, r *http.Request) {
    	var input Usuario
    	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
    		http.Error(w, `{"error":"JSON inválido"}`, http.StatusBadRequest)
    		return
    	}
    	u, ok := usuarios[input.Email]
    	if !ok || bcrypt.CompareHashAndPassword([]byte(u.Hash), []byte(input.Senha)) != nil {
    		http.Error(w, `{"error":"credenciais inválidas"}`, http.StatusUnauthorized)
    		return
    	}
    	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
    		"sub": u.Email,
    		"exp": time.Now().Add(15 * time.Minute).Unix(),
    	})
    	signed, _ := token.SignedString(jwtSecret)
    	w.Header().Set("Content-Type", "application/json")
    	json.NewEncoder(w).Encode(map[string]string{"token": signed})
    }

    func authMiddleware(next http.Handler) http.Handler {
    	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    		auth := r.Header.Get("Authorization")
    		tokenStr := strings.TrimPrefix(auth, "Bearer ")
    		if tokenStr == auth {
    			http.Error(w, `{"error":"token ausente"}`, http.StatusUnauthorized)
    			return
    		}
    		_, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
    			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
    				return nil, fmt.Errorf("alg inesperado")
    			}
    			return jwtSecret, nil
    		})
    		if err != nil {
    			http.Error(w, `{"error":"token inválido"}`, http.StatusUnauthorized)
    			return
    		}
    		next.ServeHTTP(w, r)
    	})
    }

    // TODO: implemente /refresh com refresh token de longa duração
    // TODO: injete user ID no context via context.WithValue

    func main() {
    	mux := http.NewServeMux()
    	mux.HandleFunc("POST /register", registrar)
    	mux.HandleFunc("POST /login", login)
    	mux.Handle("GET /protegido", authMiddleware(http.HandlerFunc(
    		func(w http.ResponseWriter, r *http.Request) {
    			w.Write([]byte(`{"msg":"bem-vindo!"}`))
    		},
    	)))
    	fmt.Println("Servidor em :8080")
    	http.ListenAndServe(":8080", mux)
    }

---

## O problema: como a API sabe quem você é?

> **Contexto:** esta lição adiciona autenticação sobre uma API REST — o tipo que você construiu nas duas aulas anteriores (stdlib ou com Chi/Gin). Os exemplos usam a stdlib pura por simplicidade, mas o padrão de middleware JWT funciona **igualmente** em Chi (`r.Use(authMiddleware)`) e Gin (`router.Use(ginAuthMiddleware)`). Ao terminar, você vai saber encaixar JWT em qualquer das abordagens.

HTTP é **stateless** — cada request é independente. O servidor não "lembra" quem você é entre uma request e outra.

> **Analogia:** imagine um bar onde o garçom tem amnésia. Toda vez que você pede uma bebida, ele pergunta: "você tem mais de 18 anos?". Toda. Vez.

Solução: quando você faz login, o servidor te dá um **crachá** (token). Nas próximas requests, você mostra o crachá e o servidor sabe quem você é sem perguntar de novo.

```
1. POST /login  {"email":"alice@go.dev", "senha":"123"}
   ← 200 OK {"token": "eyJhbGci..."}     ← servidor gera o "crachá"

2. GET /api/meus-dados
   Authorization: Bearer eyJhbGci...      ← você mostra o crachá
   ← 200 OK {"nome": "Alice"}             ← servidor sabe quem é
```

---

## O que é JWT? — o crachá digital

**JWT** = JSON Web Token. É uma string com 3 partes separadas por ponto:

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMSJ9.assinatura_secreta
|___ HEADER ___|      |_____ PAYLOAD _____|  |__ ASSINATURA __|
```

### As 3 partes explicadas

| Parte | O que contém | Analogia |
|---|---|---|
| **Header** | Algoritmo usado (HS256) | "Tipo de tinta usada no crachá" |
| **Payload** | Dados do usuário (ID, email, expiração) | "Nome e cargo escritos no crachá" |
| **Assinatura** | Prova de autenticidade | "Carimbo oficial da empresa" |

### O Payload (claims) — os dados dentro do token

```json
{
  "sub": "user123",               // subject: ID do usuário
  "exp": 1718000000,              // expires: quando o token morre (Unix timestamp)
  "iat": 1717990000               // issued at: quando foi criado
}
```

> **Importante:** o payload é apenas codificado em **base64**, NÃO é criptografado! Qualquer pessoa pode decodificar e ler os dados. A assinatura garante apenas que **ninguém alterou** os dados — não que são secretos.

```
⚠️ NUNCA coloque no payload: senha, número de cartão, dados sensíveis
✅ Pode colocar: ID do usuário, email, role (admin/user), expiração
```

---

## Como JWT funciona — o fluxo completo

```
Cliente                           Servidor
  │                                  │
  │── POST /login (email+senha) ───→ │
  │                                  │ 1. Verifica email e senha
  │                                  │ 2. Gera token JWT assinado
  │←── 200 {token: "eyJ..."} ──────│
  │                                  │
  │── GET /api/dados ──────────────→ │
  │   Header: Authorization:         │
  │   Bearer eyJ...                  │ 3. Lê o token do header
  │                                  │ 4. Verifica a assinatura
  │                                  │ 5. Verifica se não expirou
  │←── 200 {nome: "Alice"} ────────│ 6. Atende a request
```

---

## Passo 1: Gerando o token (no login)

```go
import (
    "time"
    "github.com/golang-jwt/jwt/v5"
)

var secretKey = []byte("minha-chave-secreta")  // ⚠️ em produção, use variável de ambiente!

func gerarToken(userID string) (string, error) {
    // 1. Define os dados que vão DENTRO do token
    claims := jwt.MapClaims{
        "sub": userID,                                    // quem é o usuário
        "exp": time.Now().Add(15 * time.Minute).Unix(),   // expira em 15 min
        "iat": time.Now().Unix(),                          // quando foi criado
    }

    // 2. Cria o token com algoritmo HS256
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

    // 3. Assina o token com a chave secreta
    signed, err := token.SignedString(secretKey)
    // signed = "eyJhbGci..." (a string que vai para o cliente)

    return signed, err
}
```

### O que é a `secretKey`?

É a **senha do servidor** para assinar tokens. Quem conhece a chave pode gerar tokens válidos.

| Regra | Por quê |
|---|---|
| Nunca hardcode no código | Se alguém ver o código, pode forjar tokens |
| Use variável de ambiente | `os.Getenv("JWT_SECRET")` |
| Mínimo 32 caracteres | Chaves curtas são fáceis de adivinhar |
| Nunca exponha no frontend | A chave fica **só** no servidor |

---

## Passo 2: Validando o token (no middleware)

Quando o cliente manda uma request com `Authorization: Bearer eyJ...`, o servidor precisa:

1. Extrair o token do header
2. Verificar a assinatura (não foi adulterado?)
3. Verificar a expiração (não venceu?)
4. Extrair os dados (quem é o usuário?)

```go
func validarToken(tokenStr string) (*jwt.MapClaims, error) {
    token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
        // ⚠️ SEGURANÇA: verifica se o algoritmo é o esperado
        if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("algoritmo inesperado: %v", t.Header["alg"])
        }
        return secretKey, nil  // retorna a chave para validar a assinatura
    })
    if err != nil {
        return nil, err  // token inválido, expirado ou adulterado
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok || !token.Valid {
        return nil, fmt.Errorf("token inválido")
    }

    return &claims, nil
}
```

### Por que verificar o algoritmo?

Existe um ataque famoso: o atacante muda o header para `"alg": "none"` (sem assinatura). Se o servidor não verificar, aceita o token sem validar!

```go
// ❌ SEM verificação — vulnerável!
jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
    return secretKey, nil  // aceita qualquer algoritmo
})

// ✅ COM verificação — seguro
jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
    if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
        return nil, fmt.Errorf("algoritmo inesperado")  // rejeita!
    }
    return secretKey, nil
})
```

---

## Passo 3: O middleware de autenticação

O middleware é o **porteiro** — fica na frente das rotas protegidas e verifica o crachá:

```go
func authMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 1. Pega o header Authorization
        auth := r.Header.Get("Authorization")
        // Formato esperado: "Bearer eyJhbGci..."

        // 2. Extrai o token (remove "Bearer ")
        tokenStr := strings.TrimPrefix(auth, "Bearer ")
        if tokenStr == auth || tokenStr == "" {
            // Se TrimPrefix não removeu nada → não tinha "Bearer "
            http.Error(w, `{"error":"token ausente"}`, http.StatusUnauthorized)
            return
        }

        // 3. Valida o token
        claims, err := validarToken(tokenStr)
        if err != nil {
            http.Error(w, `{"error":"token inválido"}`, http.StatusUnauthorized)
            return
        }

        // 4. Injeta os dados do usuário no context
        // Usa tipo personalizado como chave para evitar colisões e aviso do go vet
        type ctxKey string
        ctx := context.WithValue(r.Context(), ctxKey("userID"), (*claims)["sub"])
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

### Usando nos handlers protegidos

```go
func meusDados(w http.ResponseWriter, r *http.Request) {
    // Pega o userID que o middleware colocou no context
    // Usa o mesmo tipo de chave definido no middleware
    type ctxKey string
    userID := r.Context().Value(ctxKey("userID")).(string)
    fmt.Fprintf(w, `{"usuario": "%s"}`, userID)
}
```

### Aplicando o middleware nas rotas

```go
mux := http.NewServeMux()

// Rotas públicas — qualquer um acessa
mux.HandleFunc("POST /login", loginHandler)
mux.HandleFunc("POST /register", registerHandler)

// Rotas protegidas — precisa de token!
mux.Handle("GET /api/meus-dados", authMiddleware(http.HandlerFunc(meusDados)))
mux.Handle("GET /api/perfil", authMiddleware(http.HandlerFunc(perfil)))
```

---

## Hash de senhas — NUNCA armazene texto plano!

```go
import "golang.org/x/crypto/bcrypt"

// No registro: hash da senha
hash, err := bcrypt.GenerateFromPassword([]byte("senha123"), bcrypt.DefaultCost)
// hash = "$2a$10$N9qo8uLOickgx2ZMRZoMye..." (irreversível!)

// No login: compara senha com hash
err = bcrypt.CompareHashAndPassword(hash, []byte("senha123"))
if err != nil {
    // senha errada!
}
```

| | Texto plano | bcrypt |
|---|---|---|
| Armazena | `"senha123"` | `"$2a$10$N9qo8u..."` |
| Se hackearem o banco | Todas as senhas expostas | **Inútil** — hash é irreversível |
| Comparação | `senha == stored` | `bcrypt.CompareHashAndPassword` |

> **Regra absoluta:** NUNCA armazene senhas em texto plano. Sempre use `bcrypt` (ou `argon2`).

---

## Refresh Tokens — renovando sem re-login

### O problema do access token curto

Se o access token expira em **15 minutos**, o usuário precisa fazer login de novo a cada 15 min? Não!

### A solução: dois tokens

| Token | Duração | Onde armazenar | Para quê |
|---|---|---|---|
| **Access token** | 15 min | Header `Authorization` | Acessar a API |
| **Refresh token** | 7 dias | Cookie `HttpOnly` | Pedir novo access token |

### O fluxo

```
1. Login → servidor retorna access token (15min) + refresh token (7 dias)

2. Cliente usa access token para requests normais

3. Access token expirou? → Cliente manda refresh token para /refresh
   → Servidor valida refresh token
   → Servidor gera NOVO access token
   → Cliente continua sem fazer login de novo

4. Refresh token expirou? → Agora sim, precisa fazer login de novo
```

```go
// Endpoint de refresh
mux.HandleFunc("POST /refresh", func(w http.ResponseWriter, r *http.Request) {
    // Lê refresh token do cookie (NÃO do header!)
    cookie, err := r.Cookie("refresh_token")
    if err != nil {
        http.Error(w, "sem refresh token", http.StatusUnauthorized)
        return
    }

    // Valida o refresh token
    claims, err := validarToken(cookie.Value)
    if err != nil {
        http.Error(w, "refresh token inválido", http.StatusUnauthorized)
        return
    }

    // Gera novo access token
    userID := (*claims)["sub"].(string)
    novoToken, _ := gerarToken(userID)

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"token": novoToken})
})
```

---

## Segurança — os 5 erros fatais com JWT

| Erro | Consequência | Solução |
|---|---|---|
| Guardar JWT em `localStorage` | XSS rouba o token | Cookie `HttpOnly` + `SameSite=Strict` |
| Não verificar o algoritmo | Atacante forja tokens com `alg: none` | Verificar `t.Method.(*jwt.SigningMethodHMAC)` |
| Senha no payload do JWT | Qualquer um lê (é base64, não criptografia) | Só coloque ID, email, role |
| Chave secreta fraca ou hardcoded | Atacante gera tokens válidos | Variável de ambiente, 32+ chars |
| Senhas em texto plano no banco | Se comprometer o banco, todas as senhas expostas | `bcrypt.GenerateFromPassword` |

---

## JWT vs Sessions — quando usar cada um

| Aspecto | JWT (stateless) | Sessions (stateful) |
|---|---|---|
| Onde guarda o estado | **No token** (cliente carrega) | **No servidor** (Redis, DB) |
| Escala | Fácil (qualquer servidor valida) | Precisa de storage compartilhado |
| Revogar acesso | Difícil (token é autossuficiente) | **Fácil** (deleta a session) |
| Tamanho | Token grande (payload inteiro) | Cookie pequeno (só session ID) |
| Melhor para | APIs, microsserviços, mobile | Apps web tradicionais |

> **Na dúvida:** para APIs REST que atendem mobile e SPA, use **JWT**. Para apps web server-side (com templates), **sessions** pode ser mais simples.

---

## Resumo — o mapa completo da autenticação

```
1. POST /register → bcrypt.GenerateFromPassword → salva hash no banco
2. POST /login    → bcrypt.CompareHashAndPassword → gera JWT → retorna token
3. GET /api/...   → middleware lê "Bearer token" → valida → extrai userID → handler
4. POST /refresh  → lê refresh cookie → gera novo access token
```

| Preciso de... | Use |
|---|---|
| Gerar token JWT | `jwt.NewWithClaims` + `token.SignedString(key)` |
| Validar token JWT | `jwt.Parse` com verificação de algoritmo |
| Proteger rotas | Middleware que extrai e valida o token |
| Hash de senha | `bcrypt.GenerateFromPassword` |
| Verificar senha | `bcrypt.CompareHashAndPassword` |
| Renovar sem re-login | Refresh token em cookie `HttpOnly` |
| Passar userID para o handler | `context.WithValue` no middleware |
