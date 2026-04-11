---
title: Profiling, Runtime e Otimização
description: pprof, trace, GC tuning, runtime internals (M:P:G) e benchmarks.
estimatedMinutes: 55
recursos:
  - https://go.dev/doc/gc-guide
  - https://go.dev/blog/pprof
  - https://pkg.go.dev/runtime/trace
experimentacao:
  desafio: Adicione pprof a um HTTP server, gere CPU e heap profiles, identifique o bottleneck mais caro e otimize.
  dicas:
    - import _ "net/http/pprof" – automático no default mux
    - go tool pprof -http=:8081 profile.pb.gz – web UI
    - GODEBUG=gctrace=1 mostra atividade do GC
    - go build -gcflags="-m" mostra escape analysis
  codeTemplate: |
    package main

    import (
    	"fmt"
    	"math/rand"
    	"net/http"
    	_ "net/http/pprof"
    	"runtime"
    	"time"
    )

    // Simula carga de trabalho com alocações
    func processarDados(n int) [][]byte {
    	result := make([][]byte, n)
    	for i := range result {
    		result[i] = make([]byte, rand.Intn(1024))
    	}
    	return result
    }

    // Monitora métricas do runtime
    func monitorar() {
    	for {
    		var m runtime.MemStats
    		runtime.ReadMemStats(&m)
    		fmt.Printf(
    			"Goroutines: %d | Heap: %d MB | GC: %d ciclos | NextGC: %d MB\n",
    			runtime.NumGoroutine(),
    			m.Alloc/1024/1024,
    			m.NumGC,
    			m.NextGC/1024/1024,
    		)
    		time.Sleep(2 * time.Second)
    	}
    }

    func main() {
    	// pprof endpoints registrados automaticamente
    	go func() {
    		fmt.Println("pprof em http://localhost:6060/debug/pprof/")
    		http.ListenAndServe(":6060", nil)
    	}()

    	go monitorar()

    	// Simula trabalho contínuo
    	for {
    		_ = processarDados(10000)
    		runtime.GC() // força GC para demonstração
    		time.Sleep(time.Second)
    	}
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`import _ "net/http/pprof"`** — o blank import registra handlers em `/debug/pprof/` no `DefaultServeMux`. Em produção, **nunca exponha pprof publicamente** — use mux separado em porta interna ou proteja com autenticação.

    **`runtime.ReadMemStats(&m)`** — snapshot completo de memória: `Alloc` (heap alocado agora), `TotalAlloc` (total alocado desde o início), `NumGC` (ciclos de GC), `NextGC` (threshold para próximo GC). **Stop-the-world brevemente** durante a coleta — não chame em hot paths.

    **`runtime.NumGoroutine()`** — goroutines ativas. Se esse número cresce indefinidamente, você tem goroutine leak. Monitore em produção via pprof ou métricas Prometheus.

    **Modelo M:P:G** — **M** (OS threads), **P** (processadores lógicos, `GOMAXPROCS`), **G** (goroutines). O scheduler distribui G entre M através de P. Work-stealing: quando um P fica sem G, rouba de outro. Stack de goroutine: começa com **2KB**, cresce até GB.

    **GC concurrent tri-color** — marca objetos como branco (não visitado), cinza (visitado, refs não escaneadas), preto (visitado, refs escaneadas). Pausas `<1ms` na maioria dos casos. `GOGC=100` (padrão): GC quando heap dobra. `GOMEMLIMIT` (Go 1.19+): limite hard de memória — GC roda mais agressivo quando próximo do limite.

    **Profiling workflow** — (1) `go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30` para CPU; (2) `go tool pprof -http=:8081 profile.pb.gz` para web UI; (3) `go tool trace trace.out` para visão de scheduling/GC; (4) `go build -gcflags="-m"` para escape analysis.
socializacao:
  discussao: Como o scheduler M:P:G do Go compara com threads do OS?
  pontos:
    - "Goroutines: ~2KB stack vs threads: ~1-8MB"
    - "Go scheduler: cooperative com preemption points"
    - Work-stealing entre P para balanceamento
  diasDesafio: Dias 91–96
  sugestaoBlog: "Go Internals: M:P:G scheduler, GC e profiling com pprof"
  hashtagsExtras: '#golang #performance #pprof #runtime'
aplicacao:
  projeto: Profile e otimize uma aplicação com CPU profile, heap profile, corrija alocações e meça melhoria.
  requisitos:
    - pprof ativo com endpoints /debug/pprof
    - CPU e heap profiles coletados
    - Bottleneck identificado e otimizado
  criterios:
    - Profiling executado
    - Bottleneck encontrado
    - Melhoria mensurável (benchmark)
  starterCode: |
    package main

    import (
    	"fmt"
    	"net/http"
    	_ "net/http/pprof"
    	"runtime"
    	"strings"
    	"testing"
    )

    // Função ineficiente — concatenação com +
    func concatIneficiente(strs []string) string {
    	result := ""
    	for _, s := range strs {
    		result += s // aloca nova string a cada iteração
    	}
    	return result
    }

    // Função otimizada — strings.Builder
    func concatOtimizado(strs []string) string {
    	var b strings.Builder
    	for _, s := range strs {
    		b.WriteString(s)
    	}
    	return b.String()
    }

    // TODO: implemente BenchmarkConcatIneficiente
    //   func BenchmarkConcatIneficiente(b *testing.B) { ... }
    //   Use b.N, -benchmem para ver allocs/op

    // TODO: implemente BenchmarkConcatOtimizado
    //   func BenchmarkConcatOtimizado(b *testing.B) { ... }

    // TODO: adicione pprof a um HTTP server seu
    //   e colete CPU profile de 30 segundos com:
    //   go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30

    // TODO: rode escape analysis no seu código:
    //   go build -gcflags="-m" ./...
    //   Identifique variáveis que escapam para o heap

    // TODO: compare GC behavior com GOGC=50 vs GOGC=200:
    //   GOGC=50 go run . (GC mais frequente, menos memória)
    //   GOGC=200 go run . (GC menos frequente, mais memória)

    func main() {
    	_ = testing.Benchmark
    	_ = http.ListenAndServe
    	_ = runtime.ReadMemStats
    	strs := make([]string, 1000)
    	for i := range strs {
    		strs[i] = "x"
    	}
    	fmt.Println("Ineficiente:", len(concatIneficiente(strs)))
    	fmt.Println("Otimizado:", len(concatOtimizado(strs)))
    	fmt.Println("Rode benchmarks para ver a diferença de alocações")
    }

---

O Go runtime usa o modelo **M:P:G**:

- **M** — OS threads (sistema operacional)
- **P** — Processadores lógicos (padrão: número de CPUs via `GOMAXPROCS`)
- **G** — Goroutines

O scheduler distribui goroutines (G) entre threads (M) através dos processadores (P). A stack de uma goroutine começa com **2KB** e cresce dinamicamente até o limite do sistema.

## GC — Garbage Collector

O GC do Go é **concurrent, tri-color mark-and-sweep**, otimizado para baixa latência (pausas `<1ms` na maioria dos casos). O GC é ajustado pelo `GOGC` (padrão 100 = GC quando heap dobra) e `GOMEMLIMIT` (Go 1.19+).

## pprof — profiling

```go
import _ "net/http/pprof"  // registra handlers /debug/pprof automaticamente

go func() {
    http.ListenAndServe(":6060", nil)
}()
```

```bash
# Coletar e visualizar CPU profile
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30
go tool pprof -http=:8081 profile.pb.gz  # web UI

# Heap profile
go tool pprof http://localhost:6060/debug/pprof/heap
```

## trace — execução detalhada

```bash
go test -trace=trace.out
go tool trace trace.out
```

Mostra goroutines, GC, scheduling, system calls — visão completa da execução.

## Diagnóstico em runtime

```go
runtime.NumGoroutine()   // goroutines ativas
runtime.NumCPU()         // CPUs disponíveis
runtime.GOMAXPROCS(0)    // P atual

var m runtime.MemStats
runtime.ReadMemStats(&m)
fmt.Printf("Heap: %d MB, GC cycles: %d\n", m.Alloc/1024/1024, m.NumGC)
```

`GODEBUG=gctrace=1` imprime atividade do GC em tempo real.
