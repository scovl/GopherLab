---
title: Docker, Cross-compilation e Kubernetes
description: Multistage build, imagens mínimas, cross-comp e Kubernetes manifests.
estimatedMinutes: 55
codeExample: |
  # Dockerfile multistage
  FROM golang:1.23-alpine AS builder
  WORKDIR /app
  COPY go.mod go.sum ./
  RUN go mod download
  COPY . .
  RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/server

  FROM gcr.io/distroless/static-debian12
  COPY --from=builder /app/server /server
  EXPOSE 8080
  ENTRYPOINT ["/server"]

  # Cross-compilation (CGO_ENABLED=0 garante binário estático):
  # CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o server-linux
  # CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o server-mac
recursos:
  - https://docs.docker.com/build/building/multi-stage/
  - https://kubernetes.io/docs/home/
experimentacao:
  desafio: Crie Dockerfile multistage para uma API Go, compare tamanho (golang:alpine vs scratch). Depois, crie manifests K8s com Deployment + Service + Ingress.
  dicas:
    - "-ldflags=\"-s -w\" reduz tamanho do binário (~30%)"
    - "scratch: mínimo absoluto, sem shell nem ferramentas"
    - "distroless: sem shell mas com certificados TLS"
    - Kubernetes liveness e readiness probes no /health
  codeTemplate: |
    package main

    import (
    "encoding/json"
    "fmt"
    "net/http"
    "os"
    "time"
    )

    type HealthResponse struct {
    Status    string `json:"status"`
    Timestamp string `json:"timestamp"`
    }

    func main() {
    mux := http.NewServeMux()

    // GET /health - liveness: servidor está vivo?
    mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(HealthResponse{
    Status:    "ok",
    Timestamp: time.Now().Format(time.RFC3339),
    })
    })

    // GET /ready - readiness: servidor está pronto para tráfego?
    mux.HandleFunc("GET /ready", func(w http.ResponseWriter, r *http.Request) {
    // Em produção: verifique banco conectado, cache pronto, etc.
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(HealthResponse{
    Status:    "ready",
    Timestamp: time.Now().Format(time.RFC3339),
    })
    })

    mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "Hello, Docker!")
    })

    port := os.Getenv("PORT")
    if port == "" {
    port = "8080"
    }
    fmt.Printf("Server em :%s\n", port)
    if err := http.ListenAndServe(":"+port, mux); err != nil {
    fmt.Fprintln(os.Stderr, err)
    os.Exit(1)
    }
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`HandleFunc("GET /health", ...)`** — a sintaxe `"METHOD path"` requer **Go 1.22+** (você já usa isso no módulo de APIs). Em versões anteriores, use `HandleFunc("/health", ...)` e cheque `r.Method`.

    **Liveness vs Readiness** — dois conceitos distintos do Kubernetes:
    - `/health` (liveness): "o container está vivo?" — se falhar, K8s **reinicia** o pod.
    - `/ready` (readiness): "pode receber tráfego?" — se falhar, K8s **retira do load balancer**, mas não reinicia. Use para verificar: banco conectado? cache pronto?

    **Multistage build — dois estágios:**
    1. Stage 1 (`golang:1.23-alpine`): baixa dependências, compila com `CGO_ENABLED=0` — binário 100% estático.
    2. Stage 2 (`distroless`): copia só o binário. Sem Go, sem shell, sem libc. Imagem final < 20MB.

    **`distroless` vs `scratch`:** `distroless/static` inclui TLS certificates e timezone data — essencial para serviços que fazem HTTPS outbound (APIs externas, AWS SDK, etc.). `scratch` é absolutamente vazio — use apenas se tiver certeza de que não precisa de nada.

    **`os.Getenv("PORT")`** — porta configurável via variável de ambiente. Em Kubernetes, o valor vem do `containerPort` no Deployment. Localmente, cai no default `:8080`.
  socializacao:
  discussao: Por que Go é tão popular em cloud-native?
  pontos:
    - Binário estático = imagem Docker tiny
    - Cross-compilation simplifica CI multi-plataforma
    - "Kubernetes, Docker, Terraform, Prometheus – todos escritos em Go"
  diasDesafio: Dias 97–100
  sugestaoBlog: "Deploy Go: Docker multistage, cross-compilation e Kubernetes"
  hashtagsExtras: '#golang #docker #kubernetes #devops'
aplicacao:
  projeto: Deploy completo com Dockerfile otimizado + manifests Kubernetes + health checks.
  requisitos:
    - Dockerfile multistage com scratch/distroless
    - Deployment + Service + Ingress YAML
    - Health check endpoints (/health, /ready)
  criterios:
    - Imagem < 20MB
    - Deploy funcional
    - Health checks operacionais
  starterCode: |
    package main

    // Estrutura do projeto:
    //   cmd/server/main.go  <- este arquivo (crie com mkdir -p cmd/server)
    //   Dockerfile           <- multistage build
    //   k8s/
    //     deployment.yaml    <- Deployment + liveness/readiness probes
    //     service.yaml       <- Service ClusterIP

    import (
    "encoding/json"
    "fmt"
    "net/http"
    "os"
    )

    // TODO: implemente GET /api/items
    //   - retorne lista em JSON, status 200

    // TODO: implemente POST /api/items
    //   - leia JSON do body, retorne item criado, status 201

    // TODO: crie Dockerfile multistage em cmd/server/Dockerfile:
    //   Stage 1: golang:1.23-alpine, CGO_ENABLED=0 go build -ldflags="-s -w"
    //   Stage 2: gcr.io/distroless/static-debian12

    // TODO: crie k8s/deployment.yaml com:
    //   - replicas: 2
    //   - livenessProbe em GET /health
    //   - readinessProbe em GET /ready

    // TODO: crie k8s/service.yaml com:
    //   - kind: Service, type: ClusterIP
    //   - selector: app: server

    func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
    }

    func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /health", healthHandler)
    mux.HandleFunc("GET /ready", healthHandler) // TODO: verificar deps
    // TODO: registre seus handlers aqui

    port := os.Getenv("PORT")
    if port == "" {
    port = "8080"
    }
    fmt.Printf("Server em :%s\n", port)
    if err := http.ListenAndServe(":"+port, mux); err != nil {
    fmt.Fprintln(os.Stderr, err)
    os.Exit(1)
    }
    }
---

> Com código analisado e otimizado nas aulas anteriores, chegou a hora de colocar seu binário em produção.

Go compila em **binário estático** — perfeito para containers. A imagem final pode ser minimalista:

## Multistage build

```dockerfile
# Estágio 1: compilar
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

# Estágio 2: imagem final mínima
FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
```

`CGO_ENABLED=0` garante binário estático puro. Imagem final com `distroless` ou `scratch` fica **< 20MB**.

## Cross-compilation

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o server-linux
CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -ldflags="-s -w" -o server-mac
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o server.exe
```

`CGO_ENABLED=0` garante binário 100% estático (sem dependência de glibc), essencial para rodar em imagens mínimas.

## Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: server
  template:
    metadata:
      labels:
        app: server
    spec:
      containers:
      - name: server
        image: myapp:latest
        ports:
        - containerPort: 8080
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: server
spec:
  selector:
    app: server
  ports:
  - port: 80
    targetPort: 8080
```

## Health checks

Implemente endpoints `/health` (liveness) e `/ready` (readiness):

```go
// requer Go 1.22+ — use HandleFunc("/health", ...) em versões anteriores
mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
})
```
