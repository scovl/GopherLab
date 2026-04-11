---
title: Goroutines e Channels
description: Goroutines, channels buffered/unbuffered, select e padrão produtor/consumidor.
estimatedMinutes: 50
recursos:
  - https://go.dev/tour/concurrency/1
  - https://gobyexample.com/goroutines
  - https://gobyexample.com/channels
  - https://gobyexample.com/select
experimentacao:
  desafio: "Implemente o padrão fan-out/fan-in: distribua URLs entre N workers que fazem HTTP GET concorrente e colete resultados em um channel único."
  dicas:
    - "Fan-out: um channel de jobs lido por N goroutines"
    - "Fan-in: N goroutines escrevem em um channel de resultados"
    - select com default para operação não-bloqueante
    - Sempre close(ch) quando não há mais dados a enviar
  codeTemplate: |
    package main

    import (
    	"fmt"
    	"sync"
    	"time"
    )

    func produtor(ch chan<- int, id int) {
    	for i := 0; i < 5; i++ {
    		val := id*100 + i
    		ch <- val
    		fmt.Printf("Produtor %d enviou %d\n", id, val)
    	}
    }

    func consumidor(ch <-chan int, wg *sync.WaitGroup) {
    	defer wg.Done()
    	for val := range ch {
    		fmt.Printf("  Consumidor recebeu: %d\n", val)
    		time.Sleep(100 * time.Millisecond)
    	}
    }

    func main() {
    	ch := make(chan int, 3) // channel buffered

    	// Fan-out: 2 produtores
    	go produtor(ch, 1)
    	go produtor(ch, 2)

    	// Fecha o channel quando produtores terminarem
    	go func() {
    		time.Sleep(time.Second)
    		close(ch)
    	}()

    	// Fan-in: 2 consumidores
    	var wg sync.WaitGroup
    	for i := 0; i < 2; i++ {
    		wg.Add(1)
    		go consumidor(ch, &wg)
    	}
    	wg.Wait()
    	fmt.Println("Pipeline finalizado")
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`ch := make(chan int, 3)`** — cria um channel buffered com capacidade 3. Até 3 valores podem ser enviados sem bloquear. No quarto envio, o produtor bloqueia até um consumidor receber. Canal sem capacidade (`make(chan int)`) é **unbuffered** — cada envio bloqueia até ter um receptor pronto.

    **`chan<- int` e `<-chan int`** — tipos direcionais. `chan<- int` é send-only (produtor), `<-chan int` é receive-only (consumidor). O compilador impede operações inválidas. O channel bidirecional `chan int` converte implicitamente para ambos.

    **`for val := range ch`** — itera valores recebidos do channel até ele ser **fechado**. Após `close(ch)`, o range drena valores restantes no buffer e termina. Sem `close`, o `range` bloqueia para sempre (goroutine leak!).

    **`close(ch)`** — sinaliza que não há mais valores. Enviar para channel fechado causa **panic**. Receber de channel fechado retorna zero value + `ok=false`. Fechar channel `nil` ou já fechado causa **panic**.

    **Regra fundamental** — o runtime Go usa o modelo **M:N**. `GOMAXPROCS` threads OS multiplexam milhares de goroutines, cada uma com ~2KB de stack elástica. A troca de contexto é feita pelo scheduler Go (não pelo kernel), ordens de grandeza mais barata que threads OS.
socializacao:
  discussao: "Rob Pike: 'Concorrência não é paralelismo.' O que isso significa?"
  pontos:
    - "Concorrência: design (lidar com muitas coisas)"
    - "Paralelismo: execução (fazer muitas coisas ao mesmo tempo)"
    - GOMAXPROCS controla quantos OS threads usam goroutines
    - CSP (Communicating Sequential Processes) model
  diasDesafio: Dias 29–38
  sugestaoBlog: "Goroutines e Channels: concorrência em Go sem locks"
  hashtagsExtras: '#golang #goroutines #channels #concurrency'
aplicacao:
  projeto: Pipeline de processamento com 3 estágios - gerar, transformar e agregar, usando goroutines e channels.
  requisitos:
    - Cada estágio em goroutine separada
    - Channels conectando estágios
    - Graceful shutdown com close(ch)
  criterios:
    - Pipeline funcional
    - Goroutines finalizadas
    - Channels fechados
  starterCode: |
    package main

    import (
    	"fmt"
    	"math/rand"
    	"sync"
    	"time"
    )

    func gerador(n int) <-chan int {
    	ch := make(chan int)
    	go func() {
    		defer close(ch)
    		for i := 0; i < n; i++ {
    			ch <- rand.Intn(100)
    		}
    	}()
    	return ch
    }

    func dobrar(in <-chan int) <-chan int {
    	out := make(chan int)
    	go func() {
    		defer close(out)
    		for v := range in {
    			out <- v * 2
    		}
    	}()
    	return out
    }

    func filtrar(in <-chan int, min int) <-chan int {
    	out := make(chan int)
    	go func() {
    		defer close(out)
    		for v := range in {
    			if v >= min {
    				out <- v
    			}
    		}
    	}()
    	return out
    }

    func coletar(in <-chan int, wg *sync.WaitGroup, resultados *[]int) {
    	defer wg.Done()
    	for v := range in {
    		*resultados = append(*resultados, v)
    	}
    }

    func main() {
    	start := time.Now()

    	// Pipeline: gerar → dobrar → filtrar(>=50)
    	numeros := gerador(20)
    	dobrados := dobrar(numeros)
    	filtrados := filtrar(dobrados, 50)

    	var wg sync.WaitGroup
    	var resultados []int
    	wg.Add(1)
    	go coletar(filtrados, &wg, &resultados)
    	wg.Wait()

    	fmt.Println("Resultados:", resultados)
    	fmt.Println("Tempo:", time.Since(start))
    }

---

Goroutines são threads cooperativas gerenciadas pelo runtime Go (modelo **M:N**). Cada goroutine começa com ~2KB de stack, que cresce e encolhe de forma elástica. O scheduler usa `GOMAXPROCS` threads OS (padrão: número de CPUs) para multiplexar goroutines. É viável criar **milhares de goroutines** — o custo marginal é ordens de grandeza menor que threads OS.

## Estrutura interna dos channels

Cada channel mantém internamente **três filas FIFO**:

1. Fila de goroutines bloqueadas esperando **enviar**
2. Fila de goroutines bloqueadas esperando **receber**
3. Buffer cíclico de valores

Um channel também possui um **mutex interno** que protege todas essas operações.

## Regras fundamentais de channels

| Operação | Channel nil | Channel aberto | Channel fechado |
|---|---|---|---|
| Enviar | bloqueia para sempre | envia (bloqueia se buffer cheio) | **panic** |
| Receber | bloqueia para sempre | recebe (bloqueia se vazio) | retorna valores do buffer, depois zero value + `ok=false` |
| Fechar | **panic** | fecha | **panic** |

O idiom `v, ok := <-ch` — `ok == false` significa fechado e sem mais valores.

## select

`select` avalia todos os cases em **ordem randômica** e executa um não-bloqueante. Se nenhum case for imediatamente executável, executa o `default` (se presente) ou bloqueia até um case estar pronto. O não-determinismo é intencional para evitar starvation.

```go
select {
case v := <-ch:   // recebe se disponível
    use(v)
case ch <- val:   // envia se possível
default:          // não bloqueia (try-send/try-receive)
}
```

`select{}` (sem cases) bloqueia para sempre — usado para manter goroutines vivas.
