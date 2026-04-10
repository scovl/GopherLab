# 🐺 Lobo's Contribution Guide — Cobra

Um guia prático e direto para contribuir ao Cobra com confiança. Siga este checklist antes de cada contribuição.

---

## 📋 Pré-Contribuição — Checklist Rápido

- [ ] Você tem **Go 1.21+** instalado?
- [ ] Você fez um **fork** do repositório?
- [ ] Você leu o [Code of Conduct](#código-de-conduta)?
- [ ] Você verificou issues existentes antes de abrir uma nova?
- [ ] Você já fez `go test ./...` ou `make test` com sucesso?

---

## 🐍 O que é Cobra?

Cobra é um **framework Go para construir CLIs modernas e poderosas**. Fornece:
- Estrutura de comandos com subcomandos e flags
- Auto-geração de documentação (man pages, markdown, REST)
- Suporte a shell completions (bash, zsh, fish, PowerShell)
- Estrutura professionalizada para builds de CLI

### Estrutura do Projeto

```
cobra/                           # Raiz do projeto
├── cobra.go                     # Tipo Command — coração do framework
├── command.go                   # Implementação principal do Command
├── command_win.go               # Variações Windows-específicas
├── command_notwin.go            # Variações Linux/macOS
├── args.go                      # Validadores de argumentos
├── flag_groups.go               # Agrupamento de flags
├── completions.go               # Lógica base de completions
├── bash_completions.go          # Gerador bash completions (v1)
├── bash_completionsV2.go        # Gerador bash completions (v2)
├── zsh_completions.go           # Gerador zsh completions
├── fish_completions.go          # Gerador fish completions
├── powershell_completions.go    # Gerador PowerShell completions
├── shell_completions.go         # Funções compartilhadas
├── active_help.go               # Sistema de active help
├── doc/                         # Geradores de documentação
│   ├── md_docs.go               # Markdown docs
│   ├── man_docs.go              # Man pages
│   ├── rest_docs.go             # REST API docs
│   ├── yaml_docs.go             # YAML docs
│   └── *_test.go                # Testes específicos
├── site/                        # Website/documentação
│   └── content/                 # Conteúdo do site
│       ├── user_guide.md        # Guia de uso
│       ├── completions/         # Docs sobre shell completions
│       └── docgen/              # Docs sobre geração de docs
└── *_test.go                    # Testes unitários
```

### Tipos Fundamentais

| Tipo | Arquivo | Responsabilidade |
|------|---------|-----------------|
| `Command` | `cobra.go`, `command.go` | Representa um comando CLI; contém Run, RunE, subcomandos, flags |
| `Flag` | Stdlib `flag` | Argumentos nomeados (--verbose, -v) |
| `Arg` | `args.go` | Validadores para argumentos posicionais |
| `Completer` | `*_completions.go` | Gera sugestões para shell específico |

---

## 🔄 Código de Conduta

Ao participar da comunidade Cobra, você concorda com nosso [Code of Conduct](CONDUCT.md):

✓ **Seja respeitoso** com todos os membros  
✓ **Seja educado** ao responder a dúvidas  
✓ **Reporte** qualquer assédio aos maintainers  
❌ **Nenhuma** forma de assédio será tolerada

---

## 🤝 Fazendo Perguntas

- **Dúvidas sobre uso?** → Pergunte no [#cobra Slack channel](https://gophers.slack.com/archives/CD3LP1199)
- **Dúvida sobre código?** → Abra uma [GitHub Discussion](https://github.com/spf13/cobra/discussions)
- **Encontrou bug?** → Abra uma [GitHub Issue](https://github.com/spf13/cobra/issues)

---

## 📝 Relatando Bugs e Sugerindo Features

### Antes de Abrir uma Issue

1. **Procure por issues existentes** — seu problema pode já estar reportado
2. Se encontrou uma parecida, comment lá ao invés de criar uma nova

### Ao Abrir uma Issue — Bug

Forneça:
1. **Versão do Cobra** — `go list -m github.com/spf13/cobra`
2. **Versão do Go** — `go version`
3. **Seu SO** — Windows/Linux/macOS
4. **Passos para reproduzir** — claro e conciso
5. **Comportamento esperado** — o que deveria acontecer
6. **Comportamento atual** — o que realmente acontece
7. **Logs/Erro** — completo, se disponível

**Exemplo:**
```
**Cobra Version:** v1.8.0
**Go Version:** 1.21
**OS:** macOS 14.1

**Describe the bug:**
Executando meu CLI com --unknown-flag causa panic.

**Steps to reproduce:**
1. Criar Command com `command.Run = func(cmd *Command, args []string) { }`
2. Executar com flag desconhecida: `./my-cli --unknown-flag`
3. Observe: panic em vez de erro gracioso

**Expected behavior:**
Deveria exibir uma mensagem de erro e ajuda.

**Error log:**
panic: flag provided but not defined: -unknown-flag
```

### Ao Abrir uma Issue — Feature Request

Forneça:
1. **Descrição clara** — o que você quer?
2. **Motivação** — por que seria útil?
3. **Exemplos de uso** — como você imagina usando?

---

## 🚀 Submitting Changes

### Antes de Começar

1. **Sincronize seu fork**
   ```bash
   git fetch origin
   git checkout main
   git pull origin main
   ```

2. **Crie um branch descritivo**
   ```bash
   git checkout -b fix/command-panic
   git checkout -b feat/custom-help-format
   ```

### Durante o Desenvolvimento

1. **Escreva testes** — Cobra exige testes para novo código
   ```bash
   go test ./... 
   make test          # Alias para testes + linting
   ```

2. **Formate corretamente**
   ```bash
   make all           # Executa fmt, vet e testes
   ```

3. **Comite com mensagens claras**
   ```bash
   git add command.go
   git commit -m "fix: prevent panic on unknown flags"
   ```

### Submitting Your Pull Request

1. **CLA** — Você será pedido para assinar um Contributor License Agreement (CLA)
   - Leia e assine quando solicitado
   - Necessário para todos os contribuidores

2. **Antes de submeter:**
   ```bash
   # Sincronizar com main
   git fetch origin
   git rebase origin/main
   
   # Rodar testes completos
   make test
   
   # Revisar seus commits
   git log origin/main..HEAD --oneline
   ```

3. **Título do PR** — siga a convenção:
   - ✓ `fix: prevent panic on unknown flags`
   - ✓ `feat: add custom help format option`
   - ❌ `fix stuff`
   - ❌ `changes`

4. **Descrição do PR** — inclua:
   - **O que muda:** descrição breve
   - **Por quê:** contexto/motivação
   - **Como testar:** passos para validar
   - **Closes #123** (se resolve uma issue)

---

## 🧪 Testes — Obrigatório para Novo Código

### Rodando Testes Localmente

```bash
# Testes completos
go test ./...

# Com verbose
go test -v ./...

# Um teste específico
go test -v -run TestCommandRun .

# Com cobertura
go test -cover ./...

# Usando Makefile
make test
```

### Padrão de Testes do Projeto

```go
package cobra_test

import (
    "testing"

    "github.com/spf13/cobra"
)

func TestCommandRun(t *testing.T) {
    cmd := &cobra.Command{
        Use:   "test",
        Short: "Test command",
        RunE: func(cmd *cobra.Command, args []string) error {
            return nil
        },
    }

    if err := cmd.Execute(); err != nil {
        t.Fatalf("expected no error, got %v", err)
    }
}
```

---

## 🔧 Code Style

### Go Standards

```bash
# Formatar código
gofmt -w .

# Validar (automaticamente em make all)
go vet ./...
```

### Convenções do Projeto

- Siga [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- Use nomes descritivos para variáveis e funções
- Adicione documentação em pacotes e funções públicas
- Mantenha funções pequenas e focadas

---

## 📚 Checklist Final antes de Submeter PR

- [ ] Você rodou `make test` e tudo passou?
- [ ] Você adicionou testes para seu novo código?
- [ ] Seu código está formatado com `gofmt`?
- [ ] Você atualizou documentação se necessário?
- [ ] Seu PR resolve apenas UMA issue ou feature?
- [ ] Você assinou o CLA se solicitado?
- [ ] Sua mensagem de commit é clara?

---

## 📖 Recursos Úteis

- **[README.md](README.md)** — Visão geral e exemplos rápidos
- **[User Guide](site/content/user_guide.md)** — Documentação completa
- **[Completions Guide](site/content/completions/_index.md)** — Como usar completions
- **[Doc Generation](site/content/docgen/_index.md)** — Auto-gerar docs
- **[#cobra Slack](https://gophers.slack.com/archives/CD3LP1199)** — Comunidade
- **[GitHub Discussions](https://github.com/spf13/cobra/discussions)** — Perguntas
- **[Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)** — Padrões Go

---

## 📜 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a **Apache License 2.0**.

---

**Boa sorte! 🚀 Dúvidas? Pergunte no #cobra Slack!**
