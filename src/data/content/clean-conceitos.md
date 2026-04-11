---
title: "Clean Architecture: Conceitos e Implementação"
description: Camadas, regras de dependência, entities, use cases e project layout.
estimatedMinutes: 55
codeExample: |
  # Layout Go com Clean Architecture
  cmd/
    server/main.go
  internal/
    entity/
      order.go
    usecase/
      create_order.go
    infra/
      handler/http.go
      repository/pg.go
  pkg/
recursos:
  - https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
experimentacao:
  desafio: "Crie um projeto com Clean Architecture: entity Order, use case CreateOrder, handler HTTP e repository (in-memory para começar)."
  dicas:
    - Entity não importa nenhum pacote externo
    - Use case depende de interface Repository, não implementação
    - Handler converte HTTP → use case
socializacao:
  discussao: Clean Architecture adiciona complexidade. Quando vale a pena?
  pontos:
    - "Projetos pequenos: overengineering"
    - "Projetos médios/grandes: testabilidade e manutenção"
    - "Pragmatismo: não precisa ser 100% puro"
  diasDesafio: Dias 77–82
  sugestaoBlog: "Clean Architecture em Go: do conceito ao código real"
  hashtagsExtras: '#golang #cleanarchitecture'
aplicacao:
  projeto: Sistema de pedidos com Clean Architecture completa.
  requisitos:
    - "Entities: Order, Product"
    - "Use Cases: CreateOrder, ListOrders"
    - "Adapters: HTTP handler, PostgreSQL repository"
    - "Testes: use cases testáveis sem infra"
  criterios:
    - Regra de dependência respeitada
    - Use cases testáveis isoladamente
    - Código organizado
---

## O problema: código espaguete

Quando o projeto é pequeno, tudo num arquivo funciona. Mas conforme cresce:

```go
// main.go com 2000 linhas...
func criarPedido(w http.ResponseWriter, r *http.Request) {
    // decodifica JSON
    // valida campos
    // calcula desconto
    // salva no PostgreSQL
    // envia email
    // responde JSON
}
```

Precisou trocar PostgreSQL por MySQL? Mexe no handler. Precisou mudar regra de desconto? Mexe no handler. Precisou testar? Precisa do banco rodando.

**Tudo depende de tudo.** Isso é código espaguete.

> **Analogia:** imagine uma empresa onde **todo mundo trabalha na mesma sala, na mesma mesa**. O financeiro, o RH, a engenharia, o marketing — todos misturados. Quando o financeiro precisa mudar um processo, esbarra em todo mundo.

---

## Clean Architecture — cada departamento no seu andar

A ideia é simples: **separar o código em camadas**, onde cada camada tem uma responsabilidade clara.

```
┌─────────────────────────────────────────┐
│           Frameworks / Drivers          │  ← mais externa (HTTP, banco, CLI)
│  ┌───────────────────────────────────┐  │
│  │           Adapters                │  │  ← traduz entre camadas
│  │  ┌─────────────────────────────┐  │  │
│  │  │        Use Cases            │  │  │  ← regras da aplicação
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │      Entities         │  │  │  │  ← regras de negócio puras
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### As 4 camadas explicadas

| Camada | O que faz | Exemplo | Analogia (empresa) |
|---|---|---|---|
| **Entities** | Regras de negócio puras | `Pedido`, `Produto`, `calcularTotal()` | **Diretoria** — regras que nunca mudam |
| **Use Cases** | Lógica da aplicação | `CriarPedido`, `CancelarPedido` | **Gerente** — coordena o fluxo |
| **Adapters** | Traduz entre camadas | Handler HTTP, Repository | **Recepcionista** — traduz pedidos |
| **Frameworks** | Detalhes técnicos | PostgreSQL, Gin, gRPC | **Ferramentas** — fax, telefone, email |

---

## A regra de ouro — dependências apontam para DENTRO

```
Frameworks → Adapters → Use Cases → Entities
            ────────→ ────────→ ────────→
            dependência flui nessa direção
