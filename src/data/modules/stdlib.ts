import { Module } from '../../types';

export const stdlibModule: Module = {
    id: 'pacotes-importantes',
    title: 'Standard Library',
    description: 'Domine os pacotes essenciais: I/O, HTTP, JSON, context, time, regexp e logging.',
    icon: 'Package',
    color: '#CE3262',
    lessons: [
      {
        id: 'pkg-io',
        title: 'I/O e Manipulação de Arquivos',
        description: 'os, io, bufio — leitura, escrita, Scanner e o padrão Reader/Writer.',
        estimatedMinutes: 40,
        vesa: {
          visaoGeral: {
            explicacao: 'Go usa interfaces para I/O: io.Reader (método Read(p []byte) (n int, err error)) e io.Writer (Write(p []byte) (n int, err error)) são a base de tudo --arquivos, conexões de rede, buffers de memória, tudo implementa essas interfaces. Lógica escrita para io.Reader funciona com qualquer fonte de dados. io.EOF é o valor de erro especial retornado quando não há mais dados para ler -- trate-o como condição normal de fim de stream.\n\nos.File implementa io.Reader, io.Writer, io.Seeker e io.Closer -- por isso funciona com qualquer função que aceita essas interfaces. defer f.Close() imediatamente após abrir/criar o arquivo é obrigatório para liberar file descriptor. Em operações de escrita com bufio.Writer, não esqueça de chamar w.Flush() -- dados no buffer não são escritos no disco até o flush ou o close.\n\nbufio adiciona bufferização para reduzir syscalls: bufio.NewReader envolve qualquer io.Reader com buffer interno (padrão 4096 bytes). bufio.Scanner simplifica leitura linha a linha -- Scan() retorna false no fim ou erro; Text() retorna a linha sem \\n; Err() retorna qualquer erro (exceto io.EOF). Para arquivos grandes, use io.Copy(dst, src) que usa um buffer interno de 32KB e evita carregar tudo na memória. io.ReadAll lê tudo de um Reader -- use com cuidado para dados de tamanho ilimitado.', 
            codeExample: 'package main\n\nimport (\n\t"bufio"\n\t"fmt"\n\t"io"\n\t"os"\n\t"strings"\n)\n\nfunc main() {\n\t// Escrever arquivo\n\tf, err := os.Create("teste.txt")\n\tif err != nil {\n\t\tfmt.Println("Erro:", err)\n\t\treturn\n\t}\n\tdefer f.Close()\n\n\tw := bufio.NewWriter(f)\n\tw.WriteString("Linha 1\\n")\n\tw.WriteString("Linha 2\\n")\n\tw.Flush()\n\n\t// Ler arquivo\n\tfile, _ := os.Open("teste.txt")\n\tdefer file.Close()\n\n\tscanner := bufio.NewScanner(file)\n\tfor scanner.Scan() {\n\t\tfmt.Println(scanner.Text())\n\t}\n\n\t// io.Reader universal — string como Reader\n\tr := strings.NewReader("dados")\n\tdata, _ := io.ReadAll(r)\n\tfmt.Println(string(data))\n}',
            recursos: [
              'https://gobyexample.com/reading-files',
              'https://gobyexample.com/writing-files',
              'https://pkg.go.dev/io',
            ],
          },
          experimentacao: {
            desafio: 'Crie um programa que: (1) leia um CSV e imprima em tabela formatada; (2) copie um arquivo usando io.Copy; (3) leia da stdin linha a linha.',
            dicas: [
              'encoding/csv para CSV ou bufio.Scanner para simples',
              'io.Copy(dst, src) copia entre Readers e Writers',
              'os.Stdin é um io.Reader — use bufio.NewScanner(os.Stdin)',
            ],
          },
          socializacao: {
            discussao: 'Por que tudo em Go implementa io.Reader/Writer? Qual a vantagem dessa abstração?',
            pontos: [
              'Código genérico: mesma função lê arquivo, rede, string',
              'Composição com io.TeeReader, io.MultiWriter',
              'Comparação com try-finally em Java vs defer em Go',
            ],
            diasDesafio: 'Dias 19–28',
            sugestaoBlog: 'I/O em Go: Reader, Writer, bufio e o poder das interfaces',
            hashtagsExtras: '#golang #io #files',
          },
          aplicacao: {
            projeto: 'Tail -f em Go: monitore mudanças em um arquivo de log em tempo real.',
            requisitos: [
              'Ler arquivo continuamente',
              'Detectar novas linhas adicionadas',
              'Exibir em tempo real no terminal',
            ],
            criterios: ['Uso correto de defer', 'Detect de EOF e retry', 'Eficiente em memória'],
          },
        },
      },
      {
        id: 'pkg-http-json',
        title: 'HTTP Client e JSON',
        description: 'Chamadas HTTP, encoding/json, struct tags e APIs externas.',
        estimatedMinutes: 45,
        vesa: {
          visaoGeral: {
            explicacao: 'net/http tem um cliente HTTP completo e configurável. http.DefaultClient tem timeout zero (nunca expira!) -- em produção, sempre use um cliente customizado: http.Client{Timeout: 30 * time.Second}. http.Get/Post são atalhos para o DefaultClient -- evite-os em serviços de produção. Para controle total (headers, method, body), use http.NewRequestWithContext(ctx, method, url, body).\n\nResponses HTTP retornam resp.Body como io.ReadCloser -- deve ser fechado com defer resp.Body.Close() para liberar a conexão de volta ao pool. Use json.NewDecoder(resp.Body).Decode(&v) para decodificar JSON diretamente do stream, sem carregar o body inteiro na memória. Sempre verifique resp.StatusCode: um status 404 não retorna err != nil -- o erro é nil porque a requisição HTTP foi bem-sucedida.\n\nencoding/json usa reflection para mapear campos de struct para JSON via struct tags. json:"nome" renomeia o campo; json:"nome,omitempty" omite se zero value; json:"-" exclui o campo completamente. Tipos não exportados (letra minúscula) são ignorados pelo encoder JSON. json.RawMessage armazena JSON bruto sem decodificar -- útil para nested JSON dinâmico. Para tipos customizados, implemente json.Marshaler/Unmarshaler. json.Number preserva números como string evitando perda de precisão em números grandes.', 
            codeExample: 'package main\n\nimport (\n\t"encoding/json"\n\t"fmt"\n\t"net/http"\n\t"io"\n)\n\ntype Post struct {\n\tID    int    `json:"id"`\n\tTitle string `json:"title"`\n\tBody  string `json:"body,omitempty"`\n}\n\nfunc main() {\n\t// GET request\n\tresp, err := http.Get("https://jsonplaceholder.typicode.com/posts/1")\n\tif err != nil {\n\t\tfmt.Println("Erro:", err)\n\t\treturn\n\t}\n\tdefer resp.Body.Close()\n\n\t// Decodificar JSON\n\tvar post Post\n\tif err := json.NewDecoder(resp.Body).Decode(&post); err != nil {\n\t\tfmt.Println("Erro JSON:", err)\n\t\treturn\n\t}\n\tfmt.Printf("Título: %s\\n", post.Title)\n\n\t// Marshal para JSON\n\tdata, _ := json.MarshalIndent(post, "", "  ")\n\tfmt.Println(string(data))\n\n\t_ = io.Discard // evitar import não usado\n}',
            recursos: [
              'https://gobyexample.com/http-clients',
              'https://gobyexample.com/json',
              'https://pkg.go.dev/encoding/json',
            ],
          },
          experimentacao: {
            desafio: 'Consuma a API ViaCEP (viacep.com.br/ws/{cep}/json/) — busque endereço por CEP informado pelo usuário e exiba formatado.',
            dicas: [
              'ViaCEP: https://viacep.com.br/ws/01001000/json/',
              'Struct tags mapeiam campos JSON para Go',
              'Verifique resp.StatusCode antes de decodificar',
            ],
          },
          socializacao: {
            discussao: 'Como Go trata erros HTTP comparado com try-catch de outras linguagens?',
            pontos: [
              'err != nil vs exceptions — erro explícito',
              'StatusCode vs error — são coisas diferentes em Go',
              'Context para timeout em requests HTTP',
            ],
            diasDesafio: 'Dias 19–28',
            sugestaoBlog: 'HTTP e JSON em Go: consumindo APIs sem exceções',
            hashtagsExtras: '#golang #http #json #api',
          },
          aplicacao: {
            projeto: 'Busca CEP: programa CLI que busca endereço por CEP via ViaCEP.',
            requisitos: [
              'Consumir API ViaCEP',
              'Exibir resultado formatado',
              'Tratar CEP inválido e erros de rede',
            ],
            criterios: ['Tratamento de erros HTTP', 'JSON parseado corretamente', 'Código idiomático'],
          },
        },
      },
      {
        id: 'pkg-http-server',
        title: 'Servidores HTTP e Templates',
        description: 'Criando servidores HTTP, multiplexers, middleware e templates.',
        estimatedMinutes: 50,
        vesa: {
          visaoGeral: {
            explicacao: 'Go tem servidor HTTP robusto na stdlib. `http.HandleFunc` registra rotas; `http.ListenAndServe` inicia. A partir do Go 1.22, o ServeMux suporta métodos HTTP e path params (`GET /users/{id}`). Templates com `html/template` renderizam HTML seguro (escape automático contra XSS). O handler `http.FileServer` serve arquivos estáticos.',
            codeExample: 'package main\n\nimport (\n\t"encoding/json"\n\t"fmt"\n\t"html/template"\n\t"net/http"\n)\n\nfunc main() {\n\tmux := http.NewServeMux()\n\n\t// Go 1.22+: método e path params\n\tmux.HandleFunc("GET /api/users/{id}", func(w http.ResponseWriter, r *http.Request) {\n\t\tid := r.PathValue("id")\n\t\tjson.NewEncoder(w).Encode(map[string]string{"id": id})\n\t})\n\n\t// Template HTML\n\tmux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {\n\t\ttmpl := template.Must(template.New("index").Parse(\n\t\t\t`<h1>Olá, {{.Nome}}!</h1>`,\n\t\t))\n\t\ttmpl.Execute(w, map[string]string{"Nome": "Gopher"})\n\t})\n\n\t// Arquivos estáticos\n\tmux.Handle("GET /static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./public"))))\n\n\tfmt.Println("Servidor rodando em :8080")\n\thttp.ListenAndServe(":8080", mux)\n}',
            recursos: [
              'https://gobyexample.com/http-servers',
              'https://pkg.go.dev/net/http',
              'https://pkg.go.dev/html/template',
            ],
          },
          experimentacao: {
            desafio: 'Crie um servidor HTTP com: (1) API JSON CRUD para "notas"; (2) frontend HTML com templates; (3) middleware de logging que imprime método, path e duração.',
            dicas: [
              'Middleware: func middleware(next http.Handler) http.Handler',
              'Templates: template.ParseFiles para arquivos .html',
              'Use map como "banco" em memória para começar',
            ],
          },
          socializacao: {
            discussao: 'Quando usar a standard library vs frameworks como Gin ou Chi?',
            pontos: [
              'Stdlib é suficiente para muitos casos (Go 1.22+ melhorou muito)',
              'Frameworks: middleware chain, validação, binding automático',
              'Performance: Go já é rápido — framework adiciona conveniência, não velocidade',
            ],
            diasDesafio: 'Dias 19–28',
            sugestaoBlog: 'Servidores HTTP em Go: net/http, templates e quando usar frameworks',
            hashtagsExtras: '#golang #http #server #webdev',
          },
          aplicacao: {
            projeto: 'Servidor de arquivos com upload, download e listagem via HTML templates.',
            requisitos: [
              'Endpoint de upload (multipart/form-data)',
              'Listagem de arquivos com template HTML',
              'Download de arquivos',
            ],
            criterios: ['Multiplexer correto', 'Templates funcionais', 'Segurança básica'],
          },
        },
      },
      {
        id: 'pkg-context-time',
        title: 'Context, Time e Regexp',
        description: 'context para cancelamento/timeout, time para datas e regexp para padrões.',
        estimatedMinutes: 45,
        vesa: {
          visaoGeral: {
            explicacao: 'O pacote `context` gerencia ciclo de vida de operações: cancelamento, timeouts e deadlines — fundamental em servidores HTTP e microsserviços. `context.Background()` é a raiz; `WithTimeout/WithCancel/WithDeadline` criam derivados. O pacote `time` manipula datas, durações, timers e tickers. `regexp` implementa RE2 para pattern matching seguro e eficiente.',
            codeExample: 'package main\n\nimport (\n\t"context"\n\t"fmt"\n\t"regexp"\n\t"time"\n)\n\nfunc operacaoLenta(ctx context.Context) error {\n\tselect {\n\tcase <-time.After(5 * time.Second):\n\t\treturn nil\n\tcase <-ctx.Done():\n\t\treturn ctx.Err() // context.DeadlineExceeded\n\t}\n}\n\nfunc main() {\n\t// Context com timeout\n\tctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)\n\tdefer cancel() // sempre chamar cancel!\n\n\tif err := operacaoLenta(ctx); err != nil {\n\t\tfmt.Println("Timeout:", err)\n\t}\n\n\t// Time\n\tagora := time.Now()\n\tfmt.Println(agora.Format("2006-01-02 15:04:05")) // layout fixo do Go\n\tduracao := 3 * time.Hour + 30 * time.Minute\n\tfmt.Println("Duração:", duracao)\n\n\t// Regexp\n\tre := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$`)\n\tfmt.Println(re.MatchString("user@go.dev"))  // true\n\tfmt.Println(re.MatchString("invalido"))      // false\n}',
            recursos: [
              'https://pkg.go.dev/context',
              'https://gobyexample.com/context',
              'https://gobyexample.com/time',
              'https://pkg.go.dev/regexp',
            ],
          },
          experimentacao: {
            desafio: 'Crie um HTTP client com timeout de 3s usando context. Depois, crie um validador de email/telefone usando regexp.MustCompile.',
            dicas: [
              'http.NewRequestWithContext(ctx, ...) passa context para request',
              'Sempre defer cancel() após criar context com timeout',
              'Go usa layout "2006-01-02 15:04:05" para formatar datas (referência fixa)',
            ],
          },
          socializacao: {
            discussao: 'Por que context é tão importante em microsserviços Go?',
            pontos: [
              'Propagação de cancelamento entre serviços',
              'Evita goroutine leaks (timeout mata trabalho pendente)',
              'Request-scoped values para tracing/auth',
            ],
            diasDesafio: 'Dias 19–28',
            sugestaoBlog: 'Context, Time e Regexp: os 3 pacotes que todo dev Go precisa dominar',
            hashtagsExtras: '#golang #context #time #regexp',
          },
          aplicacao: {
            projeto: 'HTTP client com retry, timeout configurável e cancelamento usando context.',
            requisitos: [
              'Context com timeout por request',
              'Retry com backoff exponencial',
              'Cancelamento propagado corretamente',
            ],
            criterios: ['Context usado corretamente', 'Sem goroutine leaks', 'Tratamento robusto'],
          },
        },
      },
      {
        id: 'pkg-logging',
        title: 'Logging: slog, Zap e Zerolog',
        description: 'Logging estruturado com slog (stdlib), Zap (Uber) e Zerolog.',
        estimatedMinutes: 35,
        vesa: {
          visaoGeral: {
            explicacao: 'O pacote `log` básico é suficiente para scripts. Para produção, use `log/slog` (Go 1.21+) que fornece logging estruturado com níveis (Debug, Info, Warn, Error), output JSON e handlers customizáveis. Alternativas populares: `zap` (Uber, alta performance) e `zerolog` (zero allocation, fluent API). Logging estruturado facilita busca, filtro e análise em ferramentas como ELK, Grafana Loki e Datadog.',
            codeExample: 'package main\n\nimport (\n\t"log/slog"\n\t"os"\n)\n\nfunc main() {\n\t// slog — stdlib Go 1.21+\n\tlogger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{\n\t\tLevel: slog.LevelDebug,\n\t}))\n\n\tlogger.Info("servidor iniciado",\n\t\tslog.String("addr", ":8080"),\n\t\tslog.Int("workers", 4),\n\t)\n\n\tlogger.Error("falha na conexão",\n\t\tslog.String("host", "db.local"),\n\t\tslog.Any("error", "connection refused"),\n\t)\n\n\t// Output JSON:\n\t// {"time":"...","level":"INFO","msg":"servidor iniciado","addr":":8080","workers":4}\n\t// {"time":"...","level":"ERROR","msg":"falha na conexão","host":"db.local","error":"connection refused"}\n}',
            recursos: [
              'https://pkg.go.dev/log/slog',
              'https://github.com/uber-go/zap',
              'https://github.com/rs/zerolog',
            ],
          },
          experimentacao: {
            desafio: 'Configure slog com handler JSON e níveis. Depois, instale zap (go get go.uber.org/zap) e compare a API e performance.',
            dicas: [
              'slog.SetDefault(logger) define logger global',
              'zap.NewProduction() cria logger otimizado',
              'zerolog: log.Info().Str("key", "val").Msg("mensagem")',
            ],
          },
          socializacao: {
            discussao: 'Quando usar slog (stdlib) vs Zap/Zerolog? Logging estruturado vale a complexidade?',
            pontos: [
              'slog: sem dependência externa, padrão da linguagem',
              'Zap: performance superior, production-ready',
              'Zerolog: zero-allocation, API fluent',
              'JSON para produção, texto para desenvolvimento',
            ],
            diasDesafio: 'Dias 19–28',
            sugestaoBlog: 'Logging em Go: slog, Zap e Zerolog — qual escolher?',
            hashtagsExtras: '#golang #logging #slog #observability',
          },
          aplicacao: {
            projeto: 'Configure logging para um servidor HTTP: slog com níveis, JSON em prod, texto em dev.',
            requisitos: [
              'Handler JSON para produção',
              'Handler texto para desenvolvimento',
              'Log de cada request com método, path e duração',
            ],
            criterios: ['Níveis corretos', 'Output estruturado', 'Fácil de filtrar'],
          },
        },
      },
    ],
};
