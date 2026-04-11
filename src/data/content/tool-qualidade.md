---
title: "Qualidade de Código: vet, lint e segurança"
description: go vet, go fmt, goimports, golangci-lint, staticcheck e govulncheck.
estimatedMinutes: 40
recursos:
  - https://pkg.go.dev/cmd/vet
  - https://golangci-lint.run/
  - https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck
experimentacao:
  desafio: Instale golangci-lint, configure um .golangci.yml e execute em um projeto real. Corrija todos os findings. Execute govulncheck para verificar vulnerabilidades.
  dicas:
    - "golangci-lint: go install github.com/golangci-lint/golangci-lint/cmd/golangci-lint@latest"
    - "govulncheck: go install golang.org/x/vuln/cmd/govulncheck@latest"
    - staticcheck detecta código morto e anti-patterns
  codeTemplate: |
    package main

    import (
    	"fmt"
    	"os/exec"
    	"strings"
    )

    // Makefile de qualidade para projetos Go
    // Este código demonstra o que cada ferramenta faz

    func runCmd(name string, args ...string) (string, error) {
    	out, err := exec.Command(name, args...).CombinedOutput()
    	return strings.TrimSpace(string(out)), err
    }

    func main() {
    	// 1. Formatação — padrão único, zero discussão de estilo
    	fmt.Println("=== gofmt ===")
    	out, _ := runCmd("gofmt", "-l", ".")
    	if out != "" {
    		fmt.Println("Arquivos não formatados:", out)
    	} else {
    		fmt.Println("✓ Tudo formatado")
    	}

    	// 2. go vet — bugs sutis: printf errado, mutex copiado
    	fmt.Println("\n=== go vet ===")
    	out, err := runCmd("go", "vet", "./...")
    	if err != nil {
    		fmt.Println("Problemas:", out)
    	} else {
    		fmt.Println("✓ Sem problemas")
    	}

    	// 3. staticcheck — análise avançada
    	fmt.Println("\n=== staticcheck ===")
    	out, _ = runCmd("staticcheck", "./...")
    	if out != "" {
    		fmt.Println(out)
    	} else {
    		fmt.Println("✓ Código limpo")
    	}

    	// 4. go test com race detector
    	fmt.Println("\n=== testes + race ===")
    	out, err = runCmd("go", "test", "-race", "-count=1", "./...")
    	fmt.Println(out)

    	// 5. govulncheck — vulnerabilidades
    	fmt.Println("\n=== govulncheck ===")
    	out, _ = runCmd("govulncheck", "./...")
    	fmt.Println(out)
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`gofmt`** — formata código com o padrão único do Go. Sem opções de estilo, sem debates. `gofmt -w .` formata in-place. `goimports` faz o mesmo + organiza imports (remove não usados, adiciona faltantes). **Use `goimports` sempre** — ele inclui `gofmt`.

    **`go vet`** — análise estática builtin. Detecta: printf com args errados (`%d` com string), struct tags inválidas, mutex copiado (race condition silenciosa), unreachable code, erros em `//go:build` tags. É rápido e **zero falso positivos** — sempre confie no `vet`.

    **`golangci-lint`** — meta-linter que roda 100+ linters em paralelo. Configure `.golangci.yml` para escolher quais ativar. Linters mais úteis: `staticcheck` (bugs), `errcheck` (errors ignorados), `gosec` (segurança), `revive` (style). **Padrão de mercado** para CI.

    **`go test -race`** — ativa o race detector. Detecta data races em runtime (acesso concorrente sem sincronização). Aumenta uso de memória ~5-10x e CPU ~2-20x — use apenas em CI/dev, não em produção. Rode com `-count=1` para evitar cache.

    **`govulncheck`** — verifica vulnerabilidades **nas funções que seu código efetivamente chama** (não apenas no `go.mod`). Mais preciso que `go list -m all` com banco de vulnerabilidades. Integre no CI para bloquear deploy com CVEs conhecidas.

    **Escape analysis** — `go build -gcflags="-m" ./...` mostra quais variáveis escapam para o heap. Útil para otimizar hot paths — variáveis que escapam geram alocações e pressão no GC.
socializacao:
  discussao: Qual o conjunto mínimo de ferramentas que todo projeto Go deveria ter no CI?
  pontos:
    - "go vet + go test -race: mínimo absoluto"
    - "golangci-lint: padrão de mercado para CI"
    - "govulncheck: segurança de dependências"
  diasDesafio: Dias 91–96
  sugestaoBlog: "Tooling Go: do gofmt ao golangci-lint – qualidade de código automatizada"
  hashtagsExtras: '#golang #tooling #lint #security'
aplicacao:
  projeto: Configure pipeline de qualidade com Makefile + golangci-lint + govulncheck + testes com race detector.
  requisitos:
    - Makefile com targets lint, test, vet
    - .golangci.yml configurado
    - govulncheck no pipeline
  criterios:
    - Zero warnings em vet/lint
    - Zero vulnerabilidades conhecidas
    - Testes sem race
  starterCode: |
    # Makefile para qualidade de código Go
    # Salve como Makefile na raiz do projeto

    .PHONY: all fmt vet lint test vuln build clean

    # Binário de saída
    BINARY := myapp

    # Target padrão
    all: fmt vet lint test build

    # Formatação com goimports
    fmt:
    	@echo "=== Formatação ==="
    	goimports -w .
    	@echo "✓ Formatado"

    # Análise estática builtin
    vet:
    	@echo "=== go vet ==="
    	go vet ./...

    # Linting completo
    lint:
    	@echo "=== golangci-lint ==="
    	golangci-lint run ./...

    # Testes com race detector e cobertura
    test:
    	@echo "=== Testes ==="
    	go test -race -cover -count=1 ./...

    # Verificação de vulnerabilidades
    vuln:
    	@echo "=== govulncheck ==="
    	govulncheck ./...

    # Build para produção
    build:
    	@echo "=== Build ==="
    	CGO_ENABLED=0 go build -ldflags="-s -w" -o $(BINARY) ./cmd/server

    # TODO: adicione target 'ci' que roda fmt + vet + lint + test + vuln
    # TODO: adicione target 'cover-html' que gera relatório de cobertura
    #       go test -coverprofile=cover.out ./...
    #       go tool cover -html=cover.out -o cover.html
    # TODO: adicione target 'bench' que roda benchmarks
    #       go test -bench=. -benchmem -count=5 ./...
    # TODO: crie .golangci.yml com linters:
    #       staticcheck, errcheck, gosec, revive, gocritic

    clean:
    	rm -f $(BINARY) cover.out cover.html

---

`go fmt` formata código com o **padrão único do Go** — sem discussão sobre estilo. `go vet` detecta bugs sutis: printf errado, unreachable code, struct tags inválidos, mutex copiado.

## Ferramentas essenciais

```bash
gofmt -w .          # formatação
goimports -w .      # formatação + gerencia imports
go vet ./...        # análise estática básica
golangci-lint run   # 100+ linters em paralelo
govulncheck ./...   # vulnerabilidades em dependências
```

## golangci-lint

Executa 100+ linters em paralelo (staticcheck, revive, gosec, errcheck, etc.). Configure via `.golangci.yml`:

```yaml
linters:
  enable:
    - staticcheck
    - errcheck
    - gosec
    - revive
linters-settings:
  revive:
    rules:
      - name: exported
```

## govulncheck

Verifica vulnerabilidades **conhecidas nas dependências** usadas pelo seu código (não apenas no `go.mod`):

```bash
go install golang.org/x/vuln/cmd/govulncheck@latest
govulncheck ./...
```

## Escape analysis

```bash
go build -gcflags="-m" ./...
```

Mostra quais variáveis **escapam** para o heap — útil para otimização de alocações.

## Conjunto mínimo para CI

1. `go vet ./...` — mínimo absoluto
2. `go test -race ./...` — detecta data races
3. `golangci-lint run` — padrão de mercado
4. `govulncheck ./...` — segurança de dependências
