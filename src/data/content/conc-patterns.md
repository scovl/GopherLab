---
title: Padrões de Concorrência
description: Worker pool, fan-out/fan-in, pipeline, semáforo e graceful shutdown.
estimatedMinutes: 50
recursos:
  - https://gobyexample.com/worker-pools
  - https://go.dev/blog/pipelines
experimentacao:
  desafio: "Implemente um download concorrente: pool de N workers baixa uma lista de URLs, com semáforo limitando concorrência e context para timeout global."
  dicas:
    - "Semáforo: sem := make(chan struct{}, maxConcurrent)"
    - context.WithTimeout para timeout global
    - Fan-in com WaitGroup + goroutine para close(results)
  codeTemplate: |
    package main

    import (
    	"context"
    	"fmt"
    	"sync"
    	"time"
    )

    func worker(ctx context.Context, id int, jobs <-chan int, results chan<- string, wg *sync.WaitGroup) {
    	defer wg.Done()
    	for job := range jobs {
    		select {
    		case <-ctx.Done():
    			fmt.Printf("Worker %d: cancelado\n", id)
    			return
    		default:
    			time.Sleep(100 * time.Millisecond) // simula trabalho
    			results <- fmt.Sprintf("worker-%d processou job-%d", id, job)
    		}
    	}
    }

    func main() {
    	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    	defer cancel()

    	jobs := make(chan int, 10)
    	results := make(chan string, 10)

    	// Lança 3 workers (fan-out)
    	var wg sync.WaitGroup
    	for i := 1; i <= 3; i++ {
    		wg.Add(1)
    		go worker(ctx, i, jobs, results, &wg)
    	}

    	// Envia 15 jobs
    	for j := 1; j <= 15; j++ {
    		jobs <- j
    	}
    	close(jobs)

    	// Fecha results quando todos os workers terminarem (fan-in)
    	go func() {
    		wg.Wait()
    		close(results)
    	}()

    	// Coleta resultados
    	for r := range results {
    		fmt.Println(r)
    	}
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **Worker pool** — `jobs` é um channel compartilhado por N goroutines workers. Cada worker faz `for job := range jobs` — bloqueia esperando trabalho e termina quando `close(jobs)` é chamado. Limita concorrência a N operações simultâneas.

    **Fan-out/Fan-in** — fan-out: 1 channel `jobs` distribuído entre 3 workers. Fan-in: todos os 3 workers escrevem em 1 channel `results`. A goroutine de coleção `go func() { wg.Wait(); close(results) }()` fecha o channel de resultados **apenas** quando todos os workers terminam.

    **`context.WithTimeout`** — cria deadline global de 2 segundos. Workers verificam `ctx.Done()` via `select` antes de cada job. Se o timeout exceder, workers encerram antes de processar jobs restantes — prevenindo goroutine leaks.

    **`select` com `default`** — `select` avalia cases em **ordem aleatória**. Com `default`, nunca bloqueia (operação try-send/try-receive). Sem `default`, bloqueia até um case estar pronto. `select{}` (sem cases) bloqueia para sempre.

    **Semáforo** — `sem := make(chan struct{}, N)`: envio adquire slot (`sem <- struct{}{}`), recepção libera (`<-sem`). Limita concorrência sem worker pool. Mais simples quando cada goroutine é efêmera.

    **Goroutine leak** — ocorre quando uma goroutine fica bloqueada em channel sem consumer. Sempre: (1) garanta que channels terão consumers, (2) use `context.WithTimeout` para operações externas, (3) `close` channels quando o produtor terminar.
socializacao:
  discussao: Como dimensionar o número de workers? E como fazer graceful shutdown?
  pontos:
    - "CPU-bound: GOMAXPROCS workers"
    - "I/O-bound: mais workers (10x a 100x)"
    - "Graceful shutdown: signal.NotifyContext + context cancellation"
  diasDesafio: Dias 29–38
  sugestaoBlog: "Padrões de concorrência em Go: worker pool, pipeline e graceful shutdown"
  hashtagsExtras: '#golang #patterns #concurrency'
aplicacao:
  projeto: Load balancer simples que distribui requests HTTP entre backends com health check.
  requisitos:
    - Worker pool com N goroutines
    - Round-robin ou least-connections
    - Graceful shutdown com signal + context
  criterios:
    - Distribuição equilibrada
    - Graceful shutdown
    - Sem goroutine leaks
  starterCode: |
    package main

    import (
    	"context"
    	"fmt"
    	"math/rand"
    	"os"
    	"os/signal"
    	"sync"
    	"time"
    )

    type Job struct {
    	ID   int
    	URL  string
    }

    type Result struct {
    	JobID    int
    	Status   string
    	Duration time.Duration
    }

    func downloader(ctx context.Context, id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
    	defer wg.Done()
    	for job := range jobs {
    		start := time.Now()
    		select {
    		case <-ctx.Done():
    			results <- Result{job.ID, "cancelado", time.Since(start)}
    			return
    		case <-time.After(time.Duration(rand.Intn(500)) * time.Millisecond):
    			results <- Result{job.ID, "ok", time.Since(start)}
    		}
    	}
    }

    func main() {
    	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
    	defer stop()

    	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
    	defer cancel()

    	jobs := make(chan Job, 5)
    	results := make(chan Result, 5)

    	// Worker pool: 3 downloaders
    	var wg sync.WaitGroup
    	for i := 1; i <= 3; i++ {
    		wg.Add(1)
    		go downloader(ctx, i, jobs, results, &wg)
    	}

    	// Produz jobs
    	urls := []string{"go.dev", "pkg.go.dev", "go.dev/blog", "go.dev/doc", "go.dev/play"}
    	go func() {
    		for i, u := range urls {
    			jobs <- Job{ID: i + 1, URL: u}
    		}
    		close(jobs)
    	}()

    	// Fan-in: fecha results quando workers terminam
    	go func() {
    		wg.Wait()
    		close(results)
    	}()

    	for r := range results {
    		fmt.Printf("Job %d: %s (%v)\n", r.JobID, r.Status, r.Duration)
    	}
    	fmt.Println("Download pipeline finalizado")
    }

---

## Worker Pool

Resolve o problema de limitar concorrência: crie N goroutines workers que consomem de um channel de jobs.

```go
jobs := make(chan Job, buffer)

for i := 0; i < numWorkers; i++ {
    go func() {
        for job := range jobs {  // range bloqueia até jobs ser fechado
            process(job)
        }
    }()
}

// Produtores enviam jobs...
close(jobs)  // sinal de encerramento para os workers
```

O número ideal de workers depende da natureza do trabalho:
- **CPU-bound**: `GOMAXPROCS` (número de CPUs)
- **I/O-bound** (rede, disco): muito mais (10x–100x)

## Fan-out e Fan-in

- **Fan-out**: distribui trabalho de um produtor para múltiplos consumers (workers)
- **Fan-in (merge)**: coleta resultados de múltiplos producers em um único channel de resultados

Para fan-in: use uma `WaitGroup` + goroutine de coleção — quando todos os producers terminam, `close` o channel de resultados.

## Pipeline e cancelamento

O padrão Pipeline conecta estágios por channels: cada estágio lê do channel anterior, processa e escreve no próximo. O cancelamento é propagado com `context.Context`:

```go
ctx, cancel := context.WithCancel(context.Background())
defer cancel()

// workers verificam ctx.Done()
select {
case <-ctx.Done():
    return
case result <- process(input):
}
```

## Semáforo e goroutine leaks

**Semáforo com channel buffered:**

```go
sem := make(chan struct{}, maxConcurrent)
sem <- struct{}{}       // adquirir
defer func() { <-sem }() // liberar
```

**Goroutine leak** acontece quando uma goroutine fica bloqueada em um channel que nunca será lido/escrito — sempre garanta que channels terão consumers. Use `context.WithTimeout` para prevenir leaks em operações externas.

Para **graceful shutdown**: use `signal.NotifyContext(ctx, os.Interrupt)` para capturar Ctrl+C e cancelar o context global.
