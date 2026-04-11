---
title: database/sql e pgx
description: Interface database/sql, drivers, prepared statements, connection pool e pgx.
estimatedMinutes: 45
recursos:
  - https://go.dev/doc/database/
  - https://github.com/jackc/pgx
experimentacao:
  desafio: Crie um CRUD com database/sql e PostgreSQL (ou SQLite) com INSERT, SELECT, UPDATE, DELETE com prepared statements e context.
  dicas:
    - "NUNCA concatene valores em SQL – use $1, $2 (postgres) ou ? (mysql/sqlite)"
    - db.Ping() verifica conexão
    - rows.Close() é obrigatório – use defer
    - sql.ErrNoRows quando SELECT não encontra nada
  codeTemplate: |
    package main

    import (
    	"context"
    	"database/sql"
    	"fmt"
    	"log"
    	"time"

    	_ "github.com/lib/pq"
    )

    type Livro struct {
    	ID    int
    	Titulo string
    	Autor  string
    }

    func conectar() *sql.DB {
    	db, err := sql.Open("postgres", "host=localhost user=app dbname=livros sslmode=disable")
    	if err != nil {
    		log.Fatal(err)
    	}
    	db.SetMaxOpenConns(25)
    	db.SetMaxIdleConns(5)
    	db.SetConnMaxLifetime(5 * time.Minute)

    	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    	defer cancel()
    	if err := db.PingContext(ctx); err != nil {
    		log.Fatal("conexão falhou:", err)
    	}
    	return db
    }

    func inserir(db *sql.DB, titulo, autor string) (int, error) {
    	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    	defer cancel()
    	var id int
    	err := db.QueryRowContext(ctx,
    		"INSERT INTO livros (titulo, autor) VALUES ($1, $2) RETURNING id",
    		titulo, autor,
    	).Scan(&id)
    	return id, err
    }

    func buscarPorID(db *sql.DB, id int) (*Livro, error) {
    	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    	defer cancel()
    	var l Livro
    	err := db.QueryRowContext(ctx,
    		"SELECT id, titulo, autor FROM livros WHERE id = $1", id,
    	).Scan(&l.ID, &l.Titulo, &l.Autor)
    	if err == sql.ErrNoRows {
    		return nil, fmt.Errorf("livro %d não encontrado", id)
    	}
    	return &l, err
    }

    func listarTodos(db *sql.DB) ([]Livro, error) {
    	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    	defer cancel()
    	rows, err := db.QueryContext(ctx, "SELECT id, titulo, autor FROM livros ORDER BY id")
    	if err != nil {
    		return nil, err
    	}
    	defer rows.Close()

    	var livros []Livro
    	for rows.Next() {
    		var l Livro
    		if err := rows.Scan(&l.ID, &l.Titulo, &l.Autor); err != nil {
    			return nil, err
    		}
    		livros = append(livros, l)
    	}
    	return livros, rows.Err()
    }

    func main() {
    	db := conectar()
    	defer db.Close()
    	id, _ := inserir(db, "The Go Programming Language", "Donovan")
    	livro, _ := buscarPorID(db, id)
    	fmt.Printf("Inserido: %+v\n", livro)
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`sql.Open` não conecta** — apenas valida os argumentos do driver. A conexão real só acontece no primeiro `Ping`, `Query` ou `Exec`. Sempre chame `db.PingContext(ctx)` para verificar a conexão.

    **`$1, $2` (PostgreSQL) ou `?` (MySQL/SQLite)** — prepared statements previnem SQL injection. O driver envia a query e os valores separadamente. **NUNCA** concatene valores: `"WHERE id = " + id` é uma vulnerabilidade.

    **`rows.Close()` é obrigatório** — sem `defer rows.Close()`, a conexão não volta para o pool, causando leak. Após o `for rows.Next()`, sempre verifique `rows.Err()` para detectar erros de rede durante iteração.

    **`sql.ErrNoRows`** — `QueryRow().Scan()` retorna esse erro sentinela quando o `SELECT` não encontra nada. `Query()` (múltiplas linhas) **não retorna** esse erro — retorna 0 linhas no iterador. Trate `ErrNoRows` como "não encontrado", não como erro fatal.

    **Connection pool** — `sql.DB` gerencia um pool de conexões automaticamente. `SetMaxOpenConns(25)` limita conexões simultâneas, `SetMaxIdleConns(5)` mantém conexões prontas, `SetConnMaxLifetime(5 * time.Minute)` recicla conexões velhas (evita problemas com firewalls/proxies).

    **Context em todas as queries** — sempre use as variantes `*Context` (`QueryContext`, `ExecContext`, `QueryRowContext`). Em servidores HTTP, passe o `r.Context()` para que queries sejam canceladas se o cliente desconectar.
socializacao:
  discussao: "SQL puro vs ORM: qual abordagem é melhor para Go?"
  pontos:
    - "SQL puro: máximo controle e performance"
    - "ORM: produtividade e abstração de banco"
    - "pgx nativo vs database/sql: performance vs portabilidade"
  diasDesafio: Dias 61–68
  sugestaoBlog: "database/sql em Go: prepared statements, pool e prevenção de SQL injection"
  hashtagsExtras: '#golang #database #sql #postgres'
aplicacao:
  projeto: Repositório de livros com database/sql com CRUD, paginação e busca.
  requisitos:
    - CRUD completo com prepared statements
    - Connection pooling configurado
    - Context com timeout em todas as queries
  criterios:
    - Sem SQL injection
    - Pool configurado
    - Erros tratados
  starterCode: |
    package main

    import (
    	"context"
    	"database/sql"
    	"fmt"
    	"log"
    	"time"

    	_ "github.com/lib/pq"
    )

    type LivroRepo struct {
    	db *sql.DB
    }

    type Livro struct {
    	ID     int    `json:"id"`
    	Titulo string `json:"titulo"`
    	Autor  string `json:"autor"`
    }

    func NovoRepo(db *sql.DB) *LivroRepo {
    	return &LivroRepo{db: db}
    }

    func (r *LivroRepo) Criar(ctx context.Context, l *Livro) error {
    	return r.db.QueryRowContext(ctx,
    		"INSERT INTO livros (titulo, autor) VALUES ($1, $2) RETURNING id",
    		l.Titulo, l.Autor,
    	).Scan(&l.ID)
    }

    // TODO: implemente BuscarPorID com sql.ErrNoRows
    // TODO: implemente Listar com paginação (LIMIT $1 OFFSET $2)
    // TODO: implemente Atualizar(ctx, id int, titulo, autor string)
    // TODO: implemente Deletar(ctx, id int)
    // TODO: implemente BuscarPorTitulo com ILIKE '%$1%'
    //       Dica: use ILIKE para case-insensitive em PostgreSQL

    func main() {
    	db, err := sql.Open("postgres", "host=localhost dbname=livros sslmode=disable")
    	if err != nil {
    		log.Fatal(err)
    	}
    	defer db.Close()
    	db.SetMaxOpenConns(25)
    	db.SetMaxIdleConns(5)
    	db.SetConnMaxLifetime(5 * time.Minute)

    	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
    	defer cancel()
    	if err := db.PingContext(ctx); err != nil {
    		log.Fatal(err)
    	}

    	repo := NovoRepo(db)
    	l := &Livro{Titulo: "Go in Action", Autor: "Kennedy"}
    	if err := repo.Criar(context.Background(), l); err != nil {
    		log.Fatal(err)
    	}
    	fmt.Printf("Criado: %+v\n", l)
    }

---

O pacote `database/sql` é a interface genérica para SQL em Go. Drivers (pgx, pq, mysql) implementam a conexão registrando-se via `sql.Register`.

## Prepared statements — prevenção de SQL injection

**Nunca** concatene valores em SQL — use `$1`, `$2` (PostgreSQL) ou `?` (MySQL/SQLite):

```go
// ❌ Errado — SQL injection
db.QueryRow("SELECT nome FROM users WHERE id = " + id)

// ✅ Correto — prepared statement
db.QueryRowContext(ctx, "SELECT nome FROM users WHERE id = $1", id).Scan(&nome)
```

## Connection pool

```go
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(5)
db.SetConnMaxLifetime(5 * time.Minute)
```

`db.Ping()` verifica conexão. `rows.Close()` é obrigatório — use `defer`. `sql.ErrNoRows` é retornado quando `SELECT` não encontra nada.

## pgx

`pgx` é o driver PostgreSQL mais performático, com:
- Suporte nativo a arrays, JSON e tipos customizados PostgreSQL
- Connection pooling via `pgxpool`
- Melhor performance que `pq` por usar o protocolo binário do PostgreSQL

## Transações

```go
tx, err := db.BeginTx(ctx, nil)
if err != nil { return err }
defer tx.Rollback()  // no-op se Commit foi chamado

// operações com tx...
return tx.Commit()
```
