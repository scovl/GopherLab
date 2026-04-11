---
title: "Sync: WaitGroups, Mutex e Atomic"
description: sync.WaitGroup, sync.Mutex, sync.RWMutex, sync/atomic e race detection.
estimatedMinutes: 45
recursos:
  - https://gobyexample.com/mutexes
  - https://gobyexample.com/waitgroups
  - https://gobyexample.com/atomic-counters
experimentacao:
  desafio: "Crie um programa com data race (2 goroutines incrementando sem lock), detecte com `go run -race` e corrija com: (1) Mutex, (2) atomic, (3) channel."
  dicas:
    - go run -race main.go mostra exatamente onde está a race
    - "RWMutex: RLock para leitura concorrente, Lock para escrita exclusiva"
    - sync.Once para inicialização lazy (ex: pool de conexões)
  codeTemplate: |
    package main

    import (
    	"fmt"
    	"sync"
    	"sync/atomic"
    )

    // Exemplo 1: data race (rodar com go run -race)
    func exemploRace() {
    	var contador int
    	var wg sync.WaitGroup
    	for i := 0; i < 1000; i++ {
    		wg.Add(1)
    		go func() {
    			defer wg.Done()
    			contador++ // DATA RACE!
    		}()
    	}
    	wg.Wait()
    	fmt.Println("Race:", contador) // resultado imprevisível
    }

    // Exemplo 2: corrigido com Mutex
    func exemploMutex() {
    	var mu sync.Mutex
    	var contador int
    	var wg sync.WaitGroup
    	for i := 0; i < 1000; i++ {
    		wg.Add(1)
    		go func() {
    			defer wg.Done()
    			mu.Lock()
    			contador++
    			mu.Unlock()
    		}()
    	}
    	wg.Wait()
    	fmt.Println("Mutex:", contador) // sempre 1000
    }

    // Exemplo 3: corrigido com atomic
    func exemploAtomic() {
    	var contador int64
    	var wg sync.WaitGroup
    	for i := 0; i < 1000; i++ {
    		wg.Add(1)
    		go func() {
    			defer wg.Done()
    			atomic.AddInt64(&contador, 1)
    		}()
    	}
    	wg.Wait()
    	fmt.Println("Atomic:", contador) // sempre 1000
    }

    func main() {
    	exemploRace()
    	exemploMutex()
    	exemploAtomic()
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **Data race em `exemploRace`** — `contador++` não é atômico: é read + increment + write. Quando 1000 goroutines fazem isso simultaneamente, algumas leituras veem valores desatualizados. O resultado é imprevisível. `go run -race main.go` detecta e reporta exatamente onde está a race.

    **`sync.Mutex`** — `mu.Lock()` garante que apenas **uma goroutine** acessa a seção crítica (o `contador++`). `defer mu.Unlock()` é o padrão obrigatório — garante desbloqueio mesmo em caso de panic. O overhead é mínimo, mas existe context-switch quando goroutines disputam o lock.

    **`atomic.AddInt64`** — operação atômica implementada em **hardware** (instrução CPU). Sem lock, sem context-switch. Mais eficiente que Mutex para contadores simples. Limitado a tipos primitivos (`int32`, `int64`, `uint64`, `uintptr`). Desde Go 1.19, use `atomic.Int64` como tipo com métodos.

    **`sync.WaitGroup`** — coordena a espera por N goroutines. `Add(N)` **antes** de lançar goroutines (nunca dentro!), `Done()` ao terminar cada uma, `Wait()` bloqueia até todas chamarem `Done()`. Se o contador ficar negativo, panic.

    **`sync.RWMutex`** — permite N leitores simultâneos (`RLock`/`RUnlock`) ou 1 escritor exclusivo (`Lock`/`Unlock`). Ideal quando leituras >> escritas. Em outros casos, `Mutex` simples é mais performante.

    **`sync.Once`** — garante que uma função é executada **exatamente uma vez**, mesmo chamada por múltiplas goroutines. Padrão para inicialização lazy (pool de conexões, config).
socializacao:
  discussao: "Channels vs locks (mutex) – quando usar cada um?"
  pontos:
    - "Channels: coordenação e comunicação entre goroutines"
    - "Mutex: proteção de estado compartilhado"
    - Share memory by communicating vs communicate by sharing memory
    - "Armadilha: goroutine leak quando channel nunca é lido"
  diasDesafio: Dias 29–38
  sugestaoBlog: "WaitGroups, Mutex e Race Conditions: sincronização em Go"
  hashtagsExtras: '#golang #mutex #racecondition #sync'
aplicacao:
  projeto: Rate limiter thread-safe com limite N requests por segundo.
  requisitos:
    - Usar Mutex ou channels para controle
    - go test -race sem erros
    - Configurável (N por segundo)
  criterios:
    - Sem data races
    - Rate limiting preciso
    - Testes passando
  starterCode: |
    package main

    import (
    	"fmt"
    	"sync"
    	"sync/atomic"
    	"time"
    )

    type RateLimiter struct {
    	mu       sync.Mutex
    	tokens   int
    	max      int
    	interval time.Duration
    	stopCh   chan struct{}
    }

    func NovoRateLimiter(max int, intervalo time.Duration) *RateLimiter {
    	rl := &RateLimiter{
    		tokens:   max,
    		max:      max,
    		interval: intervalo,
    		stopCh:   make(chan struct{}),
    	}
    	go rl.recarregar()
    	return rl
    }

    func (rl *RateLimiter) recarregar() {
    	ticker := time.NewTicker(rl.interval)
    	defer ticker.Stop()
    	for {
    		select {
    		case <-ticker.C:
    			rl.mu.Lock()
    			if rl.tokens < rl.max {
    				rl.tokens++
    			}
    			rl.mu.Unlock()
    		case <-rl.stopCh:
    			return
    		}
    	}
    }

    func (rl *RateLimiter) Permitir() bool {
    	rl.mu.Lock()
    	defer rl.mu.Unlock()
    	if rl.tokens > 0 {
    		rl.tokens--
    		return true
    	}
    	return false
    }

    func (rl *RateLimiter) Parar() { close(rl.stopCh) }

    func main() {
    	rl := NovoRateLimiter(5, 200*time.Millisecond)
    	defer rl.Parar()

    	var permitidos, bloqueados int64
    	var wg sync.WaitGroup
    	for i := 0; i < 20; i++ {
    		wg.Add(1)
    		go func(id int) {
    			defer wg.Done()
    			if rl.Permitir() {
    				atomic.AddInt64(&permitidos, 1)
    				fmt.Printf("Request %2d: PERMITIDO\n", id)
    			} else {
    				atomic.AddInt64(&bloqueados, 1)
    				fmt.Printf("Request %2d: BLOQUEADO\n", id)
    			}
    		}(i)
    	}
    	wg.Wait()
    	fmt.Printf("\nPermitidos: %d, Bloqueados: %d\n", permitidos, bloqueados)
    }

---

## sync.WaitGroup

Coordena a espera por um conjunto fixo de goroutines.

```go
var wg sync.WaitGroup
wg.Add(n)    // incrementa ANTES de iniciar goroutines
go func() {
    defer wg.Done()  // decrementa ao terminar
    // trabalho...
}()
wg.Wait()    // bloqueia até contador chegar a 0
```

> **Armadilha:** nunca chame `Add` dentro da goroutine — `Wait` pode ser chamado antes do `Add`.

## sync.Mutex e sync.RWMutex

```go
var mu sync.Mutex
mu.Lock()
defer mu.Unlock()  // idiom obrigatório — garante desbloqueio mesmo em panic
// seção crítica
```

`sync.RWMutex` permite múltiplos leitores simultâneos (`RLock`/`RUnlock`) ou um escritor exclusivo (`Lock`/`Unlock`) — útil quando leituras >> escritas.

## sync/atomic

Operações atômicas sem lock para tipos primitivos (`int32`, `int64`, `uint64`, `Pointer`). `atomic.AddInt64(&n, 1)` é mais eficiente que `Mutex` para contadores simples — evita overhead de context-switch. `atomic.Value` armazena qualquer tipo atomicamente — útil para configuração imutável trocada atomicamente.

## sync.Once e sync.Map

- **`sync.Once`**: garante que uma função seja executada **exatamente uma vez**, mesmo com múltiplas goroutines — padrão para inicialização lazy
- **`sync.Map`**: map thread-safe para casos específicos (muita leitura, pouca escrita, chaves estáveis). Na maioria dos casos, `map + Mutex` é mais simples e performante

> O flag `-race` (`go run -race`, `go test -race`) detecta data races dinamicamente — **sempre use em CI**.
