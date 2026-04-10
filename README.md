**AprendaGo** é uma plataforma web para aprender a linguagem Go do zero ao avançado, com execução de código diretamente no navegador e uma metodologia estruturada que vai além de tutoriais comuns.

Ele combina conteúdo técnico progressivo com um ciclo de aprendizado ativo chamado **VESA** — sigla criada para esta plataforma que organiza cada lição em quatro fases:

| Fase | O que acontece |
|------|----------------|
| **V**isão Geral | Explicação do conceito com exemplos de código prontos para executar |
| **E**xperimentação | Desafio prático com editor de código interativo no navegador |
| **S**ocialização | Perguntas para reflexão, sugestão de post de blog e hashtags |
| **A**plicação | Projeto final da lição com requisitos e critérios de avaliação |

O aprendizado não é passivo: cada lição exige que você escreva e execute código real antes de avançar.

---

## Funcionalidades

- **Editor de código integrado** — escreva e execute Go direto no browser, sem instalar nada
- **Roadmap visual** — sidebar com progresso por módulo, desbloqueio progressivo de lições
- **Execução segura** — código roda em sandbox Docker isolado com timeout, limite de memória e controle de concorrência
- **Progresso persistido** — estado salvo em localStorage, continue de onde parou
- **Acessibilidade** — tema claro/escuro, tamanho de fonte e espaçamento configuráveis

---

## Como rodar localmente

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose

```bash
git clone https://github.com/scovl/AprendaGo.git
cd AprendaGo
```

### Comandos disponíveis (`make help`)

| Comando | O que faz |
|---------|-----------|
| `make up` | Sobe em produção — acesse **http://localhost:3000** |
| `make dev` | Hot reload — acesse **http://localhost:3001** |
| `make down` | Derruba os containers |
| `make test` | Roda todos os testes (Go + TypeScript) |
| `make lint` | Análise estática: `go vet` + `tsc --noEmit` |
| `make fmt` | Formata o código Go |
| `make build` | Build do frontend isolado |

O frontend é servido por nginx, e o backend Go roda em container separado com sandbox isolado (timeout 10s, 512 MB, 4 execuções simultâneas).

---

## Arquitetura

```
AprendaGo/
├── src/                  # Frontend — React 18 + TypeScript + Vite
│   ├── data/roadmap.ts   # Conteúdo: módulos, lições e fases VESA
│   ├── components/       # UI: Sidebar, RoadmapTree, VesaPhases, editor
│   └── context/          # Estado global: progresso e acessibilidade
├── runner/               # Backend — serviço Go para execução de código
│   ├── main.go           # HTTP API: POST /run, GET /health
│   └── main_test.go      # 9 testes unitários e de integração
├── Dockerfile            # Build multi-stage do frontend (nginx)
├── runner/Dockerfile     # Build 3 estágios: testes → compilação → runtime
└── docker-compose.yml    # 4 serviços: runner, aprenda-go, dev, runner-test
```

O serviço `runner` executa código do usuário em processo isolado com:
- Timeout de 10 segundos por execução
- Limite de 512 MB de memória
- Máximo de 4 execuções simultâneas (semáforo)
- `GOPROXY=off` — sem acesso à internet do sandbox
- Diretório temporário removido após cada execução

---

## Diferenciais

A maioria das plataformas de aprendizado de Go oferece leitura passiva e quizzes. O AprendaGo se diferencia em três pontos:

**1. Metodologia estruturada por lição, não por capítulo**
Cada lição tem um ciclo completo — conceito → prática → reflexão → projeto. Você não lê sobre ponteiros, você escreve código com ponteiros antes de ver a próxima lição.

**2. Execução real, não simulada**
O código roda no mesmo ambiente que você usaria em produção — Go compilado de verdade, sem interpretadores JavaScript emulando a linguagem. Erros de compilação reais, output real.

**3. Roadmap com desbloqueio progressivo**
O conteúdo tem dependências explícitas. Generics ficam bloqueados até você passar por fundamentos. O roadmap visual deixa claro onde você está e o que está por vir, sem a ansiedade de um curso com centenas de vídeos desordenados.
