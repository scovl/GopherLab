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

## context

O pacote `context` gerencia ciclo de vida de operações: **cancelamento**, **timeouts** e **deadlines** — fundamental em servidores HTTP e microsserviços.

```go
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()  // sempre chamar cancel! evita goroutine leak

if err := operacaoLenta(ctx); err != nil {
    // context.DeadlineExceeded
}
```

| Função | Uso |
|---|---|
| `context.Background()` | Raiz — use em main, testes |
| `context.WithTimeout` | Cancelamento por tempo absoluto |
| `context.WithDeadline` | Cancelamento por deadline absoluta |
| `context.WithCancel` | Cancelamento manual |

> **Regra:** `context.Context` deve ser **o primeiro parâmetro** de toda função que faz I/O ou espera por goroutines.

## time

O pacote `time` manipula datas, durações, timers e tickers.

```go
agora := time.Now()
fmt.Println(agora.Format("2006-01-02 15:04:05"))  // layout de referência fixo do Go!
```

> O layout de referência de Go é `Mon Jan 2 15:04:05 MST 2006` — é a **data de referência** para todos os formatos.

## regexp

O pacote `regexp` implementa RE2 — **seguro e eficiente** (sem backtracking exponencial). Use `regexp.MustCompile` para expressões estáticas (panics em init se inválida), `regexp.Compile` para expressões dinâmicas (retorna erro).

```go
re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
fmt.Println(re.MatchString("user@go.dev"))  // true
```
