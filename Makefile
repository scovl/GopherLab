.PHONY: help dev up down restart logs build test test-go test-ts lint fmt

RUNNER_DIR := runner

help: ## Exibe esta ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ─── Docker ──────────────────────────────────────────────────────────────────

up: ## Sobe os containers em produção (porta 3000)
	docker compose up -d --build

down: ## Derruba os containers
	docker compose down

restart: ## Reinicia os containers (rebuild + up)
	docker compose down
	docker compose up -d --build

dev: ## Sobe o ambiente de desenvolvimento com hot reload (porta 3001)
	docker compose --profile dev up

logs: ## Exibe logs dos containers em tempo real
	docker compose logs -f

# ─── Build ───────────────────────────────────────────────────────────────────

build: ## Build do frontend (tsc + vite)
	npm run build

# ─── Testes ──────────────────────────────────────────────────────────────────

test: test-go test-ts ## Roda todos os testes (Go + TypeScript)

test-go: ## Roda os testes Go com race detector
	docker compose --profile test run --rm runner-test

test-go-local: ## Roda os testes Go localmente (sem Docker)
	cd $(RUNNER_DIR) && go test -race -cover ./...

test-ts: ## Verifica tipos TypeScript
	npx tsc --noEmit

# ─── Lint & Format ───────────────────────────────────────────────────────────

lint: ## Análise estática: go vet + tsc
	cd $(RUNNER_DIR) && go vet ./...
	npx tsc --noEmit

fmt: ## Formata o código Go (gofmt + goimports)
	cd $(RUNNER_DIR) && gofmt -w .
	@command -v goimports >/dev/null 2>&1 && cd $(RUNNER_DIR) && goimports -w . || \
		echo "goimports não encontrado — rode: go install golang.org/x/tools/cmd/goimports@latest"
