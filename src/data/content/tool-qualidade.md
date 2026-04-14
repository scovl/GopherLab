---
title: "Qualidade de Código: vet, lint e segurança"
description: go vet, go fmt, goimports, golangci-lint, staticcheck e govulncheck.
estimatedMinutes: 40
recursos:
  - https://pkg.go.dev/cmd/vet
  - https://golangci-lint.run/
  - https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck
experimentacao:
  desafio: O código abaixo está pré-carregado no terminal em ~/workspace/tool-qualidade. Execute golangci-lint run ./... e leia o log — quantos problemas foram encontrados? Qual linter detectou cada um?
  dicas:
    - "Boa notícia: golangci-lint e staticcheck já estão instalados neste terminal — não precisa instalar nada!"
    - "Passo 1 → cd ~/workspace/tool-qualidade"
    - "Passo 2 → golangci-lint run ./...   (atenção: o subcomando é 'run', não esqueça!)"
    - "Leia o log com atenção: cada linha mostra arquivo:linha:coluna, o nome do linter entre parênteses e a descrição do problema"
    - "Exemplo de saída: main.go:12:5: S1039: unnecessary use of fmt.Sprintf (staticcheck) — significa: linha 12, problema detectado pelo staticcheck"
    - "govulncheck precisa de internet para buscar o banco de CVEs — não funciona neste terminal isolado. Em projetos reais, rode no seu computador ou no CI."
  codeTemplate: |
    package main

    import (
    	"fmt"
    	"strings"
    )

    // palavras conta as ocorrências de cada palavra numa frase
    func palavras(s string) map[string]int {
    	m := make(map[string]int)
    	for _, w := range strings.Fields(s) {
    		m[strings.ToLower(w)]++
    	}
    	return m
    }

    // soma retorna a soma de uma slice de inteiros
    func soma(nums []int) int {
    	var total int
    	for _, n := range nums {
    		total = total + n // será que há uma forma mais idiomática?
    	}
    	return total
    }

    // duplicatas retorna o dobro de x se positivo
    func duplicatas(x int) int {
    	if x > 0 {
    		return x * 2
    	} else { // esse else é necessário aqui?
    		return 0
    	}
    }

    func main() {
    	fmt.Println(palavras("go é incrível go é rápido"))
    	fmt.Println(soma([]int{1, 2, 3, 4, 5}))
    	fmt.Println(duplicatas(10))
    }
  notaPos: |
    #### O que o golangci-lint encontrou nesse código?

    O código compila e roda sem erros — mas o golangci-lint encontra dois problemas:

    **Problema 1 — `gocritic`:**
    ```
    main.go:21:3: assignment can be simplified to `total += n` (gocritic)
    ```
    `total = total + n` pode ser `total += n`. Não é bug — é estilo não idiomático. Em Go, o padrão é usar os operadores compostos (`+=`, `-=`, etc.).

    **Problema 2 — `staticcheck`:**
    ```
    main.go:29:2: this if-else branch is unnecessary (staticcheck)
    ```
    O `else { return 0 }` é desnecessário: como o `if` já tem `return`, o `else` nunca muda o comportamento — só adiciona ruído visual.

    **Como ler o log:**
    ```
    main.go:21:3: assignment can be simplified (gocritic)
    ^^^^^^^  ^^  ^                              ^^^^^^^^^^
    arquivo  linha:coluna  mensagem              linter responsável
    ```
    Cada linha diz **onde** está o problema, **o que** é, e **qual linter** detectou.

    **Conclusão:** código que funciona e código idiomático são coisas diferentes. O golangci-lint encontra a diferença antes que o revisor de PR encontre.
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
  projeto: O projeto ~/workspace/tool-qualidade já existe com código real, bugs intencionais e um .golangci.yml configurado. Execute o pipeline de qualidade completo rodando cada ferramenta diretamente no terminal.
  requisitos:
    - Rodar go vet ./... e confirmar que passa sem erros
    - Rodar golangci-lint run ./... e identificar todos os findings
    - Rodar go test -race -count=1 ./... e confirmar PASS
    - Ler o .golangci.yml e entender quais linters estão ativos
  criterios:
    - go vet passa sem erros
    - golangci-lint mostra os 2 warnings esperados (o código tem bugs intencionais)
    - go test passa com PASS
    - Consegue explicar o que cada linter encontrou e por quê
  starterCode: |
    # Pipeline de qualidade — rode cada comando no terminal
    # cd ~/workspace/tool-qualidade

    # 1. Veja o código com os problemas
    cat main.go

    # 2. Veja a configuração dos linters
    cat .golangci.yml

    # 3. Análise estática builtin (bugs reais, zero falsos positivos)
    go vet ./...

    # 4. Linting completo (estilo + idiomas)
    golangci-lint run ./...

    # 5. Testes com race detector
    go test -race -count=1 ./...

    # 6. Liste todos os linters disponíveis nesta versão
    golangci-lint linters

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
> Instalação: `go install golang.org/x/tools/cmd/goimports@latest`

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
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
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
// ❌ Dois problemas: (1) errcheck reclama; (2) se o arquivo não existir,
//    file é nil e defer file.Close() causa PANIC em runtime
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

## 6. Próximos Passos: Performance

Você agora tem código correto e seguro. O próximo passo é **medir e otimizar** desempenho — `go test -bench`, `pprof` e escape analysis (`go build -gcflags="-m"`). Isso é tema da próxima aula: **Profiling, Runtime e Otimização**.

---

## Resumo Visual: O Pipeline de Qualidade

```mermaid
flowchart TD
  src(["📝 Seu Código"])
  fmt(["🎨 go fmt\nFormata automaticamente"])
  vet(["🔎 go vet\nEncontra bugs óbvios"])
  lint(["🧑‍⚖️ golangci-lint\n100+ verificações"])
  test(["🧪 go test -race\nTestes + race detector"])
  vuln(["🔒 govulncheck\nVulnerabilidades"])
  ok(["✅ Código Limpo"])

  src --> fmt --> vet --> lint --> test --> vuln --> ok

  style src  fill:#e0f7ff,stroke:#0090b8,color:#0c4a6e
  style fmt  fill:#fef9c3,stroke:#ca8a04,color:#713f12
  style vet  fill:#fef9c3,stroke:#ca8a04,color:#713f12
  style lint fill:#fce7f3,stroke:#db2777,color:#831843
  style test fill:#fce7f3,stroke:#db2777,color:#831843
  style vuln fill:#fff1f2,stroke:#fca5a5,color:#7f1d1d
  style ok   fill:#dcfce7,stroke:#16a34a,color:#14532d
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
| Pipeline de CI completo | Makefile com todos acima |