```

Isso significa:

| Camada | Pode importar | NÃO pode importar |
|---|---|---|
| Entity | Nada (só stdlib) | Nenhuma outra camada |
| Use Case | Entity | Adapter, Framework |
| Adapter | Use Case, Entity | Outra implementação |
| Framework | Tudo | (é a camada mais externa) |

> **Traduzindo:** a Entity `Pedido` não sabe que PostgreSQL existe. O Use Case `CriarPedido` não sabe que HTTP existe. Cada camada só conhece as de **dentro**, nunca as de fora.

### Por que isso é bom?

- **Trocar o banco?** Só muda a camada de Adapter (Repository). Use Case e Entity não mudam.
- **Trocar HTTP por gRPC?** Só muda o Adapter (Handler). Use Case e Entity não mudam.
- **Testar regras de negócio?** Não precisa de banco nem de HTTP. Testa o Use Case com um mock.

---

## Como fica em Go — as pastas

```
meu-projeto/
├── cmd/
│   └── server/
│       └── main.go              ← monta tudo e sobe o servidor
├── internal/
│   ├── entity/
│   │   └── order.go             ← structs + regras de negócio
│   ├── usecase/
│   │   └── create_order.go      ← lógica da aplicação + interfaces
│   └── infra/
│       ├── handler/
│       │   └── http.go          ← handlers HTTP (adapter)
│       └── repository/
│           └── pg.go            ← PostgreSQL (adapter)
└── go.mod
```

| Pasta | Camada | Importa |
|---|---|---|
| `entity/` | Entity | Nada |
| `usecase/` | Use Case | `entity/` |
| `infra/handler/` | Adapter | `usecase/`, `entity/` |
| `infra/repository/` | Adapter | `entity/` |
| `cmd/server/` | Main | Tudo (monta as peças) |

---

## Construindo passo a passo — sistema de pedidos

### Passo 1: Entity — as regras de negócio puras

```go
// internal/entity/order.go

package entity

import "time"

type Order struct {
    ID        string
    Product   string
    Quantity  int
    Price     float64
    CreatedAt time.Time
}

// Regra de negócio: total = preço × quantidade
func (o *Order) Total() float64 {
    return o.Price * float64(o.Quantity)
}

// Regra de negócio: pedido precisa de produto e quantidade > 0
func (o *Order) Validate() error {
    if o.Product == "" {
        return errors.New("produto é obrigatório")
    }
    if o.Quantity <= 0 {
        return errors.New("quantidade deve ser positiva")
    }
    return nil
}
```

> **Perceba:** Entity não sabe de HTTP, banco de dados, ou framework. Só sabe regras de negócio. Se trocar tudo do projeto, as entities continuam iguais.

### Passo 2: Use Case — a lógica da aplicação

```go
// internal/usecase/create_order.go

package usecase

import (
    "context"
    "meu-projeto/internal/entity"
)

// A interface que o Use Case PRECISA (não a implementação!)
type OrderRepository interface {
    Save(ctx context.Context, o *entity.Order) error
}

// O Use Case em si
type CreateOrder struct {
    repo OrderRepository  // depende da INTERFACE
}

func NewCreateOrder(repo OrderRepository) *CreateOrder {
    return &CreateOrder{repo: repo}
}

func (uc *CreateOrder) Execute(ctx context.Context, product string, qty int, price float64) (*entity.Order, error) {
    // 1. Cria a entity
    order := &entity.Order{
        ID:       generateID(),
        Product:  product,
        Quantity: qty,
        Price:    price,
    }

    // 2. Valida (regras de negócio)
    if err := order.Validate(); err != nil {
        return nil, err
    }

    // 3. Salva (não sabe COMO — só chama a interface)
    if err := uc.repo.Save(ctx, order); err != nil {
        return nil, err
    }

    return order, nil
}
```

> **O pulo do gato:** o Use Case define `OrderRepository` como **interface**. Ele não sabe se é PostgreSQL, MongoDB ou um map em memória. Só sabe que existe um `Save`. É o princípio **D** do SOLID (Dependency Inversion) em ação!

### Passo 3: Adapter — Repository (implementação)

```go
// internal/infra/repository/pg.go

package repository

import (
    "context"
    "meu-projeto/internal/entity"

    "github.com/jackc/pgx/v5/pgxpool"
)

type pgOrderRepo struct {
    db *pgxpool.Pool
}

func NewPgOrderRepo(db *pgxpool.Pool) *pgOrderRepo {
    return &pgOrderRepo{db: db}
}

// Implementa usecase.OrderRepository automaticamente (interface implícita!)
func (r *pgOrderRepo) Save(ctx context.Context, o *entity.Order) error {
    _, err := r.db.Exec(ctx,
        "INSERT INTO orders (id, product, quantity, price) VALUES ($1, $2, $3, $4)",
        o.ID, o.Product, o.Quantity, o.Price,
    )
    return err
}
```

> **Interfaces implícitas do Go brilham aqui:** `pgOrderRepo` implementa `OrderRepository` sem escrever `implements`. Basta ter o método `Save` com a mesma assinatura. A camada `repository/` importa `entity/`, mas **nunca** importa `usecase/` — a interface está no use case!

### Passo 4: Adapter — Handler HTTP

```go
// internal/infra/handler/http.go

