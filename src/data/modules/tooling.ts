import { Module } from '../../types';

export const toolingModule: Module = {
  id: 'tooling',
  title: 'Tooling e Performance',
  description: 'go vet, golangci-lint, pprof, trace, runtime internals e otimização.',
  icon: 'Cpu',
  color: '#34495E',
  lessons: [
    {
      id: 'tool-qualidade',
      title: 'Qualidade de Código: vet, lint e segurança',
      description: 'go vet, go fmt, goimports, golangci-lint, staticcheck e govulncheck.',
      estimatedMinutes: 40,
      vesa: {
        visaoGeral: {
          explicacao: '`go fmt` formata código (padrão único, sem discussão). `go vet` detecta bugs sutis: printf errado, unreachable code, struct tags inválidos. `goimports` organiza imports automaticamente. `golangci-lint` executa 100+ linters em paralelo (staticcheck, revive, gosec). `govulncheck` verifica vulnerabilidades em dependências. `go build -gcflags="-m"` mostra escape analysis.',
          codeExample: '# Formatação — obrigatório\ngofmt -w .\ngoimports -w .\n\n# Análise estática\ngo vet ./...\n\n# Linting completo (100+ linters)\ngolangci-lint run ./...\n\n# Vulnerabilidades em dependências\ngovulncheck ./...\n\n# Build tags / cross-compilation\nGOOS=linux GOARCH=amd64 go build -o server-linux\nGOOS=darwin GOARCH=arm64 go build -o server-mac\n\n# Escape analysis\ngo build -gcflags="-m" ./...',
          recursos: [
            'https://pkg.go.dev/cmd/vet',
            'https://golangci-lint.run/',
            'https://pkg.go.dev/golang.org/x/vuln/cmd/govulncheck',
          ],
        },
        experimentacao: {
          desafio: 'Instale golangci-lint, configure um .golangci.yml e execute em um projeto real. Corrija todos os findings. Execute govulncheck para verificar vulnerabilidades.',
          dicas: [
            'golangci-lint: go install github.com/golangci-lint/golangci-lint/cmd/golangci-lint@latest',
            'govulncheck: go install golang.org/x/vuln/cmd/govulncheck@latest',
            'staticcheck detecta código morto e anti-patterns',
          ],
        },
        socializacao: {
          discussao: 'Qual o conjunto mínimo de ferramentas que todo projeto Go deveria ter no CI?',
          pontos: [
            'go vet + go test -race: mínimo absoluto',
            'golangci-lint: padrão de mercado para CI',
            'govulncheck: segurança de dependências',
          ],
          diasDesafio: 'Dias 91–96',
          sugestaoBlog: 'Tooling Go: do gofmt ao golangci-lint — qualidade de código automatizada',
          hashtagsExtras: '#golang #tooling #lint #security',
        },
        aplicacao: {
          projeto: 'Configure pipeline de qualidade: Makefile + golangci-lint + govulncheck + testes com race detector.',
          requisitos: [
            'Makefile com targets lint, test, vet',
            '.golangci.yml configurado',
            'govulncheck no pipeline',
          ],
          criterios: ['Zero warnings em vet/lint', 'Zero vulnerabilidades conhecidas', 'Testes sem race'],
        },
      },
    },
    {
      id: 'tool-performance',
      title: 'Profiling, Runtime e Otimização',
      description: 'pprof, trace, GC tuning, runtime internals (M:P:G) e benchmarks.',
      estimatedMinutes: 55,
      vesa: {
        visaoGeral: {
          explicacao: 'O Go runtime usa modelo M:P:G — M (OS threads), P (processadores lógicos), G (goroutines). O scheduler distribui goroutines entre threads. O GC é concurrent, tri-color mark-and-sweep, otimizado para baixa latência. `pprof` perfila CPU e memória. `trace` mostra execução detalhada (goroutines, GC, scheduling). Stack de goroutines começa com 2KB e cresce dinamicamente.',
          codeExample: 'package main\n\nimport (\n\t"net/http"\n\t_ "net/http/pprof" // registra handlers /debug/pprof\n\t"runtime"\n)\n\nfunc main() {\n\t// Expor profiling via HTTP\n\tgo func() {\n\t\thttp.ListenAndServe(":6060", nil)\n\t}()\n\n\t// Diagnóstico runtime\n\tprintln("Goroutines:", runtime.NumGoroutine())\n\tprintln("CPUs:", runtime.NumCPU())\n\tprintln("GOMAXPROCS:", runtime.GOMAXPROCS(0))\n\n\tvar m runtime.MemStats\n\truntime.ReadMemStats(&m)\n\tprintln("Alloc (MB):", m.Alloc/1024/1024)\n\tprintln("GC cycles:", m.NumGC)\n}\n\n// Profiling:\n// go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30\n// go tool pprof http://localhost:6060/debug/pprof/heap\n// go tool trace trace.out',
          recursos: [
            'https://go.dev/doc/gc-guide',
            'https://go.dev/blog/pprof',
            'https://pkg.go.dev/runtime/trace',
          ],
        },
        experimentacao: {
          desafio: 'Adicione pprof a um HTTP server, gere CPU e heap profiles, identifique o bottleneck mais caro e otimize.',
          dicas: [
            'import _ "net/http/pprof" — automático no default mux',
            'go tool pprof -http=:8081 profile.pb.gz — web UI',
            'GODEBUG=gctrace=1 mostra atividade do GC',
            'go build -gcflags="-m" mostra escape analysis',
          ],
        },
        socializacao: {
          discussao: 'Como o scheduler M:P:G do Go compara com threads do OS?',
          pontos: [
            'Goroutines: ~2KB stack vs threads: ~1-8MB',
            'Go scheduler: cooperative com preemption points',
            'Work-stealing entre P para balanceamento',
          ],
          diasDesafio: 'Dias 91–96',
          sugestaoBlog: 'Go Internals: M:P:G scheduler, GC e profiling com pprof',
          hashtagsExtras: '#golang #performance #pprof #runtime',
        },
        aplicacao: {
          projeto: 'Profile e otimize uma aplicação: CPU profile, heap profile, corrija alocações e meça melhoria.',
          requisitos: [
            'pprof ativo com endpoints /debug/pprof',
            'CPU e heap profiles coletados',
            'Bottleneck identificado e otimizado',
          ],
          criterios: ['Profiling executado', 'Bottleneck encontrado', 'Melhoria mensurável (benchmark)'],
        },
      },
    },
  ],
};
