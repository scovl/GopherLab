# AprendaGo — Plataforma Interativa de Aprendizado em Go

**AprendaGo** é uma plataforma web para aprender a linguagem Go do zero ao avançado, com execução de código diretamente no navegador e uma metodologia estruturada que vai além de tutoriais comuns.

---

## O que é o AprendaGo?

O AprendaGo combina conteúdo técnico progressivo com uma metodologia ativa de aprendizado chamada **MESA**, que organiza cada lição em quatro fases:

| Fase | O que acontece |
|------|----------------|
| **M**odelagem | Explicação do conceito com exemplos de código prontos para executar |
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

## Conteúdo — 14 módulos, 38+ lições

```
1.  Introdução à Linguagem      — história, motivações, instalação, VSCode
2.  Fundamentos                 — tipos, ponteiros, funções, structs, interfaces, generics básico
3.  Pacotes Importantes         — arquivos, HTTP/JSON, servidores, context
4.  Concorrência                — goroutines, channels, sync, worker pools
5.  Desenvolvimento de APIs     — net/http, Chi, JWT, Swagger
6.  Testes Automatizados        — table-driven tests, mocks, fuzzing, benchmarks
7.  Bancos de Dados             — database/sql, GORM, SQLC, migrations
8.  Tratamento de Erros         — error wrapping, errors.Is/As, multi-errors, erros estruturados
9.  Generics                    — constraints, type parameters, inferência de tipos
10. SOLID em Go                 — SRP, OCP, LSP, ISP e DIP com exemplos práticos
11. Clean Architecture          — entities, use cases, adapters e regra de dependência
12. Implementações Avançadas    — gRPC, GraphQL, Cobra CLI, RabbitMQ, AWS S3, Viper
13. Golang Internals            — scheduler M:P:G, GC tri-color, pprof, memória
14. Deploy e Produção           — Docker, CI/CD, monitoramento, graceful shutdown
```

---

## Como rodar localmente

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose

### Produção (porta 3000)

```bash
git clone https://github.com/scovl/AprendaGo.git
cd AprendaGo
docker compose up -d --build
```

Acesse: **http://localhost:3000**

### Desenvolvimento com hot reload (porta 3001)

```bash
docker compose --profile dev up
```

Acesse: **http://localhost:3001** — alterações em `src/` refletem imediatamente.

### Executar testes do backend Go

```bash
docker compose --profile test run --rm runner-test
```

---

## Arquitetura

```
AprendaGo/
├── src/                  # Frontend — React 18 + TypeScript + Vite
│   ├── data/roadmap.ts   # Conteúdo: módulos, lições e fases MESA
│   ├── components/       # UI: Sidebar, RoadmapTree, MesaPhases, editor
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

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript 5 + Vite 5 |
| Backend | Go 1.22 (serviço HTTP stateless) |
| Infraestrutura | Docker + Docker Compose + nginx |
| Testes | `net/http/httptest` (Go), build gate no Dockerfile |
