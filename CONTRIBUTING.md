# Guia de Contribuição — AprendaGo

---

## Requisitos

- Go 1.22+, Node.js 20+, Docker e Docker Compose
- Fork do repositório antes de qualquer PR

---

## Comandos Rápidos

```bash
make help          # lista todos os targets disponíveis

make up            # sobe em produção (porta 3000)
make dev           # hot reload (porta 3001)
make down          # derruba os containers
make logs          # acompanha logs em tempo real

make test          # roda todos os testes (Go + TypeScript)
make test-go       # testes Go via Docker (com race detector)
make test-go-local # testes Go sem Docker
make test-ts       # verifica tipos TypeScript

make lint          # go vet + tsc --noEmit
make fmt           # gofmt + goimports no runner/
make build         # build do frontend (tsc + vite)
```

---

## Estrutura

```
src/
  components/   # React — VesaPhases, LessonView, RoadmapView, RoadmapTree
  context/      # ProgressContext, AccessibilityContext
  data/
    roadmap.ts  # conteúdo: módulos, lições, fases VESA
  types/
    index.ts    # VesaPhase, VesaContent, Lesson, Module, UserProgress
runner/
  main.go       # HTTP API: POST /run, GET /health
  main_test.go  # testes unitários e de integração
```

---

## Ciclo VESA

Cada lição em `roadmap.ts` tem 4 fases obrigatórias:

| Chave | Conteúdo |
|-------|----------|
| `visaoGeral` | Explicação, exemplo de código, links |
| `experimentacao` | Desafio prático, dicas, template |
| `socializacao` | Discussão, pontos de reflexão, sugestão de blog |
| `aplicacao` | Projeto final, requisitos, critérios |

---

## Fluxo de Contribuição

```bash
git checkout main && git pull origin main
git checkout -b fix/descricao-curta   # ou feat/, content/, docs:

# desenvolva...

make lint          # obrigatório — sem erros
make test          # obrigatório — todos passando
make build         # obrigatório — sem erros TypeScript

git rebase origin/main
git push origin <branch>
# abra o PR
```

### Convenção de commits

```
fix: corrigir saída vazia no painel de execução
feat: adicionar módulo de WebSockets
content: adicionar lição sobre goroutines
docs: atualizar guia de contribuição
refactor: extrair componente de editor
```

---

## Estilo de Código

### Go (`runner/`)

- Erros tratados — nunca `_` para ignorar
- Constantes para strings literais repetidas
- Sem `panic` em produção — retorne `error`
- `context.Context` em operações com I/O ou timeout
- Funções exportadas com comentário de documentação

```go
// runCode executa o código do usuário em sandbox isolado.
func runCode(ctx context.Context, code string) (string, error) {
    if code == "" {
        return "", errors.New("código vazio")
    }
    return output, nil
}
```

### TypeScript/React (`src/`)

- Props como `Readonly<Props>`
- `useMemo` em valores de contexto
- HTML semântico (`<section>`, `<nav>`, `<button>`) — evite `<div role=...>`
- `key` em listas dinâmicas: use IDs únicos, nunca índices
- Sem `any` — tipos em `src/types/index.ts`
- `useCallback` para handlers passados como props

### CSS (`src/index.css`)

- Prefixos: `vesa-*` (ciclo VESA) e `rt-*` (RoadmapTree)
- Variáveis CSS em vez de valores hardcoded
- Contraste mínimo WCAG AA (4.5:1)
- `rem` em vez de `px` para fontes

---

## Adicionando Lições ao Roadmap

Edite `src/data/roadmap.ts` — todas as 4 fases são obrigatórias:

```typescript
{
  id: 'modulo-nome-da-licao',
  title: 'Título da Lição',
  description: 'Breve descrição.',
  estimatedMinutes: 40,
  vesa: {
    visaoGeral: {
      explicacao: 'Explicação do conceito.',
      codeExample: 'package main\n\nfunc main() {}', // opcional
      recursos: ['https://go.dev/doc/...'],
    },
    experimentacao: {
      desafio: 'Descrição do desafio.',
      dicas: ['Dica 1', 'Dica 2'],
      codeTemplate: '// código inicial',             // opcional
    },
    socializacao: {
      discussao: 'Pergunta para reflexão.',
      pontos: ['Ponto 1', 'Ponto 2'],
      diasDesafio: 'Dias X–Y',
      sugestaoBlog: 'Título sugerido',
      hashtagsExtras: '#golang #tema',
    },
    aplicacao: {
      projeto: 'Descrição do projeto.',
      requisitos: ['Requisito 1'],
      criterios: ['Critério 1'],
    },
  },
},
```

---

## Relatando Bugs

Inclua na issue: tela/URL, passos para reproduzir, comportamento esperado vs. atual, navegador/SO e logs/prints.

---

## Checklist do PR

- [ ] `make lint` sem erros
- [ ] `make test` passando
- [ ] `make build` sem erros
- [ ] Novas lições com todas as 4 fases VESA preenchidas
- [ ] PR resolve uma única issue ou feature
- [ ] Commit segue a convenção do projeto

---

## Recursos Úteis

- [README.md](README.md) — Visão geral e como rodar
- [src/data/roadmap.ts](src/data/roadmap.ts) — Estrutura de conteúdo
- [src/types/index.ts](src/types/index.ts) — Tipos do projeto
- [runner/main.go](runner/main.go) — API de execução de código
- [go.dev/doc](https://go.dev/doc/) — Documentação oficial do Go

