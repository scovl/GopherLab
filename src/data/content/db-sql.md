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

## O que é `database/sql`?

É o pacote da **stdlib** que Go usa para falar com bancos de dados SQL (PostgreSQL, MySQL, SQLite, etc.). Mas ele sozinho **não sabe falar com nenhum banco** — precisa de um **driver**.

> **Analogia:** `database/sql` é como uma **tomada universal**. O driver (pgx, pq, mysql) é o **adaptador** para cada tipo de banco. A tomada é sempre a mesma — só troca o adaptador.

```mermaid
flowchart TD
  code(["🐹 Seu código Go"])
  std(["📦 database/sql\ninterface padrão"])
  drv(["🔌 Driver\npgx · pq · mysql"])
  db(["🗄️ PostgreSQL · MySQL · SQLite"])

  code --> std --> drv --> db

  style code fill:#e0f7ff,stroke:#0090b8,color:#0c4a6e
  style std  fill:#fef9c3,stroke:#ca8a04,color:#713f12
  style drv  fill:#fce7f3,stroke:#db2777,color:#831843
  style db   fill:#dcfce7,stroke:#16a34a,color:#14532d
```

---

## Conectando ao banco — passo a passo

### Passo 1: Importe o driver (com `_`)

```go
import (
    "database/sql"
    _ "github.com/lib/pq"  // driver PostgreSQL
)
```

> **Por que `_`?** Você não usa o pacote diretamente. O `_` faz o Go importar o pacote **só para executar o `init()`**, que registra o driver. Sem o `_`, o Go remove o import por "não usado".

### Passo 2: Abra a conexão

```go
db, err := sql.Open("postgres", "host=localhost user=app dbname=livros sslmode=disable")
if err != nil {
    log.Fatal(err)
}
defer db.Close()
```

### ⚠️ Armadilha: `sql.Open` NÃO conecta!

```go
db, err := sql.Open(...)  // ✅ Só valida os argumentos. NÃO tenta conectar!
// Nesse ponto, o banco pode estar fora do ar e você não sabe.

err = db.Ping()  // ✅ AGORA sim, tenta conectar de verdade
```

> **Analogia:** `sql.Open` é como **salvar o número do telefone**. `db.Ping` é **ligar para ver se a pessoa atende**.

### Passo 3: Sempre use `Context`

```go
ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
defer cancel()

err := db.PingContext(ctx)  // se não conectar em 3 segundos → erro
```

> Em servidores HTTP, use `r.Context()` — se o cliente desconectar, a query é cancelada automaticamente. Sem context, uma query lenta fica rodando **para sempre**.

---

## SQL Injection — o perigo número 1

### O que é?

Imagine que você faz login assim:

```go
// ❌ NUNCA FAÇA ISSO — concatenar valores no SQL
query := "SELECT * FROM users WHERE email = '" + email + "'"
db.QueryRow(query)
```

Se alguém digitar no campo email:

```
' OR '1'='1
```

A query vira:

```sql
SELECT * FROM users WHERE email = '' OR '1'='1'
--                                     ^^^^^^^^^ isso é SEMPRE true!
-- Resultado: retorna TODOS os usuários!
```

> **Analogia:** é como se alguém pedisse ao caixa do banco: "quero sacar dinheiro da conta 123... **ou de qualquer conta que exista**". E o caixa obedecesse.

### A solução: placeholders (prepared statements)

```go
// ✅ CORRETO — valores ficam separados do SQL
db.QueryRowContext(ctx,
    "SELECT * FROM users WHERE email = $1",  // $1 = placeholder
    email,                                     // valor passado separadamente
)
```

O driver envia a query e os valores **separadamente**. O banco sabe: "$1 é um VALOR, não código SQL". Impossível injetar.

| Banco | Placeholder |
|---|---|
| PostgreSQL | `$1`, `$2`, `$3` |
| MySQL | `?`, `?`, `?` |
| SQLite | `?`, `?`, `?` |

> **Regra absoluta:** NUNCA monte SQL com `+`, `fmt.Sprintf`, ou string interpolation. SEMPRE use placeholders.

---

## As 3 formas de fazer queries

### 1. `QueryRowContext` — buscar **UMA** linha

