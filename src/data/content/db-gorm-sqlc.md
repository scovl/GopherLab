---
title: GORM, Migrations e SQLC
description: ORM com GORM, auto-migrations e geração de código type-safe com SQLC.
estimatedMinutes: 50
recursos:
  - https://gorm.io/
  - https://sqlc.dev/
experimentacao:
  desafio: Crie a mesma API com GORM e depois com SQLC. Compare linhas de código, type safety e performance.
  dicas:
    - "GORM: go get gorm.io/gorm gorm.io/driver/postgres"
    - "SQLC: defina queries em .sql, gere com sqlc generate"
    - "Compare: developer experience vs performance"
  codeTemplate: |
    package main

    import (
    	"fmt"
    	"log"

    	"gorm.io/driver/postgres"
    	"gorm.io/gorm"
    )

    type Autor struct {
    	gorm.Model
    	Nome   string  `gorm:"not null"`
    	Livros []Livro `gorm:"foreignKey:AutorID"`
    }

    type Livro struct {
    	gorm.Model
    	Titulo  string `gorm:"not null;index"`
    	AutorID uint
    	Autor   Autor
    }

    func main() {
    	dsn := "host=localhost user=app dbname=livros sslmode=disable"
    	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    	if err != nil {
    		log.Fatal(err)
    	}

    	// Auto-migration cria/atualiza tabelas
    	db.AutoMigrate(&Autor{}, &Livro{})

    	// Criar com associação
    	autor := Autor{
    		Nome: "Rob Pike",
    		Livros: []Livro{
    			{Titulo: "The Practice of Programming"},
    			{Titulo: "The Unix Programming Environment"},
    		},
    	}
    	db.Create(&autor)

    	// Query com Preload (eager loading)
    	var resultado Autor
    	db.Preload("Livros").First(&resultado, "nome = ?", "Rob Pike")
    	fmt.Printf("%s tem %d livros\n", resultado.Nome, len(resultado.Livros))

    	// Query com Where
    	var livros []Livro
    	db.Where("titulo ILIKE ?", "%programming%").Find(&livros)
    	for _, l := range livros {
    		fmt.Println("-", l.Titulo)
    	}
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`gorm.Model`** — struct embeddada que adiciona 4 campos: `ID` (uint, primary key auto-increment), `CreatedAt`, `UpdatedAt` (time.Time) e `DeletedAt` (soft delete via `gorm.DeletedAt`). Soft delete significa que `db.Delete(&user)` apenas seta `DeletedAt` — o registro continua no banco.

    **`db.AutoMigrate(&Autor{}, &Livro{})`** — cria tabelas automaticamente a partir das structs. **Apenas adiciona** colunas/índices; **nunca deleta** colunas existentes. Ideal para desenvolvimento; em produção, use ferramentas de migration como `golang-migrate` ou `goose`.

    **`Preload("Livros")`** — eager loading que resolve o problema N+1. Sem Preload, acessar `autor.Livros` faria uma query lazy. GORM também suporta `Joins` para queries mais eficientes em casos complexos.

    **Tags `gorm:"not null;index"`** — controlam o esquema. `not null` adiciona constraint, `index` cria index, `uniqueIndex` cria unique index, `foreignKey:AutorID` especifica a FK.

    **SQLC (alternativa)** — enquanto GORM gera SQL em runtime, **SQLC gera código Go em build time** a partir de queries SQL escritas manualmente. Trade-off: GORM = produtividade; SQLC = performance + type safety total + controle do SQL.

    **Quando usar cada um:** GORM para CRUD simples e prototipagem; SQLC para produção com queries otimizadas; `database/sql` puro quando precisa de máximo controle.
socializacao:
  discussao: "GORM vs SQLC vs database/sql puro: quando usar cada um?"
  pontos:
    - "GORM: prototipagem, CRUD simples, relações complexas"
    - "SQLC: produção, queries otimizadas, type safety"
    - "SQL puro: máximo controle, queries dinâmicas"
  diasDesafio: Dias 61–68
  sugestaoBlog: "GORM vs SQLC em Go: qual escolher para o seu projeto?"
  hashtagsExtras: '#golang #gorm #sqlc #orm'
aplicacao:
  projeto: E-commerce com GORM com produtos, categorias e pedidos com relacionamentos.
  requisitos:
    - Modelos com HasMany/BelongsTo
    - Auto-migrations
    - Queries com preload e joins
  criterios:
    - Relacionamentos corretos
    - Migrations funcionais
    - Queries eficientes
  starterCode: |
    package main

    import (
    	"fmt"
    	"log"

    	"gorm.io/driver/postgres"
    	"gorm.io/gorm"
    )

    type Categoria struct {
    	gorm.Model
    	Nome     string    `gorm:"uniqueIndex;not null"`
    	Produtos []Produto `gorm:"foreignKey:CategoriaID"`
    }

    type Produto struct {
    	gorm.Model
    	Nome        string  `gorm:"not null;index"`
    	Preco       float64 `gorm:"not null"`
    	CategoriaID uint
    	Categoria   Categoria
    }

    type Pedido struct {
    	gorm.Model
    	Itens []ItemPedido `gorm:"foreignKey:PedidoID"`
    	Total float64
    }

    type ItemPedido struct {
    	gorm.Model
    	PedidoID  uint
    	ProdutoID uint
    	Produto   Produto
    	Qtd       int
    }

    // TODO: implemente CriarProduto(db, nome, preco, categoriaID)
    // TODO: implemente ListarProdutos(db) com Preload("Categoria")
    // TODO: implemente BuscarPorCategoria(db, categoriaNome)
    // TODO: implemente CriarPedido(db, itens []ItemPedido) que calcula Total
    // TODO: adicione paginação: ListarProdutos(db, page, perPage int)

    func main() {
    	dsn := "host=localhost user=app dbname=ecommerce sslmode=disable"
    	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    	if err != nil {
    		log.Fatal(err)
    	}
    	db.AutoMigrate(&Categoria{}, &Produto{}, &Pedido{}, &ItemPedido{})
    	fmt.Println("Modelos migrados com sucesso")
    }

---

## GORM

O ORM mais popular em Go: models via structs, auto-migration, associations e hooks.

```go
type User struct {
    gorm.Model
    Name  string `gorm:"not null"`
    Email string `gorm:"uniqueIndex"`
}

db.AutoMigrate(&User{})   // cria/atualiza tabela

db.Create(&User{Name: "Alice", Email: "alice@go.dev"})
db.First(&user, "email = ?", email)
db.Save(&user)
db.Delete(&user)
```

**Quando usar GORM:** prototipagem rápida, projetos com muitas operações CRUD simples, quando auto-migration é desejável em desenvolvimento.

## SQLC

Gera código Go **type-safe** a partir de queries SQL anotadas:

```sql
-- name: GetUser :one
SELECT * FROM users WHERE id = $1 LIMIT 1;
```

Após `sqlc generate`, você obtém:
```go
user, err := queries.GetUser(ctx, id)  // totalmente type-safe
```

**Quando usar SQLC:** produção com queries otimizadas, quando você quer controle total do SQL, times que já conhecem SQL bem.

## Migrations

Ferramentas populares para migrations: `golang-migrate/migrate` (CLI + library), `pressly/goose` (Go native), `Atlas` (schema-as-code). Sempre versione suas migrations e execute-as em CI antes de deploy.

| Abordagem | Melhor para |
|---|---|
| GORM | Prototipagem, projetos simples |
| SQLC | Produção, performance, type-safety total |
| SQL puro + migrations | Máximo controle |
