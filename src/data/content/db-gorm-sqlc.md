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

## O problema: escrever SQL na mão é chato e perigoso

Na aula anterior, você aprendeu `database/sql` — funciona, mas é **trabalhoso**:

```go
// Com database/sql puro:
row := db.QueryRow("SELECT id, name, email FROM users WHERE id = $1", id)
var u User
err := row.Scan(&u.ID, &u.Name, &u.Email)  // mapeia campo por campo 😩
```

Se a tabela tem 15 campos, são 15 argumentos no `Scan`. Se você errar a ordem... **bug silencioso**. Se adicionar uma coluna... precisa mudar em tudo que é lugar.

Existem duas abordagens para resolver isso:

| Abordagem | Ideia | Analogia |
|---|---|---|
| **ORM** (GORM) | Você escreve **structs**, ele gera o SQL | **Google Tradutor** — você fala português, ele traduz para SQL |
| **Code gen** (SQLC) | Você escreve **SQL**, ele gera as structs | **Autocompletar** — você escreve SQL, ele gera o Go type-safe |

---

## GORM — o "Google Tradutor" de SQL

GORM é o ORM mais popular em Go. A ideia é simples: **você trabalha com structs, e ele cuida do SQL**.

### Passo 1: Defina o model (struct = tabela)

```go
import "gorm.io/gorm"

type User struct {
    gorm.Model             // dá de graça: ID, CreatedAt, UpdatedAt, DeletedAt
    Name  string `gorm:"not null"`
    Email string `gorm:"uniqueIndex"`
}
```

### O que `gorm.Model` dá de graça?

| Campo | Tipo | O que faz |
|---|---|---|
| `ID` | `uint` | Primary key auto-increment |
| `CreatedAt` | `time.Time` | Preenchido automaticamente no Create |
| `UpdatedAt` | `time.Time` | Atualizado automaticamente no Save |
| `DeletedAt` | `gorm.DeletedAt` | Soft delete (marca como deletado, mas não apaga) |

> **Soft delete:** quando você faz `db.Delete(&user)`, o GORM **não** faz `DELETE FROM users`. Ele faz `UPDATE users SET deleted_at = NOW()`. O registro continua no banco, mas queries normais ignoram ele.

### Passo 2: Crie a tabela automaticamente

```go
db.AutoMigrate(&User{})
```

O GORM lê a struct e cria a tabela se não existir. Se já existir, **adiciona** colunas novas (mas nunca deleta colunas antigas).

> ⚠️ **Armadilha:** `AutoMigrate` é ótimo para desenvolvimento, mas em **produção** use ferramentas de migration (veremos depois). AutoMigrate nunca deleta colunas, então se você renomear um campo, a coluna antiga fica lá.

### Passo 3: CRUD — as 4 operações básicas

```go
// CREATE — inserir
db.Create(&User{Name: "Alice", Email: "alice@go.dev"})

// READ — buscar um
var user User
db.First(&user, "email = ?", "alice@go.dev")
//                         ^^ placeholder → evita SQL injection!

// READ — buscar vários
var users []User
db.Where("name ILIKE ?", "%ali%").Find(&users)

// UPDATE — atualizar
user.Name = "Alice Gopher"
db.Save(&user)                   // salva todos os campos
db.Model(&user).Update("name", "Alice Gopher")  // só um campo

// DELETE — soft delete (seta deleted_at)
db.Delete(&user)
```

> **Perceba:** você nunca escreveu `INSERT INTO`, `SELECT`, `UPDATE` ou `DELETE`. O GORM fez tudo. Você só trabalha com structs Go.

### As tags `gorm:"..."` mais comuns

| Tag | O que faz | Exemplo |
|---|---|---|
| `not null` | Campo obrigatório | `gorm:"not null"` |
| `uniqueIndex` | Único (sem duplicatas) | `gorm:"uniqueIndex"` |
| `index` | Cria índice (busca rápida) | `gorm:"index"` |
| `default:valor` | Valor padrão | `gorm:"default:0"` |
| `size:100` | Tamanho máximo (varchar) | `gorm:"size:100"` |
| `foreignKey:CampoID` | Chave estrangeira | `gorm:"foreignKey:AutorID"` |
| `-` | Ignora o campo | `gorm:"-"` |

---

## Relacionamentos no GORM — como ligar tabelas

### Um-para-muitos (Has Many)

Um autor tem **vários** livros:

```go
type Autor struct {
    gorm.Model
    Nome   string
    Livros []Livro `gorm:"foreignKey:AutorID"`  // "um autor tem muitos livros"
}

type Livro struct {
    gorm.Model
    Titulo  string
    AutorID uint    // chave estrangeira → aponta para Autor.ID
    Autor   Autor   // o Go pode carregar o autor junto
}
```

### O problema N+1 — e como resolver

```go
// ❌ Problema N+1: 1 query para autores + 1 query POR autor para livros
var autores []Autor
db.Find(&autores)
for _, a := range autores {
    fmt.Println(a.Livros)  // faz query extra para CADA autor!
}

// ✅ Preload: 2 queries no total (1 para autores, 1 para livros)
db.Preload("Livros").Find(&autores)
```

> **Analogia N+1:** é como ir ao mercado comprar 10 ingredientes fazendo **10 viagens** (uma por ingrediente). `Preload` é como fazer UMA viagem e comprar tudo.

### Criando com relacionamento

```go
// Cria autor E livros numa tacada só
autor := Autor{
    Nome: "Rob Pike",
    Livros: []Livro{
        {Titulo: "The Practice of Programming"},
        {Titulo: "The Unix Programming Environment"},
    },
}
db.Create(&autor)
// GORM insere o autor, pega o ID gerado, e insere os livros com AutorID preenchido
```

