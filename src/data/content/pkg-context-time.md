---
title: Context, Time e Regexp
description: context para cancelamento/timeout, time para datas e regexp para padrões.
estimatedMinutes: 45
recursos:
  - https://pkg.go.dev/context
  - https://gobyexample.com/context
  - https://gobyexample.com/time
  - https://pkg.go.dev/regexp
experimentacao:
  desafio: Crie um HTTP client com timeout de 3s usando context. Depois, crie um validador de email/telefone usando regexp.MustCompile.
  dicas:
    - http.NewRequestWithContext(ctx, ...) passa context para request
    - Sempre defer cancel() após criar context com timeout
    - Go usa layout "2006-01-02 15:04:05" para formatar datas (referência fixa)
  codeTemplate: |
    package main

    import (
    	"context"
    	"fmt"
    	"regexp"
    	"time"
    )

    func operacaoLenta(ctx context.Context) error {
    	select {
    	case <-time.After(5 * time.Second):
    		return nil
    	case <-ctx.Done():
    		return ctx.Err()
    	}
    }

    func main() {
    	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    	defer cancel()
    	if err := operacaoLenta(ctx); err != nil {
    		fmt.Println("Timeout:", err)
    	}
    	agora := time.Now()
    	fmt.Println(agora.Format("2006-01-02 15:04:05"))
    	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
    	fmt.Println(re.MatchString("user@go.dev"))
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`context.WithTimeout`** — cria um contexto derivado que cancela automaticamente após 2 segundos. Retorna `ctx` (novo contexto) e `cancel` (função para cancelar manualmente). **Sempre `defer cancel()`** para liberar recursos, mesmo se o timeout expirar antes.

    **`select` com `ctx.Done()`** — `ctx.Done()` retorna um channel que fecha quando o contexto é cancelado ou expira. O `select` espera o primeiro canal pronto: se `time.After(5s)` chegar primeiro, a operação concluiu; se `ctx.Done()` chegar, excedeu o timeout e retorna `context.DeadlineExceeded`.

    **Layout de data `"2006-01-02 15:04:05"`** — Go usa uma **data de referência fixa** (`Mon Jan 2 15:04:05 MST 2006`) como template de formato. Cada componente tem um valor fixo: mês=01, dia=02, hora=15, minuto=04, segundo=05, ano=2006. Não é `YYYY-MM-DD` como em outras linguagens.

    **`regexp.MustCompile`** — compila a expressão regular **uma vez** e panics se inválida. Use para regex estáticas (constantes). Para regex dinâmicas (input do usuário), use `regexp.Compile` que retorna `(re, error)`. Go usa **RE2** — sem backtracking exponencial, seguro contra ReDoS.

    **`time.After` retorna `<-chan Time`** — cria um timer interno. Em loops, cada chamada a `time.After` aloca um novo timer que **não é coletado pelo GC** até expirar. Em hot loops, prefira `time.NewTimer` com `timer.Reset()`.
socializacao:
  discussao: Por que context é tão importante em microsserviços Go?
  pontos:
    - Propagação de cancelamento entre serviços
    - Evita goroutine leaks (timeout mata trabalho pendente)
    - Request-scoped values para tracing/auth
  diasDesafio: Dias 19–28
  sugestaoBlog: "Context, Time e Regexp: os 3 pacotes que todo dev Go precisa dominar"
  hashtagsExtras: '#golang #context #time #regexp'
aplicacao:
  projeto: HTTP client com retry, timeout configurável e cancelamento usando context.
  requisitos:
    - Context com timeout por request
    - Retry com backoff exponencial
    - Cancelamento propagado corretamente
  criterios:
    - Context usado corretamente
    - Sem goroutine leaks
    - Tratamento robusto
  starterCode: |
    package main

    import (
    	"context"
    	"fmt"
    	"regexp"
    	"time"
    )

    func buscarDado(ctx context.Context, id int) (string, error) {
    	// Simula operação lenta
    	select {
    	case <-time.After(time.Duration(id*500) * time.Millisecond):
    		return fmt.Sprintf("dado-%d", id), nil
    	case <-ctx.Done():
    		return "", ctx.Err()
    	}
    }

    func main() {
    	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    	defer cancel()

    	for i := 1; i <= 5; i++ {
    		resultado, err := buscarDado(ctx, i)
    		if err != nil {
    			fmt.Printf("Item %d: TIMEOUT (%v)\n", i, err)
    			continue
    		}
    		fmt.Printf("Item %d: %s\n", i, resultado)
    	}

    	// Formatação de datas
    	agora := time.Now()
    	fmt.Println("ISO:", agora.Format("2006-01-02T15:04:05"))
    	fmt.Println("BR:", agora.Format("02/01/2006 15:04"))

    	// Validação com regex
    	re := regexp.MustCompile(`^\d{5}-?\d{3}$`)
    	ceps := []string{"01001-000", "01001000", "abc", "123"}
    	for _, cep := range ceps {
    		fmt.Printf("CEP %-12s válido: %v\n", cep, re.MatchString(cep))
    	}
    }

---

## `context` — o "controle remoto" de operações

Imagine que você faz uma chamada HTTP para outro serviço e ele demora 30 segundos para responder. Você quer **desistir depois de 3 segundos** e seguir em frente. É exatamente isso que `context` faz.

Um **context** é um objeto que você passa para funções dizendo: "faça seu trabalho, mas se eu cancelar ou o tempo acabar, pare imediatamente".

### Criando um context com timeout

```go
// "Você tem 2 segundos para terminar"
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()  // SEMPRE chamar cancel — libera recursos
```

Vamos destrinchar:

| Parte | O que faz |
|---|---|
| `context.Background()` | Cria o context "raiz" — o ponto de partida, sem timeout nem cancelamento |
| `context.WithTimeout(...)` | Cria um context **filho** que expira após o tempo dado |
| `cancel` | Função para cancelar manualmente (antes do timeout) |
| `defer cancel()` | Garante que `cancel` é chamado quando a função termina |

### Usando o context numa operação

```go
func buscarDado(ctx context.Context) (string, error) {
    select {
    case <-time.After(5 * time.Second):
        return "dados prontos!", nil     // terminou a tempo
    case <-ctx.Done():
        return "", ctx.Err()             // tempo esgotou ou cancelaram
    }
}
```

O `select` espera o que acontecer primeiro:
- Se a operação terminar antes → retorna o resultado
- Se o context expirar antes → retorna o erro (`context.DeadlineExceeded`)

> **Por que `defer cancel()` é obrigatório?** Se você esquecer, o context fica "vivo" na memória esperando expirar, mesmo depois de você já ter o resultado. Com muitas requests, isso causa **goroutine leak** — goroutines abandonadas que nunca terminam.

### Os 4 tipos de context

| Tipo | Quando usar | Exemplo |
|---|---|---|
| `context.Background()` | Ponto de partida — em `main()`, testes | `ctx := context.Background()` |
| `context.WithTimeout` | "Espere no máximo X tempo" | Chamadas HTTP, queries de banco |
| `context.WithDeadline` | "Termine até tal horário" | "Termine até 14:30:00" |
| `context.WithCancel` | "Pare quando eu mandar" | Cancelamento manual por botão/sinal |

> **Convenção de Go:** `context.Context` é **sempre o primeiro parâmetro** de funções que fazem I/O, acessam banco, chamam APIs ou esperam goroutines. Você vai ver isso em toda a biblioteca padrão.

---

## `time` — datas, durações e timers

### Pegar a hora atual

```go
agora := time.Now()
fmt.Println(agora)  // 2026-04-11 14:30:45.123456 -0300 BRT
```

### Formatar datas — o jeito estranho (mas genial) do Go

Em outras linguagens, você escreve `YYYY-MM-DD HH:mm:ss`. Em Go, você usa uma **data de referência fixa** como template:

```go
// A data mágica: Jan 2 15:04:05 2006 (ou 01/02 03:04:05PM '06)
agora.Format("2006-01-02 15:04:05")     // 2026-04-11 14:30:45
agora.Format("02/01/2006")              // 11/04/2026 (formato BR)
agora.Format("15:04")                   // 14:30
```

Cada número na data de referência tem um papel:

| Componente | Valor na referência | Exemplo |
|---|---|---|
| Ano | `2006` | `2026` |
| Mês | `01` | `04` |
| Dia | `02` | `11` |
| Hora (24h) | `15` | `14` |
| Minuto | `04` | `30` |
| Segundo | `05` | `45` |

> **Dica para memorizar:** a data de referência é `01/02 03:04:05PM '06` — os números vão de 1 a 6 em sequência! Confuso no começo, mas depois de usar 2-3 vezes, vira automático.

### Durações e aritmética de tempo

```go
daqui1h := time.Now().Add(1 * time.Hour)
diferenca := daqui1h.Sub(time.Now())       // time.Duration
fmt.Println(diferenca)                      // ~1h0m0s
```

---

## `regexp` — validar padrões de texto

O pacote `regexp` serve para verificar se um texto segue um padrão (email, CEP, telefone, etc.).

### Criando e usando uma regex

```go
// MustCompile: compila a regex UMA VEZ (panic se for inválida)
re := regexp.MustCompile(`^\d{5}-?\d{3}$`)

// Testar strings contra o padrão
fmt.Println(re.MatchString("01001-000"))  // true  — CEP válido
fmt.Println(re.MatchString("01001000"))   // true  — sem hífen também vale
fmt.Println(re.MatchString("abc"))        // false — não é CEP
```

### `MustCompile` vs `Compile`

| Função | Quando usar | Se a regex for inválida |
|---|---|---|
| `regexp.MustCompile` | Regex fixa no código (você sabe que é válida) | **Panic** — erro na hora |
| `regexp.Compile` | Regex vinda do usuário (pode ser inválida) | Retorna `error` — você trata |

```go
// Regex fixa — use MustCompile
var emailRe = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

// Regex do usuário — use Compile
re, err := regexp.Compile(inputDoUsuario)
if err != nil {
    fmt.Println("Regex inválida:", err)
}
```

> **Segurança:** Go usa o motor **RE2**, que é imune a ataques ReDoS (quando uma regex maliciosa trava o servidor). Diferente de JavaScript e Python, que podem travar com backtracking exponencial, Go sempre termina em tempo previsível.
