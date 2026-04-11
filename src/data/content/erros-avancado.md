---
title: Multi-erros e Erros Estruturados
description: errors.Join, go-multierror, eris e estratégias de produção.
estimatedMinutes: 40
recursos:
  - https://pkg.go.dev/errors#Join
  - https://github.com/uber-go/multierr
  - https://github.com/rotisserie/eris
experimentacao:
  desafio: Implemente um importador de CSV que processa todas as linhas e coleta todos os erros de validação (com número da linha) sem abortar na primeira falha.
  dicas:
    - errors.Join agrupa erros – nil se slice vazio
    - Inclua número da linha no contexto do erro
    - Para output JSON dos erros, crie struct ErrorReport
  codeTemplate: |
    package main

    import (
    	"errors"
    	"fmt"
    	"strconv"
    	"strings"
    )

    type LinhaErro struct {
    	Linha int
    	Erro  error
    }

    func (e *LinhaErro) Error() string {
    	return fmt.Sprintf("linha %d: %v", e.Linha, e.Erro)
    }

    func (e *LinhaErro) Unwrap() error { return e.Erro }

    func validarNumero(s string) error {
    	_, err := strconv.Atoi(strings.TrimSpace(s))
    	if err != nil {
    		return fmt.Errorf("número inválido %q: %w", s, err)
    	}
    	return nil
    }

    func processarCSV(dados string) error {
    	linhas := strings.Split(dados, "\n")
    	var erros []error

    	for i, linha := range linhas {
    		if linha == "" {
    			continue
    		}
    		if err := validarNumero(linha); err != nil {
    			erros = append(erros, &LinhaErro{Linha: i + 1, Erro: err})
    		}
    	}

    	return errors.Join(erros...) // nil se slice vazio
    }

    func main() {
    	dados := "42\nabc\n7\n\nxyz\n99"
    	if err := processarCSV(dados); err != nil {
    		fmt.Println("Erros encontrados:")
    		fmt.Println(err)

    		// errors.Is/As percorrem todos os erros joinados
    		var le *LinhaErro
    		if errors.As(err, &le) {
    			fmt.Printf("\nPrimeiro erro: linha %d\n", le.Linha)
    		}
    	}
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`errors.Join(erros...)`** — combina múltiplos erros em um só. Retorna `nil` se todos os elementos forem `nil` ou o slice estiver vazio. O erro resultante implementa `Unwrap() []error` (Go 1.20+), e `errors.Is/As` percorrem **todos** os erros da árvore.

    **Padrão "coletar todos"** — em batch processing (CSV, importação, validação), continue processando todas as linhas em vez de abortar na primeira falha. Colete os erros em `[]error` e retorne `errors.Join(erros...)` no final. O chamador decide se quer iterar sobre os erros individuais.

    **`Unwrap() error` vs `Unwrap() []error`** — erros single-wrapped implementam `Unwrap() error`; erros joinados implementam `Unwrap() []error`. `errors.Is/As` reconhecem ambos automaticamente desde Go 1.20.

    **`panic` vs `error`** — use `error` para falhas esperadas (arquivo não encontrado, rede, input inválido). Reserve `panic` para **invariantes violados** (bugs no código: index fora do range, nil pointer). `panic` termina o programa se não for recuperado com `recover`.

    **`recover()` só funciona em `defer`** — `recover()` chamado diretamente (fora de `defer`) sempre retorna `nil`. O padrão: `defer func() { if r := recover(); r != nil { log.Println(r) } }()`. Em servidores HTTP, cada handler deve ter recover para não derrubar o processo.

    **Go 1.21: `panic(nil)`** — agora é equivalente a `panic(new(runtime.PanicNilError))`. Código que testava `recover() != nil` para detectar panic continua funcionando, mas `recover()` agora retorna `*runtime.PanicNilError` em vez de `nil`.
socializacao:
  discussao: Quando usar stack traces em erros? Há custo de performance?
  pontos:
    - Stack traces úteis em dev, caros em prod
    - Logging estruturado (slog/zap) como alternativa
    - OpenTelemetry para rastreamento distribuído
  diasDesafio: Dias 39–44
  sugestaoBlog: "Multi-erros em Go: errors.Join e estratégias para batch processing"
  hashtagsExtras: '#golang #errors #observability'
aplicacao:
  projeto: Validador de JSON array que processa todos os itens e retorna relatório completo de erros.
  requisitos:
    - Processar todos itens mesmo com erros
    - "Erros com contexto: índice + campo + mensagem"
    - Output para humanos (texto) e máquinas (JSON)
  criterios:
    - Nenhum erro perdido
    - Relatório claro
    - Testes com inputs variados
  starterCode: |
    package main

    import (
    	"encoding/json"
    	"errors"
    	"fmt"
    	"strings"
    )

    type CampoErro struct {
    	Indice int    `json:"indice"`
    	Campo  string `json:"campo"`
    	Erro   string `json:"erro"`
    }

    func (e *CampoErro) Error() string {
    	return fmt.Sprintf("[%d] %s: %s", e.Indice, e.Campo, e.Erro)
    }

    type Relatorio struct {
    	Total    int          `json:"total"`
    	Validos  int          `json:"validos"`
    	Erros    []CampoErro  `json:"erros"`
    }

    type Pessoa struct {
    	Nome  string `json:"nome"`
    	Email string `json:"email"`
    	Idade int    `json:"idade"`
    }

    // TODO: implemente validarPessoa(idx int, p Pessoa) []error
    //   - Nome não pode ser vazio
    //   - Email deve conter "@"
    //   - Idade deve ser entre 0 e 150
    //   - Retorne slice de *CampoErro para cada violação

    // TODO: implemente processarLote(jsonArray string) (*Relatorio, error)
    //   - Deserialize o JSON array em []Pessoa
    //   - Valide cada pessoa, coletando todos os erros
    //   - Retorne Relatorio com contagens
    //   - Use errors.Join para combinar erros

    // TODO: implemente relatorio.JSON() (string, error)
    //   - Serialize Relatorio como JSON indentado

    func main() {
    	input := `[
    	  {"nome": "Alice", "email": "alice@go.dev", "idade": 30},
    	  {"nome": "", "email": "sem-arroba", "idade": -5},
    	  {"nome": "Bob", "email": "bob@go.dev", "idade": 200}
    	]`
    	_ = input
    	_ = errors.Join
    	_ = json.Marshal
    	_ = strings.Contains
    	fmt.Println("Implemente processarLote e gere relatório JSON")
    }

---

## errors.Join (Go 1.20+)

Em operações batch e paralelas, a boa prática é não abortar no primeiro erro — processe tudo e reporte todos os erros no final.

```go
errs := []error{}
for _, item := range items {
    if err := process(item); err != nil {
        errs = append(errs, err)
    }
}
return errors.Join(errs...)  // retorna nil se todos os itens forem nil
```

`errors.Is` e `errors.As` atravessam a árvore de erros joinados.

## panic e recover

`panic(v)` para a execução normal e começa a desenrolar a call stack, executando funções deferridas em ordem LIFO. Se não for recuperado, o runtime imprime a stack trace e termina o programa. Apenas a goroutine que panicou é afetada no unwind — mas se chegar ao topo sem `recover`, **o programa todo termina**.

`recover()` captura o valor passado ao `panic` — mas **apenas se chamado diretamente dentro de uma função deferrida**. Fora de `defer`, `recover()` retorna `nil`.

O padrão idiomático em servidores HTTP: cada handler executa com um `recover` para evitar que um panic em um request derrube o servidor inteiro.

> **Go 1.21:** `panic(nil)` é equivalente a `panic(new(runtime.PanicNilError))` — código que checa `recover() != nil` precisa também tratar `*runtime.PanicNilError`.

## Erros em produção

- `github.com/rotisserie/eris` — wrapping com stack trace
- `go.uber.org/multierr` — multiple errors
- `log/slog` (stdlib Go 1.21+) — logging estruturado nativo

Use erros padrão para lógica de negócio; reserve `panic` para **invariantes violados** (bugs no código do programador, não erros de input).