---

## SQLC — o "Autocompletar" de SQL

SQLC é o **oposto** do GORM. Em vez de esconder o SQL, ele **te deixa escrever SQL** e gera código Go type-safe automaticamente.

### Como funciona em 3 passos

```
1. Você escreve SQL       →  query.sql
2. SQLC lê o SQL          →  analisa tipos, parâmetros, retornos
3. SQLC gera código Go    →  funções type-safe com structs prontas
```

### Passo 1: Escreva as queries em SQL normal

```sql
-- query.sql

-- name: GetUser :one
SELECT id, name, email FROM users
WHERE id = $1 LIMIT 1;

-- name: ListUsers :many
SELECT id, name, email FROM users
ORDER BY name;

-- name: CreateUser :one
INSERT INTO users (name, email)
VALUES ($1, $2)
RETURNING id, name, email;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;
```

### O que significam os comentários mágicos?

| Comentário | Retorno em Go |
|---|---|
| `-- name: GetUser :one` | Retorna **1 struct** (ou erro) |
| `-- name: ListUsers :many` | Retorna **[]struct** (slice) |
| `-- name: CreateUser :one` | Retorna **1 struct** (o registro criado) |
| `-- name: DeleteUser :exec` | Retorna só `error` (sem dados) |

### Passo 2: Configure o SQLC

```yaml
# sqlc.yaml
version: "2"
sql:
  - engine: "postgresql"
    queries: "query.sql"
    schema: "schema.sql"
    gen:
      go:
        package: "db"
        out: "db"
```

### Passo 3: Gere o código

```bash
sqlc generate
```

O SQLC gera automaticamente:

```go
// db/query.sql.go (GERADO — não edite!)

type User struct {
    ID    int32
    Name  string
    Email string
}

func (q *Queries) GetUser(ctx context.Context, id int32) (User, error) { ... }
func (q *Queries) ListUsers(ctx context.Context) ([]User, error) { ... }
func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (User, error) { ... }
func (q *Queries) DeleteUser(ctx context.Context, id int32) error { ... }
```

### Usando o código gerado

```go
queries := db.New(conn)

// Type-safe! Se o SQL retorna id, name, email → a struct tem esses campos
user, err := queries.GetUser(ctx, 42)
fmt.Println(user.Name, user.Email)

// Criar com parâmetros tipados
newUser, err := queries.CreateUser(ctx, db.CreateUserParams{
    Name:  "Alice",
    Email: "alice@go.dev",
})
```

> **A mágica:** se você mudar o SQL (adicionar coluna, mudar tipo), roda `sqlc generate` de novo e o **compilador Go** mostra todos os lugares que quebraram. Com GORM, você só descobre em runtime.

---

## GORM vs SQLC — comparação honesta

| Aspecto | GORM | SQLC |
|---|---|---|
| Você escreve | **Structs Go** | **SQL puro** |
| SQL gerado em | Runtime (quando roda) | Build time (antes de rodar) |
| Type safety | Parcial (erros em runtime) | **Total** (erros em compilação) |
| Aprender SQL? | Não precisa no início | **Precisa saber SQL** |
| Performance | Boa (mas abstração tem custo) | **Máxima** (SQL otimizado por você) |
| Relações (Join/Preload) | Automáticas (`Preload`) | Manualmente no SQL |
| Auto-migration | Sim (`AutoMigrate`) | Não (precisa de ferramenta separada) |
| Ideal para | Protótipos, CRUD simples | Produção, queries complexas |

> **Resumindo:** GORM = **produtividade** (faz mais com menos código). SQLC = **controle e segurança** (você sabe exatamente o SQL que roda).

---

## Migrations — controlando a evolução do banco

`AutoMigrate` do GORM é bom para desenvolvimento, mas em **produção** você precisa de controle:

- Quero renomear uma coluna → `AutoMigrate` não faz isso
- Quero garantir que todo deploy rode as mesmas mudanças → preciso de versionamento
- O time precisa revisar mudanças no banco → preciso de arquivos `.sql` no Git

### Ferramentas populares de migration

| Ferramenta | Tipo | Destaque |
|---|---|---|
| `golang-migrate/migrate` | CLI + biblioteca Go | Mais popular, suporta vários bancos |
| `pressly/goose` | CLI Go puro | Simples, migrations em Go ou SQL |
| `Atlas` | Schema-as-code | Moderno, gera migrations automaticamente |

### Exemplo com golang-migrate

```bash
# Instala
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Cria uma migration
migrate create -ext sql -dir migrations -seq criar_usuarios

# Gerou dois arquivos:
# migrations/000001_criar_usuarios.up.sql   ← aplica a mudança
# migrations/000001_criar_usuarios.down.sql ← desfaz a mudança
```

```sql
-- 000001_criar_usuarios.up.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 000001_criar_usuarios.down.sql
DROP TABLE users;
```

```bash
# Aplica todas as migrations pendentes
migrate -database "postgres://user:pass@localhost/db?sslmode=disable" -path migrations up

# Desfaz a última
migrate ... down 1
```

> **Regra de ouro:** toda mudança no banco de dados deve ser uma migration versionada no Git. Nunca altere o banco manualmente em produção.

---

## Resumo — quando usar o quê

| Preciso de... | Use |
|---|---|
| Protótipo rápido, CRUD simples | **GORM** |
| Máxima performance, queries complexas | **SQLC** |
| Controle total, aprender SQL | **database/sql** puro |
| Migrations versionadas | **golang-migrate** ou **goose** |
| Relações automáticas (Preload, Join) | **GORM** |
| Erros de SQL pegos na compilação | **SQLC** |
| Projeto pequeno → cresceu → precisa otimizar | Comece com **GORM**, migre queries críticas para **SQLC** |
