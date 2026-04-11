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

Imagine que você escreveu uma redação e precisa entregar ela perfeita. Você faria **3 coisas**:

1. **Corrigir a formatação** (margens, espaçamento) → isso é o `go fmt`
2. **Passar o corretor ortográfico** (erros de português) → isso é o `go vet`
3. **Pedir para alguém revisar** (problemas que você não vê) → isso é o `golangci-lint`

Go tem ferramentas **oficiais e gratuitas** para cada etapa. Vamos conhecer uma por uma.

---

## 1. `go fmt` — O Formatador Automático

### O problema que resolve

Em outras linguagens, times brigam por estilo: "tabs ou espaços?", "chave na mesma linha?". Em Go, **não existe essa discussão**. Todo código Go do mundo tem o **mesmo estilo**.

### Como funciona

```bash
go fmt ./...
```

Antes do `go fmt`:
```go
package main
import "fmt"
func main(){
x:=42
  fmt.Println(  x  )
}
```

Depois do `go fmt`:
```go
package main

import "fmt"

func main() {
	x := 42
	fmt.Println(x)
}
```

> **Dica:** use `goimports` em vez de `go fmt`. Ele faz tudo que o `go fmt` faz **E ainda organiza seus imports** (remove os que não usa, adiciona os que faltam):
> ```bash
> goimports -w .
> ```

---

## 2. `go vet` — O Detector de Bugs Silenciosos

### Analogia: alarme de fumaça

`go vet` é como um **alarme de fumaça**. Seu código compila e roda, mas tem um bug escondido que pode causar incêndio. O `vet` detecta esses bugs **antes** de dar problema.

### Bugs que ele encontra

| Bug | Exemplo | O que acontece |
|-----|---------|----------------|
| Printf errado | `fmt.Printf("%d", "texto")` | `%d` espera número, recebeu string |
| Mutex copiado | `m2 := m1` (onde m1 é sync.Mutex) | Copia o lock → race condition |
| Struct tag errada | `` `json:nome` `` (falta aspas) | JSON ignora o campo silenciosamente |
| Código inalcançável | `return` antes de outra linha | Linha nunca executa |

### Como usar

```bash
go vet ./...
```

Exemplo de problema detectado:

```go
// ❌ go vet vai reclamar
fmt.Printf("Idade: %d anos\n", "vinte")
//                  ^^              ^^^^^
//                  espera int      recebeu string

// ✅ Correto
fmt.Printf("Idade: %d anos\n", 20)
```

> **Regra de ouro:** `go vet` tem **zero falsos positivos**. Se ele reclamou, **é bug de verdade**. Sempre confie.

---

## 3. `golangci-lint` — O Super Revisor

### Analogia: equipe de revisores

Imagine que em vez de **um** revisor, você tem **100 revisores** lendo seu código ao mesmo tempo. Cada um procura um tipo diferente de problema. Esse é o `golangci-lint`.

### Instalação

```bash
go install github.com/golangci-lint/golangci-lint/cmd/golangci-lint@latest
```

### Como usar

```bash
golangci-lint run
```

### Os revisores mais importantes

| Linter (revisor) | O que procura | Exemplo |
|---|---|---|
| `staticcheck` | Bugs e código morto | Variável usada mas nunca lida |
| `errcheck` | Erros ignorados | `file.Close()` sem checar erro |
| `gosec` | Problemas de segurança | SQL injection, senhas hardcoded |
| `revive` | Estilo e boas práticas | Função exportada sem comentário |
| `gocritic` | Código que pode melhorar | `if err != nil { return err }` redundante |

### Configurando: `.golangci.yml`

Crie esse arquivo na raiz do projeto para escolher quais "revisores" ativar:

```yaml
# .golangci.yml — coloque na raiz do projeto
linters:
  enable:
    - staticcheck    # bugs
    - errcheck       # erros ignorados
    - gosec          # segurança
    - revive         # boas práticas
    - gocritic       # melhorias

linters-settings:
  revive:
    rules:
      - name: exported
```

### Exemplo prático: errcheck em ação

```go
// ❌ errcheck vai reclamar — você ignorou o erro!
file, _ := os.Open("dados.txt")
defer file.Close()

// ✅ Correto — sempre trate o erro
file, err := os.Open("dados.txt")
if err != nil {
    log.Fatal(err)
}
defer file.Close()
```

---

## 4. `govulncheck` — O Detector de Vulnerabilidades

### Analogia: recall de carro

Sabe quando uma montadora faz recall porque descobriu um defeito? O `govulncheck` faz isso com suas **dependências Go**. Ele verifica se algum pacote que você usa tem uma vulnerabilidade conhecida.

### O diferencial

Outras ferramentas olham só o `go.mod` (lista de dependências). O `govulncheck` é mais inteligente — ele verifica **quais funções você realmente chama**. Se a vulnerabilidade está numa função que você não usa, ele avisa mas não alarma.

