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
          explicacao: 'Goroutines são threads cooperativas gerenciadas pelo runtime Go (Green Threads sobre o modelo M:N). Cada goroutine começa com ~2KB de stack, que cresce e encolhe de forma elástica até o limite do sistema. O scheduler Go usa GOMAXPROCS threads OS (padrão: número de CPUs) para multiplexar goroutines. É viável criar milhares de goroutines; o custo marginal é ordens de grandeza menor que threads OS.\n\nChannels são a primitiva de comunicação tipada entre goroutines (CSP: Communicating Sequential Processes). Internamente, cada channel mantém três filas FIFO: (1) fila de goroutines bloqueadas esperando enviar, (2) fila de goroutines bloqueadas esperando receber, e (3) buffer cíclico de valores. Um channel também possui um mutex interno que protege todas essas operações.\n\nRegras fundamentais de channels: enviar para um channel fechado causa panic; fechar um channel nil causa panic; fechar um channel já fechado causa panic. Receber de um channel fechado é seguro -- retorna os valores restantes no buffer e depois zero values com ok=false. Enviar/receber de un channel nil bloqueia para sempre. O idiom para verificar se o channel ainda está aberto: v, ok := <-ch -- ok == false significa fechado e sem mais valores.\n\nselect avalia todos os cases em ordem randômica e executa um não-bloqueante. Se nenhum case for imediatamente executável, executa o default (se presente) ou bloqueia até um case estar pronto. O não-determinismo é intencional para evitar starvation. select{} (sem cases) bloqueia para sempre -- usado para manter goroutinas vivas. O default permite operacões tentativas (try-send/try-receive) sem bloquear.',
          codeExample: 'package main\n\nimport (\n\t"fmt"\n\t"time"\n)\n\n// Produtor com channel tipado send-only\nfunc produtor(ch chan<- int, n int) {\n\tfor i := 0; i < n; i++ {\n\t\tch <- i\n\t}\n\tclose(ch) // sinaliza fim; recepção retorna ok=false\n}\n\nfunc main() {\n\t// Channel unbuffered: senderbloqueia até receiver ler\n\tc := make(chan int)\n\tgo func(ch chan<- int) {\n\t\ttime.Sleep(time.Millisecond)\n\t\tch <- 42\n\t}(c)\n\tv := <-c\n\tfmt.Println("recebido:", v)\n\n\t// Channel buffered: assíncrono até cap\n\tbuf := make(chan int, 2)\n\tbuf <- 10\n\tbuf <- 20\n\t// buf <- 30 // bloquearia: buffer cheio\n\tfmt.Println(len(buf), cap(buf)) // 2 2\n\n\t// for-range em channel: lê até close()\n\tch := make(chan int, 10)\n\tgo produtor(ch, 5)\n\tfor v := range ch {\n\t\tfmt.Println(v) // 0 1 2 3 4\n\t}\n\n\t// select com default (try-receive não-bloqueante)\n\tch2 := make(chan string, 1)\n\tselect {\n\tcase msg := <-ch2:\n\t\tfmt.Println(msg)\n\tdefault:\n\t\tfmt.Println("nada para receber")\n\t}\n\n\t// ARMADILHA: receber de closed channel\n\tclose(ch)                // já fechado acima via produtor...\n\t// use outro para demo:\n\tdemoCh := make(chan int, 1)\n\tdemoCh <- 99\n\tclose(demoCh)\n\tx, ok := <-demoCh\n\tfmt.Println(x, ok) // 99 true (valor no buffer)\n\tx, ok = <-demoCh\n\tfmt.Println(x, ok) // 0 false (fechado, zero value)\n}',
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
          explicacao: 'sync.WaitGroup coordena a espera por um conjunto fixo de goroutines. Add(n) incrementa o contador antes de iniciar as goroutines; Done() decrementa (geralmente via defer); Wait() bloqueia até o contador chegar a 0. A armadilha: não chame Add dentro da goroutine -- pode ser que Wait() seja chamado antes do Add(). Sempre chame Add antes de go.\n\nsync.Mutex (mutual exclusion lock) garante exclusividade: Lock() bloqueia até adquirir o lock; Unlock() libera. O idiom obrigatório: defer mu.Unlock() logo após mu.Lock() num bloco crtico, garantindo desbloqueio mesmo em caso de panic. sync.RWMutex permite múltiplos leitores simultâneos com RLock()/RUnlock() ou um escritor exclusivo com Lock()/Unlock() -- útil quando leituras >> escritas.\n\nsync/atomic provê operações atômicas sem lock para tipos primitivos (int32, int64, uint64, Pointer). AddInt64(&n, 1) é mais eficiente que Mutex para contadores simples -- evita o overhead de context-switch. atomic.Value armazena qualquer tipo (interface{}) atomicamente -- útil para configuración imutável que é trocada atomicamente.\n\nsync.Once garante que uma função seja executada exatamente uma vez, mesmo com múltiplas goroutines chamando concurrentemente -- padrão para inicialização lazy. sync.Map é um map thread-safe para casos específicos (muita leitura, pouca escrita, chaves estáveis). Na maioria dos casos, map + Mutex é mais simples e performante. O flag -race (go run -race, go test -race) detecta data races dinamicamente -- sempre use em CI.',
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
          explicacao: 'O padrão Worker Pool resolve o problema de limitar concorrência: crie N goroutines workers que consomem de um channel de jobs. O número ideal de workers depende da natureza do trabalho: para CPU-bound, GOMAXPROCS; para I/O-bound (rede, disco), muito mais (10x–100x). Fechar o channel de jobs (close(jobs)) é o sinal de encerramento para os workers quando iteram com for-range.\n\nFan-out distribui trabalho de um produtor para múltiplos consumers (workers). Fan-in (merge) coleta resultados de múltiplos producers em um único channel de resultados. Para fazer o fan-in, use uma WaitGroup + goroutine de coleção: quando todos os producers terminam, close o channel de resultados.\n\nO padrão Pipeline conecta estágios por channels: cada estágio lê do channel anterior, processa e escreve no próximo. O cancelamento é propagado com context.Context: context.WithCancel retorna um context e uma função cancel; ao chamar cancel(), o ctx.Done() channel é fechado e os workers podem verificar com select { case <-ctx.Done(): return }.\n\nSemáforo com channel buffered: sem := make(chan struct{}, maxConcurrent); sem <- struct{}{}; defer func() { <-sem }(). Goroutine leak acontece quando uma goroutine fica bloqueada em um channel que nunca será lido/escrito -- sempre garanta que channels terão consumers. Use context com timeout para prevenir leaks em operações externas. Para graceful shutdown: use signal.NotifyContext(ctx, os.Interrupt) para capturar Ctrl+C e cancelar o context global.',
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
