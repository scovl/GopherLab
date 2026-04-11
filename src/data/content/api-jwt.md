---
title: Autenticação JWT
description: "JWT: geração, validação, middleware de autenticação e refresh tokens."
estimatedMinutes: 45
recursos:
  - https://github.com/golang-jwt/jwt
  - https://jwt.io/
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
    	json.NewDecoder(r.Body).Decode(&input)
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

**JWT (JSON Web Token)** é o padrão para autenticação stateless em APIs. Um token JWT tem 3 partes codificadas em base64, separadas por ponto: `header.payload.signature`.

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMSJ9.HMAC_SHA256_assinatura
```

## Gerando e validando JWTs em Go

Use `github.com/golang-jwt/jwt/v5`:

```go
// Gerar token
claims := jwt.MapClaims{
    "sub": userID,
    "exp": time.Now().Add(24 * time.Hour).Unix(),
}
token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
signed, err := token.SignedString([]byte(secretKey))

// Validar token
token, err := jwt.Parse(signed, func(t *jwt.Token) (interface{}, error) {
    if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
        return nil, fmt.Errorf("método inesperado: %v", t.Header["alg"])
    }
    return []byte(secretKey), nil
})
```

## Middleware de autenticação

```go
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        authHeader := r.Header.Get("Authorization")
        // formato: "Bearer <token>"
        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        // valida token, extrai claims, passa no context
        next.ServeHTTP(w, r)
    })
}
```

## Refresh tokens

Refresh tokens permitem renovação sem re-login: emita um **access token** de curta duração (15min) e um **refresh token** de longa duração (7 dias) armazenado em cookie HttpOnly.

> **Segurança:** nunca armazene JWTs em `localStorage` — use cookies HttpOnly + SameSite=Strict para prevenir XSS e CSRF.
