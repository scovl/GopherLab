---
title: GraphQL com gqlgen
description: API GraphQL type-safe com gqlgen - schema-first, resolvers e dataloader.
estimatedMinutes: 45
recursos:
  - https://gqlgen.com/
  - https://graphql.org/
experimentacao:
  desafio: Crie schema GraphQL para livraria com queries (livros, autores) e mutations (criarLivro). Use gqlgen para gerar código.
  dicas:
    - gqlgen init gera scaffold completo
    - Defina schema.graphqls primeiro
    - Implemente resolvers nos arquivos gerados
  codeTemplate: |
    package main

    import (
    	"log"
    	"net/http"

    	"github.com/99designs/gqlgen/graphql/handler"
    	"github.com/99designs/gqlgen/graphql/playground"
    	"exemplo/graph"
    	"exemplo/graph/generated"
    )

    // schema.graphqls:
    // type Query {
    //   livros: [Livro!]!
    //   livro(id: ID!): Livro
    // }
    // type Mutation {
    //   criarLivro(input: NovoLivro!): Livro!
    // }
    // type Livro {
    //   id: ID!
    //   titulo: String!
    //   autor: Autor!
    // }
    // type Autor {
    //   id: ID!
    //   nome: String!
    //   livros: [Livro!]!
    // }
    // input NovoLivro {
    //   titulo: String!
    //   autorID: ID!
    // }

    func main() {
    	srv := handler.NewDefaultServer(
    		generated.NewExecutableSchema(generated.Config{
    			Resolvers: &graph.Resolver{},
    		}),
    	)

    	http.Handle("/", playground.Handler("GraphQL", "/query"))
    	http.Handle("/query", srv)

    	log.Println("GraphQL playground em http://localhost:8080/")
    	log.Fatal(http.ListenAndServe(":8080", nil))
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **Schema-first com gqlgen** — você define o schema GraphQL (`.graphqls`) primeiro, depois roda `go generate ./...`. O gqlgen gera: (1) structs `model.Livro`, `model.Autor`; (2) interfaces `Resolver` com métodos que você implementa; (3) wiring code que conecta tudo.

    **`handler.NewDefaultServer`** — cria o servidor GraphQL com todos os defaults: parsing, validação, execution, e error handling. O playground em `/` fornece uma UI interativa para testar queries. Em produção, desabilite o playground.

    **Resolver pattern** — cada campo que não é trivial (ex: `Autor.livros`) precisa de um resolver. O gqlgen gera `func (r *autorResolver) Livros(ctx context.Context, obj *model.Autor) ([]*model.Livro, error)`. Você implementa a lógica de busca.

    **Problema N+1** — se 100 livros têm autores, sem dataloader isso gera 101 queries (1 para livros + 100 para autores). Use `github.com/graph-gophers/dataloader` para batch: agrupa IDs e faz **uma query** `WHERE id IN (...)`.

    **GraphQL vs REST** — GraphQL elimina over-fetching (clientes pedem **exatamente** os campos que precisam) e under-fetching (uma query pode buscar dados aninhados). Trade-off: caching é mais complexo (nada de HTTP caching nativo), e queries maliciosas podem ser caras (use query complexity analysis).

    **gqlgen vs graphql-go** — gqlgen é **schema-first** (type-safe, code generation); graphql-go é **code-first** (reflection-based). gqlgen é o mais popular em Go por causa da type safety.
socializacao:
  discussao: "GraphQL vs REST: complexidade vs flexibilidade?"
  pontos:
    - "GraphQL: cliente controla dados, N+1 é risco"
    - "REST: simples, cacheavel, previsivel"
    - Use GraphQL quando clientes têm necessidades variadas
  diasDesafio: Dias 83–90
  sugestaoBlog: "GraphQL com Go: schema-first com gqlgen e resolvers type-safe"
  hashtagsExtras: '#golang #graphql #gqlgen'
aplicacao:
  projeto: API GraphQL completa com autenticação e dataloader.
  requisitos:
    - Queries e Mutations
    - Middleware de autenticação
    - Dataloader para evitar N+1
  criterios:
    - Schema bem definido
    - Performance com dataloader
    - Playground funcional
  starterCode: |
    package main

    // Estrutura de diretórios gqlgen:
    //   graph/
    //     schema.graphqls   ← schema GraphQL
    //     schema.resolvers.go ← resolvers (você implementa)
    //     generated/        ← código gerado (não edite)
    //     model/            ← structs geradas
    //   gqlgen.yml          ← configuração
    //   server.go           ← entry point

    // TODO: Crie schema.graphqls com:
    //   type Query {
    //     livros: [Livro!]!
    //     autores: [Autor!]!
    //   }
    //   type Mutation {
    //     criarAutor(nome: String!): Autor!
    //     criarLivro(titulo: String!, autorID: ID!): Livro!
    //   }
    //   type Livro { id: ID!, titulo: String!, autor: Autor! }
    //   type Autor { id: ID!, nome: String!, livros: [Livro!]! }

    // TODO: Execute gqlgen init e go generate
    // TODO: Implemente os resolvers com store em memória (map)
    // TODO: Adicione dataloader para Autor.livros
    // TODO: Adicione middleware de logging

    // Inicialize com: go run github.com/99designs/gqlgen init

    func main() {
    	// Após gqlgen init, este arquivo será gerado automaticamente
    }

---

**GraphQL** permite ao cliente especificar **exatamente** quais dados precisa — resolve over-fetching (dados demais) e under-fetching (dados de menos) comuns em REST.

## gqlgen

Em Go, `gqlgen` gera código **type-safe** a partir do schema GraphQL:

```graphql
type Query {
    user(id: ID!): User
    users: [User!]!
}

type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
}
```

Após `go generate ./...`, o gqlgen gera interfaces de resolver que você implementa:

```go
func (r *queryResolver) User(ctx context.Context, id string) (*model.User, error) {
    return r.db.GetUser(ctx, id)
}
```

## Dataloaders — prevenindo N+1 queries

O problema N+1: buscar 100 users e para cada um buscar seus posts = 101 queries. Dataloaders agrupam e batcham as queries:

```go
// Em vez de 100 queries individuais
// Posts são buscados em uma única query: WHERE user_id IN (1,2,...,100)
```

Use `github.com/graph-gophers/dataloader` para implementar o padrão.

## GraphQL vs REST

| Aspecto | REST | GraphQL |
|---|---|---|
| Dados | Server define o que retorna | Client define o que quer |
| Endpoints | Múltiplos por recurso | Um único endpoint |
| Over-fetching | Comum | Eliminado |
| Caching | HTTP caching nativo | Requer configuração |
| Melhor para | APIs públicas simples | Apps com queries complexas |
