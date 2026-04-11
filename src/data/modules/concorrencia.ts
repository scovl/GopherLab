import { Module } from '../../types';

export const concorrenciaModule: Module = {
  id: 'concorrencia',
  title: 'Concorrência',
  description: 'Goroutines, channels, select, sync, padrões de concorrência e race detection.',
  icon: 'GitBranch',
  color: '#F6A623',
  lessons: [
    {
      id: 'conc-goroutines-channels',
      title: 'Goroutines e Channels',
      description: 'Goroutines, channels buffered/unbuffered, select e padrão produtor/consumidor.',
      estimatedMinutes: 50,
      vesa: {
        visaoGeral: {
          explicacao: 'Goroutines são threads leves (~2KB de stack) gerenciadas pelo runtime Go — pode-se criar milhões. `go func()` inicia uma goroutine. Channels são pipes tipados para comunicação entre goroutines (princípio: "share memory by communicating"). Unbuffered: síncrono (sender bloqueia até receiver ler). Buffered: assíncrono até a capacidade. `close(ch)` sinaliza que não há mais dados. `select` multiplica operações em múltiplos channels.',
          codeExample: 'package main\n\nimport "fmt"\n\n// Produtor\nfunc produtor(ch chan<- int, n int) {\n\tfor i := 0; i < n; i++ {\n\t\tch <- i\n\t}\n\tclose(ch)\n}\n\nfunc main() {\n\t// Unbuffered — síncrono\n\tdone := make(chan bool)\n\tgo func() {\n\t\tfmt.Println("Goroutine executou")\n\t\tdone <- true\n\t}()\n\t<-done\n\n\t// Buffered — assíncrono até cap\n\tch := make(chan int, 5)\n\tgo produtor(ch, 10)\n\tfor v := range ch {\n\t\tfmt.Println("Recebido:", v)\n\t}\n\n\t// Select — multiplexar channels\n\tch1 := make(chan string)\n\tch2 := make(chan string)\n\tgo func() { ch1 <- "um" }()\n\tgo func() { ch2 <- "dois" }()\n\tselect {\n\tcase msg := <-ch1:\n\t\tfmt.Println(msg)\n\tcase msg := <-ch2:\n\t\tfmt.Println(msg)\n\t}\n}',
          recursos: [
            'https://go.dev/tour/concurrency/1',
            'https://gobyexample.com/goroutines',
            'https://gobyexample.com/channels',
            'https://gobyexample.com/select',
          ],
        },
        experimentacao: {
          desafio: 'Implemente o padrão fan-out/fan-in: distribua URLs entre N workers que fazem HTTP GET concorrente e colete resultados em um channel único.',
          dicas: [
            'Fan-out: um channel de jobs lido por N goroutines',
            'Fan-in: N goroutines escrevem em um channel de resultados',
            'select com default para operação não-bloqueante',
            'Sempre close(ch) quando não há mais dados a enviar',
          ],
        },
        socializacao: {
          discussao: 'Rob Pike: "Concorrência não é paralelismo." O que isso significa?',
          pontos: [
            'Concorrência: design (lidar com muitas coisas)',
            'Paralelismo: execução (fazer muitas coisas ao mesmo tempo)',
            'GOMAXPROCS controla quantos OS threads usam goroutines',
            'CSP (Communicating Sequential Processes) model',
          ],
          diasDesafio: 'Dias 29–38',
          sugestaoBlog: 'Goroutines e Channels: concorrência em Go sem locks',
          hashtagsExtras: '#golang #goroutines #channels #concurrency',
        },
        aplicacao: {
          projeto: 'Pipeline de processamento com 3 estágios: gerar → transformar → agregar, usando goroutines e channels.',
          requisitos: [
            'Cada estágio em goroutine separada',
            'Channels conectando estágios',
            'Graceful shutdown com close(ch)',
          ],
          criterios: ['Pipeline funcional', 'Goroutines finalizadas', 'Channels fechados'],
        },
      },
    },
    {
      id: 'conc-sync',
      title: 'Sync: WaitGroups, Mutex e Atomic',
      description: 'sync.WaitGroup, sync.Mutex, sync.RWMutex, sync/atomic e race detection.',
      estimatedMinutes: 45,
      vesa: {
        visaoGeral: {
          explicacao: 'WaitGroup espera N goroutines (Add/Done/Wait). Mutex protege seções críticas — Lock/Unlock. RWMutex permite múltiplos leitores ou um escritor. sync/atomic oferece operações atômicas sem lock para contadores e flags. sync.Once executa código uma única vez (singleton). O flag `-race` detecta data races em tempo de execução.',
          codeExample: 'package main\n\nimport (\n\t"fmt"\n\t"sync"\n\t"sync/atomic"\n)\n\nfunc main() {\n\t// WaitGroup\n\tvar wg sync.WaitGroup\n\tfor i := 0; i < 5; i++ {\n\t\twg.Add(1)\n\t\tgo func(id int) {\n\t\t\tdefer wg.Done()\n\t\t\tfmt.Printf("Worker %d\\n", id)\n\t\t}(i)\n\t}\n\twg.Wait()\n\n\t// Mutex — protege estado compartilhado\n\tvar mu sync.Mutex\n\tcontador := 0\n\tfor i := 0; i < 1000; i++ {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tmu.Lock()\n\t\t\tcontador++\n\t\t\tmu.Unlock()\n\t\t}()\n\t}\n\twg.Wait()\n\tfmt.Println("Mutex:", contador) // 1000\n\n\t// Atomic — alternativa leve\n\tvar atomico int64\n\tfor i := 0; i < 1000; i++ {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tatomic.AddInt64(&atomico, 1)\n\t\t}()\n\t}\n\twg.Wait()\n\tfmt.Println("Atomic:", atomico) // 1000\n}\n\n// Detectar race: go run -race main.go',
          recursos: [
            'https://gobyexample.com/mutexes',
            'https://gobyexample.com/waitgroups',
            'https://gobyexample.com/atomic-counters',
          ],
        },
        experimentacao: {
          desafio: 'Crie um programa com data race (2 goroutines incrementando sem lock), detecte com `go run -race` e corrija com: (1) Mutex, (2) atomic, (3) channel.',
          dicas: [
            'go run -race main.go mostra exatamente onde está a race',
            'RWMutex: RLock para leitura concorrente, Lock para escrita exclusiva',
            'sync.Once para inicialização lazy (ex: pool de conexões)',
          ],
        },
        socializacao: {
          discussao: 'Channels vs locks (mutex) — quando usar cada um?',
          pontos: [
            'Channels: coordenação e comunicação entre goroutines',
            'Mutex: proteção de estado compartilhado',
            '"Share memory by communicating" vs "communicate by sharing memory"',
            'Armadilha: goroutine leak quando channel nunca é lido',
          ],
          diasDesafio: 'Dias 29–38',
          sugestaoBlog: 'WaitGroups, Mutex e Race Conditions: sincronização em Go',
          hashtagsExtras: '#golang #mutex #racecondition #sync',
        },
        aplicacao: {
          projeto: 'Rate limiter thread-safe: limite N requests por segundo.',
          requisitos: [
            'Usar Mutex ou channels para controle',
            'go test -race sem erros',
            'Configurável (N por segundo)',
          ],
          criterios: ['Sem data races', 'Rate limiting preciso', 'Testes passando'],
        },
      },
    },
    {
      id: 'conc-patterns',
      title: 'Padrões de Concorrência',
      description: 'Worker pool, fan-out/fan-in, pipeline, semáforo e graceful shutdown.',
      estimatedMinutes: 50,
      vesa: {
        visaoGeral: {
          explicacao: 'Padrões estabelecidos para concorrência: **Worker Pool** — N goroutines fixas processam jobs de um channel (controla recursos). **Fan-out** — distribui trabalho para múltiplos workers. **Fan-in** — merge múltiplos channels em um. **Pipeline** — estágios sequenciais conectados por channels. **Semáforo** — channel buffered como limitador. Cancellation com context propaga cancelamento pela cadeia.',
          codeExample: 'package main\n\nimport (\n\t"fmt"\n\t"sync"\n)\n\n// Worker Pool\nfunc worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {\n\tdefer wg.Done()\n\tfor j := range jobs {\n\t\tfmt.Printf("Worker %d processando job %d\\n", id, j)\n\t\tresults <- j * 2\n\t}\n}\n\nfunc main() {\n\tjobs := make(chan int, 100)\n\tresults := make(chan int, 100)\n\n\t// Iniciar 3 workers\n\tvar wg sync.WaitGroup\n\tfor w := 1; w <= 3; w++ {\n\t\twg.Add(1)\n\t\tgo worker(w, jobs, results, &wg)\n\t}\n\n\t// Enviar 9 jobs\n\tfor j := 1; j <= 9; j++ {\n\t\tjobs <- j\n\t}\n\tclose(jobs)\n\n\t// Esperar workers e fechar results\n\tgo func() {\n\t\twg.Wait()\n\t\tclose(results)\n\t}()\n\n\t// Coletar resultados\n\tfor r := range results {\n\t\tfmt.Println("Resultado:", r)\n\t}\n}',
          recursos: [
            'https://gobyexample.com/worker-pools',
            'https://go.dev/blog/pipelines',
          ],
        },
        experimentacao: {
          desafio: 'Implemente um download concorrente: pool de N workers baixa uma lista de URLs, com semáforo limitando concorrência e context para timeout global.',
          dicas: [
            'Semáforo: sem := make(chan struct{}, maxConcurrent)',
            'context.WithTimeout para timeout global',
            'Fan-in com WaitGroup + goroutine para close(results)',
          ],
        },
        socializacao: {
          discussao: 'Como dimensionar o número de workers? E como fazer graceful shutdown?',
          pontos: [
            'CPU-bound: GOMAXPROCS workers',
            'I/O-bound: mais workers (10x a 100x)',
            'Graceful shutdown: signal.NotifyContext + context cancellation',
          ],
          diasDesafio: 'Dias 29–38',
          sugestaoBlog: 'Padrões de concorrência em Go: worker pool, pipeline e graceful shutdown',
          hashtagsExtras: '#golang #patterns #concurrency',
        },
        aplicacao: {
          projeto: 'Load balancer simples: distribui requests HTTP entre backends com health check.',
          requisitos: [
            'Worker pool com N goroutines',
            'Round-robin ou least-connections',
            'Graceful shutdown com signal + context',
          ],
          criterios: ['Distribuição equilibrada', 'Graceful shutdown', 'Sem goroutine leaks'],
        },
      },
    },
  ],
};