```go
var nome string
var idade int

err := db.QueryRowContext(ctx,
    "SELECT nome, idade FROM users WHERE id = $1", id,
).Scan(&nome, &idade)
//     ^^^^^ mapeia cada coluna para uma variável

if err == sql.ErrNoRows {
    fmt.Println("usuário não encontrado")  // não é erro "fatal"
} else if err != nil {
    log.Fatal(err)  // erro real (rede caiu, SQL errado, etc.)
}
```

> **`sql.ErrNoRows`** é um erro **sentinela** (lembra da aula de erros?). Significa "o SELECT não encontrou nada". Não é erro fatal — é só "não achei".

### 2. `QueryContext` — buscar **VÁRIAS** linhas

```go
rows, err := db.QueryContext(ctx,
    "SELECT id, nome FROM users ORDER BY nome",
)
if err != nil {
    log.Fatal(err)
}
defer rows.Close()  // ⚠️ OBRIGATÓRIO! Sem isso, vaza conexão

for rows.Next() {            // para cada linha...
    var id int
    var nome string
    err := rows.Scan(&id, &nome)  // mapeia as colunas
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("%d: %s\n", id, nome)
}

// Depois do loop, verifica se teve erro DURANTE a iteração
if err := rows.Err(); err != nil {
    log.Fatal(err)
}
```

### ⚠️ Por que `defer rows.Close()` é obrigatório?

Cada `rows` **ocupa uma conexão** do pool. Se você não fizer `Close()`, a conexão **nunca volta** para o pool. Depois de algumas chamadas, o pool esgota e o programa **trava**.

> **Analogia:** é como pegar um livro na biblioteca e nunca devolver. Depois de um tempo, não sobra livro para ninguém.

### 3. `ExecContext` — INSERT, UPDATE, DELETE (não retorna linhas)

```go
result, err := db.ExecContext(ctx,
    "INSERT INTO users (nome, email) VALUES ($1, $2)",
    "Alice", "alice@go.dev",
)
if err != nil {
    log.Fatal(err)
}

linhasAfetadas, _ := result.RowsAffected()
fmt.Printf("%d linhas inseridas\n", linhasAfetadas)
```

### Resumo das 3 formas

| Método | Quando usar | Retorno |
|---|---|---|
| `QueryRowContext` | SELECT que retorna **1** linha | `.Scan()` direto |
| `QueryContext` | SELECT que retorna **várias** linhas | `rows` (itere com `Next()`) |
| `ExecContext` | INSERT, UPDATE, DELETE | `result` (RowsAffected) |

---

## Connection Pool — o Go gerencia conexões para você

`sql.DB` **não é UMA conexão**. É um **pool** (piscina) de conexões:

```
sql.DB (pool)
├── Conexão 1: ocupada (query rodando)
├── Conexão 2: ociosa (pronta para usar)
├── Conexão 3: ociosa
└── ... até MaxOpenConns
```

### Configurando o pool

```go
db.SetMaxOpenConns(25)              // máximo de conexões ao mesmo tempo
db.SetMaxIdleConns(5)               // quantas ficam "prontas" quando ociosas
db.SetConnMaxLifetime(5 * time.Minute)  // recicla conexões velhas
```

| Configuração | O que faz | Valor típico |
|---|---|---|
| `MaxOpenConns` | Limite de conexões simultâneas | 25 |
| `MaxIdleConns` | Conexões mantidas prontas | 5 |
| `ConnMaxLifetime` | Tempo máximo de vida de uma conexão | 5 min |

> **Por que reciclar?** Firewalls e proxies matam conexões paradas demais. `ConnMaxLifetime` fecha e reabre antes que elas morram sozinhas.

> **Por que limitar?** Sem limite, 1000 requests simultâneos abrirão 1000 conexões. O PostgreSQL tem limite (default 100). Seu programa travaria esperando conexão.

---

## pgx — o driver "turbo" para PostgreSQL

O driver `lib/pq` funciona, mas está em modo manutenção. O **pgx** é mais rápido e tem mais recursos:

| Recurso | lib/pq | pgx |
|---|---|---|
| Protocolo | Texto | **Binário** (mais rápido) |
| Arrays nativos | Não | Sim |
| JSONB nativo | Não | Sim |
| Connection pool próprio | Não | `pgxpool` |
| Status | Manutenção | **Ativo** |

