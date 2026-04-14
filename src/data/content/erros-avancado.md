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

## O problema: e quando dá VÁRIOS erros de uma vez?

Na aula anterior, vimos como tratar erros individuais — cada operação retorna um `error` e você decide o que fazer. Também vimos como embrulhar dois erros fixos inline com `fmt.Errorf("%w e %w", err1, err2)`. Mas e se você precisa processar **100 linhas de um CSV** e 5 delas têm erro?

```go
// ❌ Abordagem ingênua: para no primeiro erro
for _, linha := range linhas {
    if err := processar(linha); err != nil {
        return err  // Parou na linha 3... e as outras 97?
    }
}
```

O chefe quer saber **TODOS** os problemas, não só o primeiro. Imagine entregar um relatório que diz "tem erro na linha 3" — o chefe corrige, roda de novo, e descobre "tem erro na linha 7". E de novo, e de novo...

> **Analogia:** é como um professor que corrige uma prova e **para na primeira questão errada**. O aluno prefere saber TODAS as questões erradas de uma vez!

---

## `errors.Join` — juntando vários erros num só (Go 1.20+)

A solução é **coletar** todos os erros e juntar no final:

```go
func processarLote(linhas []string) error {
    var erros []error  // sacola de erros

    for _, linha := range linhas {
        if err := processar(linha); err != nil {
            erros = append(erros, err)  // joga na sacola
            // NÃO faz return! continua processando
        }
    }

    return errors.Join(erros...)  // junta tudo num erro só
    // Se a sacola estiver vazia → retorna nil (sem erro!)
}
```

### O que `errors.Join` retorna?

| Situação | Retorno |
|---|---|
| Sacola vazia (nenhum erro) | `nil` |
| 1 erro na sacola | Erro com 1 mensagem |
| 3 erros na sacola | Erro com as 3 mensagens separadas por `\n` |

```go
err := errors.Join(
    errors.New("linha 3: campo vazio"),
    errors.New("linha 7: número inválido"),
    errors.New("linha 15: email sem @"),
)
fmt.Println(err)
// linha 3: campo vazio
// linha 7: número inválido
// linha 15: email sem @
```

### `errors.Is` e `errors.As` funcionam com Join!

```go
var ErrCampoVazio = errors.New("campo vazio")

erros := errors.Join(
    fmt.Errorf("linha 3: %w", ErrCampoVazio),
    errors.New("linha 7: número inválido"),
)

// Procura dentro de TODOS os erros joinados
errors.Is(erros, ErrCampoVazio)  // true ✅
```

> **Internamente:** `errors.Join` cria um erro que implementa `Unwrap() []error` (retorna um **slice**, não um único erro). O `errors.Is`/`errors.As` sabe percorrer esse slice automaticamente.

---

## Exemplo real: validador de CSV

```go
type LinhaErro struct {
    Linha int
    Erro  error
}

func (e *LinhaErro) Error() string {
    return fmt.Sprintf("linha %d: %v", e.Linha, e.Erro)
}

func (e *LinhaErro) Unwrap() error { return e.Erro }

func processarCSV(dados string) error {
    linhas := strings.Split(dados, "\n")
    var erros []error

    for i, linha := range linhas {
        if err := validar(linha); err != nil {
            // Embrulha com número da linha
            erros = append(erros, &LinhaErro{Linha: i + 1, Erro: err})
        }
    }

    return errors.Join(erros...)
}

// Quem chamou pode extrair detalhes:
err := processarCSV(dados)
var le *LinhaErro
if errors.As(err, &le) {
    fmt.Printf("Primeiro erro: linha %d\n", le.Linha)
}
```

---

## `panic` e `recover` — o botão de emergência

### Primeiro: `error` vs `panic`

| | `error` (normal) | `panic` (emergência) |
|---|---|---|
| Quando usar | Coisas que **podem** dar errado | Coisas que **nunca deveriam** acontecer |
| Exemplos | Arquivo não existe, rede caiu, input inválido | Índice fora do array, nil pointer, bug no código |
| O que acontece | Retorna erro, programa continua | **Para tudo** e crasha |
| É esperado? | Sim — faz parte do fluxo | Não — é sinal de **bug** |

> **Analogia:** `error` é como o **farol amarelo** — "atenção, algo deu errado, trate com cuidado". `panic` é como o **alarme de incêndio** — "EVACUAR! Algo está muito errado!".

### Como `panic` funciona — passo a passo

```go
func main() {
    fmt.Println("1 - antes")
    panic("BOOM!")              // 💥 para aqui
    fmt.Println("2 - depois")   // ❌ nunca executa
}
// Saída:
// 1 - antes
// panic: BOOM!
// goroutine 1 [running]:
// main.main()
//     main.go:5 +0x...
```

O que acontece internamente:

```
1. panic("BOOM!") é chamado
2. A função atual PARA imediatamente
3. Todas as funções defer da função atual EXECUTAM
4. Volta para quem chamou — repete os passos 2-3
5. Continua subindo a call stack...
6. Se ninguém faz recover → PROGRAMA MORRE com stack trace
```

### `defer` ainda roda durante panic!

> Lembre-se: `defer` (visto em Fundamentos — Funções) agenda a execução de uma função para quando a função atual retornar — e isso inclui saídas abruptas via `panic`.

