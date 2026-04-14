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

## Por que `fmt.Println` não serve para logs em produção?

Quando você está aprendendo Go, é natural usar `fmt.Println("deu erro aqui")` para debugar. E funciona! Mas em produção, imagine um servidor com milhares de requests por segundo. Você precisa saber:

- **Quando** aconteceu? (data e hora)
- **Qual a gravidade?** (é só informação, aviso ou erro crítico?)
- **Que dados estavam envolvidos?** (qual usuário, qual request?)

Com `fmt.Println`, você tem texto solto. Com **logging estruturado**, você tem dados organizados que ferramentas conseguem filtrar e pesquisar.

```
// ❌ fmt.Println — texto solto, impossível de filtrar
erro ao conectar no banco

// ✅ slog — JSON estruturado, pesquisável por qualquer campo
{"time":"2024-01-15T10:30:00Z","level":"ERROR","msg":"erro ao conectar","host":"db.local","tentativa":3}
```

---

## Os 3 pacotes de logging do Go

| Pacote | De onde vem | Para que serve |
|---|---|---|
| `log` | stdlib (antigo) | Scripts simples, protótipos |
| `log/slog` | stdlib (Go 1.21+) | **Produção** — logging estruturado moderno |
| `zap` / `zerolog` | Terceiros | Performance extrema, zero alocação |

Nesta lição, focamos no `slog` — é o padrão moderno e não precisa instalar nada.

---

## `slog` — logging estruturado em 5 minutos

### O logger mais simples possível

```go
package main

import "log/slog"

func main() {
    slog.Info("servidor iniciado")
    slog.Warn("disco quase cheio")
    slog.Error("falha na conexão")
}
```

Saída:
```
2024/01/15 10:30:00 INFO servidor iniciado
2024/01/15 10:30:00 WARN disco quase cheio
2024/01/15 10:30:00 ERROR falha na conexão
```

Já tem data, hora e nível. Mas a mágica vem com **campos estruturados**:

### Adicionando dados aos logs

```go
slog.Info("pedido recebido",
    slog.Int("pedido_id", 42),
    slog.String("produto", "Curso Go"),
    slog.Float64("valor", 97.90),
)
// 2024/01/15 10:30:00 INFO pedido recebido pedido_id=42 produto="Curso Go" valor=97.9
```

Cada `slog.String`, `slog.Int`, etc. adiciona um **campo chave-valor**. Em vez de texto misturado, cada dado tem seu nome. Isso permite buscar "me mostra todos os logs onde pedido_id=42".

### Os 4 níveis de log

| Nível | Valor | Quando usar | Exemplo |
|---|---|---|---|
| `Debug` | -4 | Detalhes internos (só para desenvolvimento) | "entrando na função X" |
| `Info` | 0 | Eventos normais do sistema | "servidor iniciou na porta 8080" |
| `Warn` | 4 | Algo estranho, mas não quebrou | "disco com 90% de uso" |
| `Error` | 8 | Algo deu errado | "falha ao conectar no banco" |

> **Analogia:** pense nos níveis como um **semáforo**. Debug = verde (tudo normal, detalhes), Info = verde (ok), Warn = amarelo (atenção!), Error = vermelho (parou!).

### Filtrando por nível

Em produção, você não quer 10.000 mensagens Debug por segundo. Configure o nível mínimo:

```go
logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo,  // Ignora Debug, mostra Info/Warn/Error
}))
logger.Debug("isso NÃO aparece")  // abaixo do nível — descartado
logger.Info("isso aparece")       // no nível ou acima — impresso
```

---

## JSON para máquinas, Texto para humanos

O `slog` tem dois handlers (formatos de saída):

```go
// Para DESENVOLVIMENTO — texto legível para humanos
logger := slog.New(slog.NewTextHandler(os.Stdout, opts))
// time=2024-01-15T10:30:00 level=INFO msg="servidor iniciado" addr=:8080

// Para PRODUÇÃO — JSON que ferramentas conseguem parsear
logger := slog.New(slog.NewJSONHandler(os.Stdout, opts))
// {"time":"2024-01-15T10:30:00","level":"INFO","msg":"servidor iniciado","addr":":8080"}
```

