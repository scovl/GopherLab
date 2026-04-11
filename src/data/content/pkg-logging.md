---
title: "Logging: slog, Zap e Zerolog"
description: Logging estruturado com slog (stdlib), Zap (Uber) e Zerolog.
estimatedMinutes: 35
recursos:
  - https://pkg.go.dev/log/slog
  - https://github.com/uber-go/zap
  - https://github.com/rs/zerolog
experimentacao:
  desafio: Configure slog com handler JSON e níveis. Depois, instale zap (go get go.uber.org/zap) e compare a API e performance.
  dicas:
    - slog.SetDefault(logger) define logger global
    - zap.NewProduction() cria logger otimizado
    - "zerolog: log.Info().Str(key, val).Msg(mensagem)"
  codeTemplate: |
    package main

    import (
    	"log/slog"
    	"os"
    )

    func main() {
    	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    		Level: slog.LevelDebug,
    	}))
    	logger.Info("servidor iniciado",
    		slog.String("addr", ":8080"),
    		slog.Int("workers", 4),
    	)
    	logger.Error("falha na conexão",
    		slog.String("host", "db.local"),
    		slog.Any("error", "connection refused"),
    	)
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`slog.New(slog.NewJSONHandler(...))`** — cria um logger estruturado que emite JSON. `slog` (Go 1.21+) é o padrão moderno da stdlib para logging — substitui o `log` básico em aplicações de produção.

    **`slog.String("addr", ":8080")`** — campos tipados key-value. Ao contrário de `log.Printf("addr=%s", addr)`, campos estruturados são **pesquisáveis e filtráveis** em ferramentas como ELK, Grafana Loki e Datadog.

    **`HandlerOptions{Level: slog.LevelDebug}`** — configura o nível mínimo de log. Mensagens abaixo do nível são descartadas sem alocação. Níveis padrão: `Debug` (-4), `Info` (0), `Warn` (4), `Error` (8).

    **`slog.NewJSONHandler` vs `slog.NewTextHandler`** — JSON para produção (máquinas), texto para desenvolvimento (humanos). Troque o handler sem mudar nenhuma chamada de log no código.

    **`slog.SetDefault(logger)`** — define o logger como global. Após isso, `slog.Info(...)` usa o logger configurado. Permite configurar uma vez em `main()` e usar em todo o código.

    **Alternativas** — `zap` (Uber): performance máxima, zero allocation; `zerolog`: API fluent (`log.Info().Str(k,v).Msg(m)`), zero allocation. Ambos são mais rápidos que `slog` em benchmarks, mas `slog` não tem dependência externa.
socializacao:
  discussao: Quando usar slog (stdlib) vs Zap/Zerolog? Logging estruturado vale a complexidade?
  pontos:
    - "slog: sem dependência externa, padrão da linguagem"
    - "Zap: performance superior, production-ready"
    - "Zerolog: zero-allocation, API fluent"
    - JSON para produção, texto para desenvolvimento
  diasDesafio: Dias 19–28
  sugestaoBlog: "Logging em Go: slog, Zap e Zerolog — qual escolher?"
  hashtagsExtras: '#golang #logging #slog #observability'
aplicacao:
  projeto: Configure logging para um servidor HTTP com slog/níveis, JSON em prod, texto em dev.
  requisitos:
    - Handler JSON para produção
    - Handler texto para desenvolvimento
    - Log de cada request com método, path e duração
  criterios:
    - Níveis corretos
    - Output estruturado
    - Fácil de filtrar
  starterCode: |
    package main

    import (
    	"log/slog"
    	"os"
    )

    func configurarLogger(env string) *slog.Logger {
    	opts := &slog.HandlerOptions{}
    	if env == "dev" {
    		opts.Level = slog.LevelDebug
    		return slog.New(slog.NewTextHandler(os.Stdout, opts))
    	}
    	opts.Level = slog.LevelInfo
    	return slog.New(slog.NewJSONHandler(os.Stdout, opts))
    }

    func processarPedido(logger *slog.Logger, id int, produto string) {
    	logger.Info("pedido recebido",
    		slog.Int("pedido_id", id),
    		slog.String("produto", produto),
    	)
    	if produto == "" {
    		logger.Error("produto inválido",
    			slog.Int("pedido_id", id),
    			slog.String("erro", "produto vazio"),
    		)
    		return
    	}
    	logger.Debug("processando",
    		slog.Int("pedido_id", id),
    		slog.String("etapa", "validação"),
    	)
    	logger.Info("pedido finalizado",
    		slog.Int("pedido_id", id),
    		slog.String("status", "sucesso"),
    	)
    }

    func main() {
    	logger := configurarLogger("dev")
    	slog.SetDefault(logger)

    	processarPedido(logger, 1, "Curso Go")
    	processarPedido(logger, 2, "")
    	processarPedido(logger, 3, "Workshop Docker")
    }

---

O pacote `log` básico é suficiente para scripts. Para produção, use **`log/slog`** (Go 1.21+) que fornece logging estruturado com níveis (`Debug`, `Info`, `Warn`, `Error`), output JSON e handlers customizáveis.

## log/slog

```go
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelDebug,
}))

logger.Info("servidor iniciado",
    slog.String("addr", ":8080"),
    slog.Int("workers", 4),
)
// Output: {"time":"...","level":"INFO","msg":"servidor iniciado","addr":":8080","workers":4}
```

## Alternativas populares

| Pacote | Característica |
|---|---|
| `log/slog` (stdlib) | Padrão moderno, sem dependências |
| `go.uber.org/zap` | Alta performance, zero allocation |
| `github.com/rs/zerolog` | Zero allocation, fluent API |

## Logging estruturado vs não-estruturado

**Logging estruturado** (campos key-value em JSON) facilita busca, filtro e análise em ferramentas como ELK, Grafana Loki e Datadog. `log.Printf("user %s logged in", name)` não é pesquisável por campo; `logger.Info("login", slog.String("user", name))` é.

## Níveis e filtragem

Use `slog.SetDefault(logger)` para definir o logger global. Configure o nível mínimo via `HandlerOptions.Level` ou via variável de ambiente com um handler customizado.