```go
func main() {
    defer fmt.Println("3 - defer executa!")  // ✅ roda mesmo com panic
    fmt.Println("1 - antes")
    panic("BOOM!")
    fmt.Println("2 - depois")  // ❌ nunca executa
}
// 1 - antes
// 3 - defer executa!
// panic: BOOM!
```

Isso é **crucial** para a próxima parte...

---

## `recover` — pegando o alarme de incêndio

`recover()` é a única forma de **impedir** que um `panic` mate o programa:

```go
func funcaoPerigosa() {
    panic("BOOM!")
}

func funcaoSegura() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Peguei o panic:", r)
        }
    }()

    funcaoPerigosa()  // panics, mas recover pega
    fmt.Println("depois do panic")  // ❌ não executa
}

func main() {
    funcaoSegura()
    fmt.Println("programa continua!")  // ✅ executa normalmente
}
// Peguei o panic: BOOM!
// programa continua!
```

### As 3 regras do `recover`

| Regra | Detalhe |
|---|---|
| Só funciona dentro de `defer` | Fora de `defer`, sempre retorna `nil` |
| Só pega panic da **mesma goroutine** | Não pega panic de outra goroutine |
| A função que panicou **não continua** | Código após o panic naquela função é perdido |

```go
// ❌ NÃO funciona — recover fora de defer
func errado() {
    r := recover()  // sempre nil — inútil!
    funcaoPerigosa()
}

// ✅ Funciona — recover dentro de defer
func correto() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("peguei:", r)
        }
    }()
    funcaoPerigosa()
}
```

---

## Uso real: protegendo código que pode panic

O padrão mais comum é envolver chamadas arriscadas num `safeCall`:

```go
func safeCall(fn func()) (panickMsg string, ocorreuPanic bool) {
    defer func() {
        if r := recover(); r != nil {
            panickMsg = fmt.Sprintf("%v", r)
            ocorreuPanic = true
        }
    }()
    fn()
    return "", false
}

func main() {
    msg, ok := safeCall(func() {
        var s []int
        _ = s[0]  // index fora do range → panic
    })
    if ok {
        fmt.Println("Capturado:", msg)
        // Capturado: runtime error: index out of range [0] with length 0
    }
}
```

> **Em servidores HTTP**, cada handler usa exatamente esse padrão como middleware — se um handler explodir (panic), o paraquedas (recover) garante que o servidor continue vivo para outros requests. Isso será visto na aula de `net/http` do módulo Biblioteca Padrão.

---

## Quando usar `panic` vs `error` — regra simples

```
Pergunta: "isso é culpa do USUÁRIO ou do PROGRAMADOR?"

→ Culpa do usuário (input ruim, rede caiu, arquivo não existe):
   return error  ✅

→ Culpa do programador (bug, invariante violada, impossível acontecer):
   panic()  ✅ (mas é raro!)
```

| Situação | Use |
|---|---|
| Arquivo não encontrado | `return err` |
| JSON inválido do cliente | `return err` |
| Index fora do array (bug!) | `panic` (Go faz automaticamente) |
| nil pointer (bug!) | `panic` (Go faz automaticamente) |
| Template HTML não parseia na inicialização | `template.Must(...)` → panic |
| Regex inválida na inicialização | `regexp.MustCompile(...)` → panic |

> Os `Must...` da stdlib fazem `panic` porque são chamados na **inicialização** — se o template/regex está errado, é bug do programador, e o programa nem deveria iniciar.

---

## Go 1.21: `panic(nil)` mudou!

Antes do Go 1.21:
```go
defer func() {
    r := recover()
    if r != nil {
        // panic(nil) NÃO entrava aqui! r era nil.
    }
}()
panic(nil)  // recover() retornava nil → parecia que não houve panic
```

Depois do Go 1.21:
```go
panic(nil)  // agora é equivalente a panic(new(runtime.PanicNilError))
// recover() retorna *runtime.PanicNilError → r != nil é true ✅
```

Na prática, isso raramente afeta seu código. Mas é bom saber.

---

## Bibliotecas para erros em produção

| Biblioteca | O que faz | Quando usar |
|---|---|---|
| `errors` (stdlib) | Join, Is, As, wrapping | **Sempre** — comece aqui |
| `log/slog` (stdlib 1.21+) | Logging estruturado | Logar erros com contexto (JSON, nível) |
| `github.com/rotisserie/eris` | Erros com **stack trace** | Quando precisa saber exatamente onde o erro nasceu |
| `go.uber.org/multierr` | Multi-erros (pré-Go 1.20) | Projetos que ainda não usam Go 1.20+ |

> **Dica:** comece com a stdlib (`errors` + `fmt.Errorf` + `errors.Join`). Só adicione bibliotecas externas quando **sentir falta** de algo específico.

---

## Resumo — o que usar em cada situação

| Preciso de... | Use |
|---|---|
| Juntar vários erros em um | `errors.Join(erros...)` |
| Processar batch sem parar no primeiro erro | Colete em `[]error`, depois `errors.Join` |
| Proteger servidor de panic | `defer func() { recover() }()` no middleware |
| Sinalizar bug impossível | `panic("impossível: ...")` (raro!) |
| Tratar erro esperado | `return error` (o jeito normal) |
| Forçar panic na inicialização | `template.Must(...)`, `regexp.MustCompile(...)` |