| Handler | Formato | Quando usar |
|---|---|---|
| `NewTextHandler` | `key=value` legível | Rodando no terminal, durante desenvolvimento |
| `NewJSONHandler` | JSON | Produção, quando logs vão para ELK/Grafana/Datadog |

> **Dica prática:** troque o handler baseado em variável de ambiente: `dev` usa texto, `prod` usa JSON. Nenhuma linha de log precisa mudar.

### Padrão de configuração para projetos reais

```go
func configurarLogger(env string) *slog.Logger {
    opts := &slog.HandlerOptions{}
    if env == "dev" {
        opts.Level = slog.LevelDebug       // dev: mostra tudo
        return slog.New(slog.NewTextHandler(os.Stdout, opts))
    }
    opts.Level = slog.LevelInfo            // prod: Info ou acima
    return slog.New(slog.NewJSONHandler(os.Stdout, opts))
}

func main() {
    logger := configurarLogger(os.Getenv("APP_ENV"))
    slog.SetDefault(logger)  // agora slog.Info() etc. usam esse logger

    slog.Info("servidor pronto", slog.String("env", os.Getenv("APP_ENV")))
}
```

`slog.SetDefault(logger)` define o logger como **global** — depois disso, `slog.Info(...)` em qualquer lugar do código usa a configuração que você definiu no `main()`.

---

## Comparação com Zap e Zerolog

Para a maioria dos projetos, `slog` é suficiente. Mas se você precisa de performance extrema (milhões de logs/segundo), existem duas alternativas populares:

### Zap (da Uber)

```go
import "go.uber.org/zap"

logger, _ := zap.NewProduction()
defer logger.Sync()

logger.Info("pedido recebido",
    zap.Int("pedido_id", 42),
    zap.String("produto", "Curso Go"),
)
```

### Zerolog

```go
import "github.com/rs/zerolog/log"

log.Info().
    Int("pedido_id", 42).
    Str("produto", "Curso Go").
    Msg("pedido recebido")
```

### Qual escolher?

| Critério | `slog` | `zap` | `zerolog` |
|---|---|---|---|
| Precisa instalar? | Não (stdlib) | Sim | Sim |
| Performance | Boa | Excelente | Excelente |
| Zero alocação | Não | Sim | Sim |
| API | Funções com args | Campos tipados | Fluent (encadeada) |
| Quando usar | Maioria dos projetos | Alta performance | Alta performance |

> **Regra prática:** comece com `slog`. Só mude para Zap/Zerolog se os benchmarks do **seu** projeto mostrarem que logging é gargalo — e isso é raro.

---

## Integrando slog num servidor HTTP

Lembra do middleware de logging da lição anterior? Aqui está ele modernizado com `slog`:

```go
func logMiddleware(logger *slog.Logger, next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        logger.Info("request",
            slog.String("method", r.Method),
            slog.String("path", r.URL.Path),
            slog.Duration("duration", time.Since(start)),
        )
    })
}
```

Com `log.Printf`, um log ficaria:
```
2024/01/15 10:30:00 GET /api/users 1.234ms
```

Com `slog.Info`, fica JSON pesquisável:
```json
{"time":"2024-01-15T10:30:00Z","level":"INFO","msg":"request","method":"GET","path":"/api/users","duration":"1.234ms"}
```

Agora você pode filtrar no Grafana Loki ou Datadog por `method=POST`, por `path=/api/users`, ou alertar quando `duration > 2s` — impossível com texto puro.

---

## Erros comuns de iniciantes

### 1. Logar a senha do usuário

```go
// ❌ NUNCA logue dados sensíveis!
slog.Info("login", slog.String("senha", user.Password))

// ✅ Logue apenas o necessário para debug
slog.Info("login", slog.String("user", user.Email))
```

### 2. Usar `fmt.Println` em vez de logger

```go
// ❌ Sem data, sem nível, sem estrutura
fmt.Println("erro:", err)

// ✅ Estruturado e filtrável
slog.Error("falha na operação", slog.Any("error", err))
```

### 3. Esquecendo que Error não para o programa

```go
slog.Error("banco offline")  // imprime o log...
// ... mas o programa CONTINUA executando!
// Se precisa parar, use log.Fatal ou retorne o erro
```
