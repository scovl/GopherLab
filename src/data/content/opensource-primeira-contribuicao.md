---
title: Sua primeira contribuição
description: Fork, branch, commit semântico, PR e o ciclo completo de contribuição.
estimatedMinutes: 40
recursos:
  - https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project
  - https://www.conventionalcommits.org/en/v1.0.0/
  - https://go.dev/doc/contribute
  - https://www.youtube.com/watch?v=RGOj5yH7evk
experimentacao:
  desafio: "Simule o fluxo completo de contribuição: crie um repositório público próprio no GitHub, abra uma issue, faça um fork, implemente a correção num branch descritivo e abra um PR linkando à issue com Fixes #1."
  dicas:
    - git log --oneline para ver o histórico limpo
    - git rebase -i HEAD~3 para squash de commits antes do PR
    - gh pr create --fill se usar o GitHub CLI
    - go test ./... antes de abrir o PR
socializacao:
  discussao: "Qual é a parte mais difícil de fazer um PR ser aprovado: o código, a comunicação ou o timing?"
  pontos:
    - PRs pequenos e focados têm 3x mais chance de serem aceitos
    - Comentários em código alheio devem ser perguntas, não críticas
    - Nunca misture refactoring com feature em um único PR
    - Responda reviews em até 48h
  diasDesafio: "Bônus – Semana de Open Source"
  sugestaoBlog: "Meu primeiro PR aceito em um projeto Go: o que aprendi sobre comunicação técnica"
  hashtagsExtras: '#golang #opensource #github #pullrequest #commit'
aplicacao:
  projeto: Ferramenta de checklist pré-PR que verifica boas práticas antes de submeter contribuição.
  requisitos:
    - Verifica se há CONTRIBUTING.md no repositório atual
    - Roda go test ./... e reporta falhas
    - Roda go vet ./... e gofmt -l .
    - Lista arquivos modificados e pede confirmação antes de push
  criterios:
    - Checks executam em sequência com output claro
    - Saída com checkmarks por verificação
    - Exit code não-zero se algum check falhar
---

Fazer uma contribuição não é apenas escrever código — é um processo de **comunicação**. Projetos com centenas de contribuidores precisam de padrões para funcionar.

## O ciclo de uma contribuição

```
1. Fork  →  2. Clone  →  3. Branch  →  4. Código  →  5. Tests  →  6. PR
```

### 1. Fork e setup local

```bash
git clone https://github.com/SEU_USUARIO/PROJETO.git
cd PROJETO
git remote add upstream https://github.com/DONO/PROJETO.git
git fetch upstream
```

### 2. Branch descritivo

```bash
git checkout -b fix/json-decoder-nil-check
# Padrões comuns: fix/, feat/, docs/, refactor/, test/
```

### 3. Commits semânticos

```
feat: add timeout to HTTP client
fix: handle nil pointer in JSON decoder
docs: update contributing guide for Windows
test: add unit tests for rate limiter
```

### 4. Sync com upstream antes do PR

```bash
git fetch upstream
git rebase upstream/main
```

## Código de conduta

Todo projeto saudável tem regras de convivência explícitas. Antes de interagir — seja abrindo uma issue, comentando num PR ou participando de discussões — leia o `CODE_OF_CONDUCT.md` do projeto. Projetos relevantes seguem ou adaptam o [Contributor Covenant](https://www.contributor-covenant.org/).

O que um bom código de conduta cobre:

- **Respeito à diversidade** — gênero, raça, orientação sexual, deficiência, origem e nível de experiência
- **Linguagem inclusiva** — sem piadas às custas de grupos minorizados, sem "banter" que exclui
- **Crítica ao código, nunca à pessoa** — "essa função pode ser simplificada" vs. "quem escreveu isso não sabe programar"
- **Espaço seguro para iniciantes** — pull requests de primeira viagem merecem feedback construtivo, não ridicularização
- **Canal de reporte** — como e para quem reportar violações com confidencialidade

Projetos sem código de conduta tendem a acumular barreiras invisíveis de entrada — especialmente para grupos sub-representados.

## Checklist antes de abrir o PR

- [ ] Leu o `CONTRIBUTING.md` do projeto?
- [ ] Leu o `CODE_OF_CONDUCT.md` do projeto?
- [ ] Rodou `go test ./...`?
- [ ] Rodou `go vet ./...` e `gofmt`?
- [ ] A descrição do PR explica *por que*, não só *o que*?
- [ ] Está linkado à issue com `Fixes #123`?