### Usando pgx com database/sql (mais fácil de migrar)

```go
import (
    "database/sql"
    _ "github.com/jackc/pgx/v5/stdlib"  // registra pgx como driver
)

db, err := sql.Open("pgx", "postgres://user:pass@localhost/db")
```

### Usando pgx direto (máxima performance)

```go
import "github.com/jackc/pgx/v5/pgxpool"

pool, err := pgxpool.New(ctx, "postgres://user:pass@localhost/db")
defer pool.Close()

var nome string
err = pool.QueryRow(ctx, "SELECT nome FROM users WHERE id = $1", 1).Scan(&nome)
```

> **Dica:** se está começando, use `pgx` via `database/sql` (segundo exemplo). A API é a mesma que vimos acima. Se precisar de performance máxima depois, migre para `pgxpool` direto.

---

## Transações — tudo ou nada

Imagine transferir dinheiro: debitar da conta A e creditar na conta B. Se debitar mas falhar ao creditar, o dinheiro **sumiu**!

Transações garantem: **ou todas as operações acontecem, ou nenhuma**.

```go
// Começa a transação
tx, err := db.BeginTx(ctx, nil)
if err != nil {
    return err
}
defer tx.Rollback()  // se algo der errado → desfaz TUDO

// Operação 1: debita
_, err = tx.ExecContext(ctx,
    "UPDATE contas SET saldo = saldo - $1 WHERE id = $2", valor, contaOrigem)
if err != nil {
    return err  // defer faz Rollback automaticamente
}

// Operação 2: credita
_, err = tx.ExecContext(ctx,
    "UPDATE contas SET saldo = saldo + $1 WHERE id = $2", valor, contaDestino)
if err != nil {
    return err  // defer faz Rollback automaticamente
}

// Tudo deu certo → confirma!
return tx.Commit()
// Depois do Commit, o defer tx.Rollback() vira no-op (não faz nada)
```

### O padrão `defer Rollback` + `Commit` no final

```
1. BeginTx        → inicia transação
2. defer Rollback → "se eu sair sem Commit, desfaz tudo"
3. Operações...   → usa tx (não db!) para queries
4. Commit         → confirma tudo
   └── Se Commit ok → defer Rollback é ignorado
   └── Se erro antes do Commit → defer Rollback desfaz tudo
```

> ⚠️ Dentro da transação, use `tx.ExecContext` / `tx.QueryContext` — **não** `db.ExecContext`. Usar `db` em vez de `tx` roda a query **fora** da transação!

---

## Os 5 erros mais comuns de iniciantes

| Erro | Consequência | Solução |
|---|---|---|
| Concatenar valores no SQL | SQL Injection | Use placeholders (`$1`, `?`) |
| Esquecer `defer rows.Close()` | Leak de conexões → programa trava | Sempre `defer rows.Close()` |
| Não chamar `rows.Err()` | Erro de rede ignorado silenciosamente | Verifique após o loop |
| Usar `db` em vez de `tx` na transação | Query roda fora da transação | Use `tx.ExecContext`, não `db.` |
| Não configurar o pool | Conexões demais → banco rejeita | Configure `SetMaxOpenConns` |

---

## Resumo — o fluxo completo

```
1. sql.Open("driver", dsn)     → cria o pool (não conecta!)
2. db.PingContext(ctx)          → testa a conexão de verdade
3. Configure o pool             → SetMaxOpenConns, SetMaxIdleConns
4. Queries com placeholders     → NUNCA concatene valores
5. defer rows.Close()           → sempre feche os rows
6. rows.Err() após o loop       → verifique erros de iteração
7. Transações: BeginTx + defer Rollback + Commit
```

| Preciso de... | Use |
|---|---|
| Buscar 1 registro | `db.QueryRowContext` + `Scan` |
| Buscar vários registros | `db.QueryContext` + `rows.Next()` + `Scan` |
| INSERT, UPDATE, DELETE | `db.ExecContext` |
| Tudo ou nada (transação) | `db.BeginTx` → `tx.Exec...` → `tx.Commit` |
| Driver PostgreSQL rápido | `pgx` (via stdlib ou direto) |
| Verificar se "não encontrou" | `errors.Is(err, sql.ErrNoRows)` |
