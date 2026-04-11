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

**Cobra** é o framework CLI padrão em Go — usado por Docker, Kubernetes, Hugo e GitHub CLI. Oferece subcomandos, flags, autocompletação e help automático.

## Estrutura básica com Cobra

```go
var rootCmd = &cobra.Command{
    Use:   "mytool",
    Short: "Minha ferramenta CLI",
}

var serveCmd = &cobra.Command{
    Use:   "serve",
    Short: "Inicia o servidor",
    RunE: func(cmd *cobra.Command, args []string) error {
        port, _ := cmd.Flags().GetInt("port")
        return startServer(port)
    },
}

func init() {
    serveCmd.Flags().Int("port", 8080, "Porta do servidor")
    rootCmd.AddCommand(serveCmd)
}
```

## Viper — configuração de múltiplas fontes

`Viper` gerencia configuração com precedência: flags > env vars > arquivo de config > defaults:

```go
viper.SetDefault("port", 8080)
viper.BindPFlag("port", cmd.Flags().Lookup("port"))
viper.AutomaticEnv()  // PORT, DATABASE_URL, etc.
viper.ReadInConfig()   // config.yaml, config.json, etc.

port := viper.GetInt("port")
```

## go:embed — assets estáticos no binário

`go:embed` (Go 1.16+) embute arquivos no binário — sem dependências em tempo de execução:

```go
//go:embed templates/*.html
var templates embed.FS

//go:embed data/seed.json
var seedData []byte
```

Ideal para templates, configs, dados de seed, certificados.