### Como usar

```bash
# Instalar
go install golang.org/x/vuln/cmd/govulncheck@latest

# Rodar
govulncheck ./...
```

Saída exemplo:
```
Vulnerability #1: GO-2024-1234
    Package: golang.org/x/net
    Found in: golang.org/x/net@v0.10.0
    Fixed in: golang.org/x/net@v0.17.0
    → Seu código CHAMA a função vulnerável!
```

**Solução:** atualize a dependência:
```bash
go get golang.org/x/net@latest
```

---

## 5. `go test -race` — O Detector de Data Races

### Analogia: duas pessoas editando o mesmo documento

Imagine duas pessoas editando a mesma célula de uma planilha ao mesmo tempo, sem saber uma da outra. O resultado? Dados corrompidos. Isso é um **data race**.

```bash
go test -race ./...
```

Exemplo de data race:

```go
// ❌ DATA RACE — duas goroutines escrevem em 'contador'
contador := 0
go func() { contador++ }()
go func() { contador++ }()
// Resultado: pode ser 1 ou 2, nunca se sabe!

// ✅ Sem race — usa sync.Mutex
var mu sync.Mutex
contador := 0
go func() { mu.Lock(); contador++; mu.Unlock() }()
go func() { mu.Lock(); contador++; mu.Unlock() }()
// Resultado: sempre 2
```

> **Atenção:** o flag `-race` deixa o programa mais lento (~2-20x) e usa mais memória (~5-10x). Use **apenas em testes e CI**, nunca em produção.

---

## 6. Escape Analysis — Raio-X de Performance

### Analogia: caixa no balcão vs caixa no depósito

Em Go, variáveis podem ficar na **stack** (balcão — rápido, automático) ou no **heap** (depósito — mais lento, precisa do coletor de lixo). A escape analysis mostra onde cada variável vai.

```bash
go build -gcflags="-m" ./...
```

Saída:
```
./main.go:10:6: x escapes to heap     ← foi pro depósito (mais lento)
./main.go:15:6: y does not escape      ← ficou no balcão (rápido)
```

> **Quando usar:** só quando precisar otimizar performance. No dia a dia, não se preocupe com isso.

---

## Resumo Visual: O Pipeline de Qualidade

```
Seu Código
    │
    ▼
┌─────────────┐
│  go fmt      │  ← Formata automaticamente
└─────┬───────┘
      ▼
┌─────────────┐
│  go vet      │  ← Encontra bugs óbvios
└─────┬───────┘
      ▼
┌─────────────┐
│  golangci-   │  ← 100+ verificações
│  lint        │
└─────┬───────┘
      ▼
┌─────────────┐
│  go test     │  ← Testes + race detector
│  -race       │
└─────┬───────┘
      ▼
┌─────────────┐
│  govulncheck │  ← Vulnerabilidades
└─────┬───────┘
      ▼
  ✅ Código Limpo
```

---

## Conjunto Mínimo para CI (Integração Contínua)

Se você só pode escolher **4 comandos** para rodar automaticamente:

| # | Comando | O que faz | Por que é essencial |
|---|---------|-----------|---------------------|
| 1 | `go vet ./...` | Bugs óbvios | Zero falsos positivos |
| 2 | `go test -race ./...` | Testes + races | Pega bugs de concorrência |
| 3 | `golangci-lint run` | 100+ verificações | Padrão da indústria |
| 4 | `govulncheck ./...` | Vulnerabilidades | Segurança das dependências |

### Makefile pronto para copiar

```makefile
.PHONY: check

check: ## Roda tudo de uma vez
	goimports -w .
	go vet ./...
	golangci-lint run
	go test -race -count=1 ./...
	govulncheck ./...
	@echo "✅ Tudo limpo!"
```

Agora é só rodar:
```bash
make check
```

---

## Erros Comuns de Iniciante

| Erro | Consequência | Solução |
|------|-------------|---------|
| Nunca rodar `go vet` | Bugs silenciosos em produção | Adicione no CI |
| Ignorar `errcheck` | `file.Close()` falha e ninguém sabe | Ative no golangci-lint |
| Não usar `-race` nos testes | Data race aparece só em produção | `go test -race ./...` |
| Formatar manualmente | Revisão de PR vira briga de estilo | `goimports -w .` no save |
| Ignorar `govulncheck` | Deploy com CVE conhecida | Rode antes de cada deploy |

---

## Preciso de... → Use isso

| Preciso de... | Use |
|---|---|
| Formatar código automaticamente | `goimports -w .` |
| Encontrar bugs sem rodar o código | `go vet ./...` |
| Verificação completa de qualidade | `golangci-lint run` |
| Detectar data races | `go test -race ./...` |
| Verificar vulnerabilidades | `govulncheck ./...` |
| Saber o que vai pro heap | `go build -gcflags="-m" ./...` |
| Pipeline de CI completo | Makefile com todos acima |
