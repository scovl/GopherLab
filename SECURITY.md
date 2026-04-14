# Política de Segurança

## Versões Suportadas

| Versão | Suporte de segurança |
|--------|----------------------|
| `main` | ✅ Ativa             |

---

## Reportando uma Vulnerabilidade

**Não abra uma issue pública para reportar vulnerabilidades de segurança.**

Se você encontrou uma falha de segurança neste projeto, reporte de forma privada:

1. Vá em **Security → Report a vulnerability** no GitHub (aba "Security" do repositório)
2. Descreva o problema com o máximo de detalhes possível:
   - Versão/commit afetado
   - Passos para reproduzir
   - Impacto potencial
   - Sugestão de correção (se houver)

Você receberá uma resposta em até **72 horas**. Se a vulnerabilidade for confirmada, trabalharemos em conjunto para publicar uma correção antes de qualquer divulgação pública (*responsible disclosure*).

---

## Escopo

Este projeto inclui:

- **Runner** (`runner/`) — execução de código Go em sandbox isolado via Docker
- **Terminal** (`terminal/`) — sessões de terminal via WebSocket/PTY
- **Frontend** (`src/`) — aplicação React/TypeScript

Falhas com maior prioridade:

- Escape de sandbox no runner (execução de código arbitrário no host)
- Bypass do bloqueio de imports no runner
- Injeção de comandos via WebSocket
- Exposição de dados de outros usuários

---

## Medidas Já Implementadas

- Sandbox Docker com `mem_limit`, `cpus` e `pids_limit`
- Prova de trabalho (PoW) para mitigar abuso de execução
- Lista de imports bloqueados no runner
- Timeout de 10 segundos por execução
- Sessões de terminal com timeout e limite de concorrência

---

## Atribuição

Vulnerabilidades corrigidas serão creditadas ao pesquisador no histórico de commits, salvo preferência por anonimato.
