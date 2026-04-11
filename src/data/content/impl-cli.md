---
title: CLIs com Cobra e go:embed
description: Cobra para CLIs profissionais, Viper para config e go:embed para assets.
estimatedMinutes: 45
recursos:
  - https://github.com/spf13/cobra
  - https://github.com/spf13/viper
  - https://pkg.go.dev/embed
experimentacao:
  desafio: "Crie uma CLI com Cobra: 3 subcomandos, flags, config via Viper (arquivo YAML + env vars) e assets embeddados com go:embed."
  dicas:
    - cobra-cli init && cobra-cli add serve
    - "Viper: viper.SetConfigFile(\"config.yaml\")"
    - "go:embed: //go:embed static/* acima de var"
  codeTemplate: |
    package main

    import (
    	"embed"
    	"fmt"
    	"html/template"
    	"os"

    	"github.com/spf13/cobra"
    	"github.com/spf13/viper"
    )

    //go:embed templates/*.tmpl
    var templates embed.FS

    var rootCmd = &cobra.Command{
    	Use:   "devtool",
    	Short: "Ferramenta de desenvolvimento Go",
    }

    var initCmd = &cobra.Command{
    	Use:   "init [nome]",
    	Short: "Inicializa um novo projeto",
    	Args:  cobra.ExactArgs(1),
    	RunE: func(cmd *cobra.Command, args []string) error {
    		nome := args[0]
    		tmpl, err := template.ParseFS(templates, "templates/main.tmpl")
    		if err != nil {
    			return fmt.Errorf("template: %w", err)
    		}
    		os.MkdirAll(nome, 0o755)
    		f, _ := os.Create(nome + "/main.go")
    		defer f.Close()
    		return tmpl.Execute(f, map[string]string{"Name": nome})
    	},
    }

    var serveCmd = &cobra.Command{
    	Use:   "serve",
    	Short: "Inicia servidor de desenvolvimento",
    	RunE: func(cmd *cobra.Command, args []string) error {
    		port := viper.GetInt("port")
    		fmt.Printf("Servidor em :%d\n", port)
    		return nil
    	},
    }

    func init() {
    	serveCmd.Flags().IntP("port", "p", 8080, "Porta do servidor")
    	viper.BindPFlag("port", serveCmd.Flags().Lookup("port"))
    	viper.SetEnvPrefix("DEVTOOL")
    	viper.AutomaticEnv()
    	rootCmd.AddCommand(initCmd, serveCmd)
    }

    func main() {
    	if err := rootCmd.Execute(); err != nil {
    		os.Exit(1)
    	}
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`cobra.Command`** — cada comando tem `Use` (sintaxe de uso), `Short` (descrição), `Args` (validação), e `RunE` (execução com error). `cobra.ExactArgs(1)` garante exatamente 1 argumento. Cobra gera `--help` automaticamente para cada comando.

    **Árvore de comandos** — `rootCmd.AddCommand(initCmd, serveCmd)` cria `devtool init` e `devtool serve`. Subcomandos podem ter subcomandos: `rootCmd → apiCmd → api.listCmd`. Docker, Kubernetes e Hugo usam exatamente esse padrão.

    **`viper.BindPFlag`** — conecta a flag `--port` ao Viper. Precedência de config: (1) flags CLI, (2) env vars (`DEVTOOL_PORT`), (3) arquivo config (`config.yaml`), (4) defaults. `viper.AutomaticEnv()` lê variáveis com prefixo `DEVTOOL_`.

    **`//go:embed templates/*.tmpl`** — embute todos os `.tmpl` do diretório `templates/` no binário. O resultado é um `embed.FS` que implementa `fs.FS` — pode ser usado com `template.ParseFS`, `http.FileServer`, etc. O binário final é auto-contido.

    **`RunE` vs `Run`** — `RunE` retorna `error`, permitindo que Cobra exiba a mensagem e o usage automaticamente. Prefira `RunE` sempre; `Run` ignora erros silenciosamente.

    **Cross-compilation** — `GOOS=linux GOARCH=amd64 go build` gera binário Linux a partir de qualquer OS. Com `go:embed`, templates e assets vão junto. Resultado: **um binário, zero dependências**.
socializacao:
  discussao: Por que tantas ferramentas DevOps são escritas em Go?
  pontos:
    - Binário único – sem runtime/dependências
    - "Cross-compilation: GOOS=linux go build"
    - go:embed elimina necessidade de bundler
  diasDesafio: Dias 83–90
  sugestaoBlog: "CLIs em Go com Cobra, Viper e go:embed: ferramentas profissionais"
  hashtagsExtras: '#golang #cli #cobra'
aplicacao:
  projeto: CLI de automação com Cobra, Viper config e templates embeddados.
  requisitos:
    - Múltiplos comandos e subcomandos
    - Config via YAML + env vars
    - Templates estáticos com go:embed
  criterios:
    - CLI usável
    - Config flexível
    - Binário auto-contido
  starterCode: |
    package main

    import (
    	"embed"
    	"fmt"
    	"os"

    	"github.com/spf13/cobra"
    	"github.com/spf13/viper"
    )

    //go:embed configs/default.yaml
    var defaultConfig []byte

    var rootCmd = &cobra.Command{
    	Use:   "taskctl",
    	Short: "Gerenciador de tarefas CLI",
    }

    // TODO: implemente addCmd — "taskctl add <titulo>"
    //   - Salve em arquivo JSON local (~/.taskctl/tasks.json)
    //   - Flag --priority com valores "low", "medium", "high"

    // TODO: implemente listCmd — "taskctl list"
    //   - Leia do JSON e exiba formatado
    //   - Flag --filter com valores "all", "done", "pending"

    // TODO: implemente doneCmd — "taskctl done <id>"
    //   - Marque tarefa como concluída

    // TODO: implemente configCmd — "taskctl config"
    //   - Mostre configuração atual (Viper)
    //   - Suporte config.yaml + env vars (TASKCTL_*)

    func init() {
    	viper.SetConfigName("config")
    	viper.AddConfigPath("$HOME/.taskctl")
    	viper.SetEnvPrefix("TASKCTL")
    	viper.AutomaticEnv()
    	viper.ReadInConfig()
    	// rootCmd.AddCommand(addCmd, listCmd, doneCmd, configCmd)
    }

    func main() {
    	_ = defaultConfig
    	_ = embed.FS{}
    	if err := rootCmd.Execute(); err != nil {
    		fmt.Fprintln(os.Stderr, err)
    		os.Exit(1)
    	}
    }

---

## O que é uma CLI?

CLI (Command Line Interface) é um programa que roda no terminal. Você já usa várias todo dia:

```bash
git commit -m "minha mensagem"
docker compose up -d
go run main.go
```

Cada uma dessas ferramentas é uma **CLI**. E um fato surpreendente: Docker, Kubernetes, Hugo, GitHub CLI e Terraform — todas escritas em Go, todas usando o mesmo framework: **Cobra**.

> **Por que Go é perfeito para CLIs?** O binário final é **um arquivo só**, sem dependências. Não precisa instalar Java, Python ou Node. Copia o arquivo, roda. Funciona em qualquer sistema operacional.

---

## Cobra — o framework que todo mundo usa

Cobra organiza sua CLI em **comandos**, cada um com suas **flags** (opções):

```
mytool serve --port 3000        ← comando "serve" com flag --port
mytool init meu-projeto         ← comando "init" com argumento "meu-projeto"
mytool --help                   ← help automático (Cobra gera para você!)
```

### Anatomia de um comando Cobra

```go
var serveCmd = &cobra.Command{
    Use:   "serve",              // como o usuário digita
    Short: "Inicia o servidor",  // descrição curta (aparece no --help)
    RunE: func(cmd *cobra.Command, args []string) error {
        port, _ := cmd.Flags().GetInt("port")
        fmt.Printf("Servidor rodando na porta %d\n", port)
        return nil
    },
}
```

| Campo | O que faz | Exemplo |
|---|---|---|
| `Use` | Nome do comando | `"serve"` → `mytool serve` |
| `Short` | Descrição no help | Aparece ao rodar `mytool --help` |
| `RunE` | Função que executa | Recebe flags e args, retorna `error` |
| `Args` | Valida argumentos | `cobra.ExactArgs(1)` = exige 1 argumento |

### Montando a árvore de comandos

Uma CLI é uma **árvore**: o comando raiz tem subcomandos, que podem ter sub-subcomandos:

```
mytool (raiz)
├── serve     ← mytool serve --port 3000
├── init      ← mytool init meu-projeto
└── config    ← mytool config
    ├── set   ← mytool config set chave valor
    └── get   ← mytool config get chave
```

Em código:

```go
// Comando raiz — é ele que roda quando você digita "mytool"
var rootCmd = &cobra.Command{
    Use:   "mytool",
    Short: "Minha ferramenta CLI em Go",
}

// Subcomandos
var serveCmd = &cobra.Command{ Use: "serve", Short: "Inicia servidor", RunE: runServe }
var initCmd  = &cobra.Command{ Use: "init [nome]", Short: "Cria novo projeto", RunE: runInit }

func init() {
    // Registra as flags
    serveCmd.Flags().IntP("port", "p", 8080, "Porta do servidor")
    //                      ↑       ↑    ↑         ↑
    //                   nome    atalho  default  descrição

    // Monta a árvore
    rootCmd.AddCommand(serveCmd, initCmd)
}

func main() {
    if err := rootCmd.Execute(); err != nil {
        os.Exit(1)
    }
}
```

### `RunE` vs `Run` — sempre use `RunE`

```go
// ❌ Run — ignora erros silenciosamente
Run: func(cmd *cobra.Command, args []string) {
    err := fazerAlgo()  // se der erro, ninguém sabe
}

// ✅ RunE — Cobra exibe o erro e o help automaticamente
RunE: func(cmd *cobra.Command, args []string) error {
    return fazerAlgo()  // Cobra cuida de mostrar o erro
}
```

### O que Cobra gera de graça para você

Sem escrever uma linha de código extra, você ganha:

- `mytool --help` — documentação completa
- `mytool serve --help` — help específico do subcomando
- Erros de uso: `mytool serve --porta 3000` → "unknown flag: --porta"
- Sugestões: `mytool serv` → "Did you mean 'serve'?"
- Autocompletação para bash, zsh, fish e PowerShell

---

## Flags — opções da linha de comando

### Tipos de flags

```go
// Flag com atalho (-p)
serveCmd.Flags().IntP("port", "p", 8080, "Porta")
// mytool serve --port 3000
// mytool serve -p 3000          ← atalho

// Flag booleana
serveCmd.Flags().BoolP("verbose", "v", false, "Modo verboso")
// mytool serve --verbose
// mytool serve -v

// Flag de string
serveCmd.Flags().StringP("config", "c", "", "Arquivo de config")
// mytool serve --config prod.yaml
```

### Flags obrigatórias

```go
serveCmd.Flags().String("database", "", "URL do banco")
serveCmd.MarkFlagRequired("database")
// Agora: mytool serve  → erro "required flag 'database' not set"
```

### Validando argumentos

```go
var initCmd = &cobra.Command{
    Use:  "init [nome]",
    Args: cobra.ExactArgs(1),  // exige exatamente 1 argumento
    RunE: func(cmd *cobra.Command, args []string) error {
        nome := args[0]  // "meu-projeto"
        fmt.Println("Criando projeto:", nome)
        return nil
    },
}
```

| Validação | O que faz |
|---|---|
| `cobra.NoArgs` | Não aceita argumentos |
| `cobra.ExactArgs(n)` | Exige exatamente N |
| `cobra.MinimumNArgs(n)` | Mínimo N argumentos |
| `cobra.RangeArgs(min, max)` | Entre min e max |

---

## Viper — configuração que vem de todo lugar

Na vida real, sua CLI precisa de configuração: porta do servidor, URL do banco, modo debug. Essas configs podem vir de vários lugares. O **Viper** unifica tudo:

```
Precedência (quem ganha):
1. 🏆 Flags da CLI          --port 3000
2. 🥈 Variáveis de ambiente  PORT=3000
3. 🥉 Arquivo de config      config.yaml → port: 3000
4.    Default                 8080
```

> **Analogia:** pense no Viper como um **garçom** que pergunta sua preferência de várias formas. Primeiro olha se você pediu direto (flag), depois olha o cardápio do dia (env var), depois o cardápio padrão (arquivo), e por último serve o prato do dia (default).

### Configurando o Viper passo a passo

```go
func init() {
    // 1. Flags
    serveCmd.Flags().IntP("port", "p", 8080, "Porta")

    // 2. Conecta flag ao Viper
    viper.BindPFlag("port", serveCmd.Flags().Lookup("port"))

    // 3. Env vars com prefixo (MYTOOL_PORT, MYTOOL_DATABASE, etc.)
    viper.SetEnvPrefix("MYTOOL")
    viper.AutomaticEnv()

    // 4. Arquivo de config
    viper.SetConfigName("config")          // nome sem extensão
    viper.AddConfigPath("$HOME/.mytool")   // onde procurar
    viper.AddConfigPath(".")               // também no diretório atual
    viper.ReadInConfig()                    // lê se existir (sem erro se não existir)
}
```

### Usando os valores (não importa de onde vieram)

```go
RunE: func(cmd *cobra.Command, args []string) error {
    port := viper.GetInt("port")           // pode ter vindo de flag, env ou arquivo
    database := viper.GetString("database")
    verbose := viper.GetBool("verbose")

    fmt.Printf("Porta: %d, DB: %s, Verbose: %v\n", port, database, verbose)
    return nil
},
```

### Arquivo config.yaml de exemplo

```yaml
port: 3000
database: "postgres://localhost/mydb"
verbose: true
```

O Viper suporta YAML, JSON, TOML e até configs remotas (etcd, Consul).

---

## `go:embed` — empacotando arquivos dentro do binário

### O problema

Sua CLI tem templates HTML, arquivos de config padrão, dados de seed. Se forem arquivos separados, o usuário precisa copiar tudo junto com o binário. Chatice.

### A solução: `go:embed`

```go
import "embed"

//go:embed templates/main.tmpl
var mainTemplate string  // o conteúdo do arquivo vira uma string!

//go:embed data/seed.json
var seedData []byte      // ou um []byte

//go:embed static/*
var staticFiles embed.FS // uma pasta inteira!
```

> **O que acontece:** na hora de compilar, Go **copia o conteúdo dos arquivos para dentro do binário**. O resultado é um executável único que carrega tudo que precisa. Não depende de nenhum arquivo externo.

### Regras do `go:embed`

| Regra | Exemplo |
|---|---|
| O comentário `//go:embed` precisa estar **colado** na variável | Sem linha em branco entre eles |
| `string` ou `[]byte` para um arquivo | `//go:embed config.yaml` + `var cfg string` |
| `embed.FS` para pasta ou vários arquivos | `//go:embed templates/*` + `var fs embed.FS` |
| Só funciona com variáveis do **pacote** | Não funciona dentro de função |

### Exemplo prático: template embeddado

```go
//go:embed templates/*.tmpl
var templates embed.FS

func gerarProjeto(nome string) error {
    // ParseFS lê do embed.FS como se fosse um sistema de arquivos
    tmpl, err := template.ParseFS(templates, "templates/main.tmpl")
    if err != nil {
        return fmt.Errorf("template: %w", err)
    }

    f, err := os.Create(nome + "/main.go")
    if err != nil {
        return err
    }
    defer f.Close()

    return tmpl.Execute(f, map[string]string{"Name": nome})
}
```

---

## Cross-compilation — compilando para outro sistema

Uma das maiores vantagens de Go para CLIs:

```bash
# Você está no Windows, mas quer gerar binário para Linux:
GOOS=linux GOARCH=amd64 go build -o mytool-linux

# Para Mac:
GOOS=darwin GOARCH=arm64 go build -o mytool-mac

# Para Windows (de qualquer lugar):
GOOS=windows GOARCH=amd64 go build -o mytool.exe
```

| Variável | Valores comuns |
|---|---|
| `GOOS` | `linux`, `darwin` (Mac), `windows` |
| `GOARCH` | `amd64` (Intel/AMD 64bit), `arm64` (Apple Silicon, ARM) |

Com `go:embed`, templates e assets vão junto no binário. Resultado: **um arquivo, zero dependências, qualquer plataforma**.

---

## Resumo — montando uma CLI profissional

| Componente | Ferramenta | O que faz |
|---|---|---|
| Comandos e flags | **Cobra** | Estrutura da CLI, help automático, validação |
| Configuração | **Viper** | Unifica flags + env vars + arquivo YAML |
| Assets no binário | **go:embed** | Templates, configs e dados dentro do executável |
| Multi-plataforma | `GOOS`/`GOARCH` | Um código, qualquer sistema operacional |