package handler

import (
    "encoding/json"
    "net/http"
    "meu-projeto/internal/usecase"
)

type OrderHandler struct {
    createOrder *usecase.CreateOrder
}

func NewOrderHandler(uc *usecase.CreateOrder) *OrderHandler {
    return &OrderHandler{createOrder: uc}
}

type createOrderRequest struct {
    Product  string  `json:"product"`
    Quantity int     `json:"quantity"`
    Price    float64 `json:"price"`
}

func (h *OrderHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req createOrderRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, `{"error":"JSON inválido"}`, http.StatusBadRequest)
        return
    }

    order, err := h.createOrder.Execute(r.Context(), req.Product, req.Quantity, req.Price)
    if err != nil {
        http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(order)
}
```

> O handler só faz: decodificar JSON → chamar o use case → enviar resposta. Não sabe de banco, não sabe de regras de negócio.

### Passo 5: Main — montando tudo

```go
// cmd/server/main.go

func main() {
    // 1. Conecta ao banco (framework/driver)
    db := conectarBanco()

    // 2. Cria o repository (adapter)
    repo := repository.NewPgOrderRepo(db)

    // 3. Cria o use case (passando a interface)
    createOrder := usecase.NewCreateOrder(repo)

    // 4. Cria o handler (adapter)
    handler := handler.NewOrderHandler(createOrder)

    // 5. Monta as rotas
    mux := http.NewServeMux()
    mux.HandleFunc("POST /api/orders", handler.Create)

    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

> **O main.go é o "diretor de orquestra"** — ele conhece todo mundo e monta as peças. Mas as peças não conhecem umas às outras (só interfaces).

---

## Como testar SEM banco de dados

Essa é a maior vantagem. O Use Case depende de uma **interface**, então no teste passamos um **mock**:

```go
// Mock que salva em memória
type mockRepo struct {
    orders []*entity.Order
}

func (m *mockRepo) Save(ctx context.Context, o *entity.Order) error {
    m.orders = append(m.orders, o)
    return nil
}

func TestCreateOrder(t *testing.T) {
    mock := &mockRepo{}
    uc := usecase.NewCreateOrder(mock)

    order, err := uc.Execute(context.Background(), "Mouse", 2, 49.90)

    if err != nil {
        t.Fatal(err)
    }
    if order.Total() != 99.80 {
        t.Errorf("total esperado 99.80, got %f", order.Total())
    }
    if len(mock.orders) != 1 {
        t.Error("deveria ter salvo 1 pedido")
    }
}
// Sem PostgreSQL! Sem Docker! Roda em milissegundos!
```

---

## Quem importa quem — o mapa visual

```
entity/           ← não importa ninguém
    ↑
usecase/          ← importa entity/
    ↑
infra/handler/    ← importa usecase/ e entity/
infra/repository/ ← importa entity/
    ↑
cmd/server/       ← importa tudo (monta as peças)
```

> **Se `usecase/` importar `infra/`:** você violou a regra. O Go **não vai reclamar** (compila normal), mas os benefícios de Clean Architecture desaparecem.

---

## Quando usar Clean Architecture?

| Situação | Usar Clean Architecture? |
|---|---|
| Script de 100 linhas | ❌ Overkill — faça tudo no main |
| API simples (1-2 recursos) | ❌ Provavelmente não precisa |
| Projeto com 5+ desenvolvedores | ✅ Organização é essencial |
| Projeto que vai crescer | ✅ Melhor começar certo do que refatorar depois |
| Precisa trocar banco/framework no futuro | ✅ A arquitetura permite |
| Precisa de testes isolados (sem infra) | ✅ Use cases testáveis com mocks |

> **Regra prática:** se o projeto tem mais de 3 pacotes e vai durar mais de 6 meses, Clean Architecture vale o investimento.

---

## Resumo — as 3 ideias centrais

```
1. Separe em camadas:  Entity → Use Case → Adapter → Framework
2. Dependências para DENTRO:  camadas externas importam internas, nunca o contrário
3. Interfaces no Use Case:  use case define O QUE precisa, adapter implementa COMO
```

| Preciso de... | Onde fica |
|---|---|
| Structs e regras de negócio | `entity/` |
| Lógica da aplicação (coordenação) | `usecase/` |
| Interface do repository | `usecase/` (definição) |
| Implementação do repository | `infra/repository/` |
| Handler HTTP | `infra/handler/` |
| Montar tudo | `cmd/server/main.go` |
| Testar sem banco | Mock que implementa a interface |
