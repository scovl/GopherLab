import { Module } from '../../types';

export const bancoDadosModule: Module = {
  id: 'banco-dados',
  title: 'Bancos de Dados',
  description: 'database/sql, prepared statements, GORM, migrations, SQLC e pgx.',
  icon: 'Database',
  color: '#E74C3C',
  lessons: [
    {
      id: 'db-sql',
      title: 'database/sql e pgx',
      description: 'Interface database/sql, drivers, prepared statements, connection pool e pgx.',
      estimatedMinutes: 45,
      vesa: {
        visaoGeral: {
          explicacao: 'O pacote `database/sql` é a interface genérica para SQL. Drivers (pq, pgx, mysql) implementam a conexão. Use prepared statements ($1, ?) para prevenir SQL injection — nunca concatene strings. `pgx` é o driver PostgreSQL mais performático, com suporte nativo a arrays, JSON e connection pooling. Sempre use `context` para timeout em queries.',
          codeExample: 'package main\n\nimport (\n\t"context"\n\t"database/sql"\n\t"fmt"\n\t"time"\n\t_ "github.com/jackc/pgx/v5/stdlib"\n)\n\nfunc main() {\n\tdb, err := sql.Open("pgx", "postgres://user:pass@localhost/dbname")\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer db.Close()\n\n\t// Connection pool config\n\tdb.SetMaxOpenConns(25)\n\tdb.SetMaxIdleConns(5)\n\tdb.SetConnMaxLifetime(5 * time.Minute)\n\n\tctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)\n\tdefer cancel()\n\n\t// Prepared statement — previne SQL injection\n\tvar nome string\n\terr = db.QueryRowContext(ctx, "SELECT nome FROM users WHERE id = $1", 1).Scan(&nome)\n\tif err != nil {\n\t\tfmt.Println("Erro:", err)\n\t\treturn\n\t}\n\tfmt.Println("Nome:", nome)\n}',
          recursos: [
            'https://go.dev/doc/database/',
            'https://github.com/jackc/pgx',
          ],
        },
        experimentacao: {
          desafio: 'Crie um CRUD com database/sql e PostgreSQL (ou SQLite): INSERT, SELECT, UPDATE, DELETE com prepared statements e context.',
          dicas: [
            'NUNCA concatene valores em SQL — use $1, $2 (postgres) ou ? (mysql/sqlite)',
            'db.Ping() verifica conexão',
            'rows.Close() é obrigatório — use defer',
            'sql.ErrNoRows quando SELECT não encontra nada',
          ],
        },
        socializacao: {
          discussao: 'SQL puro vs ORM: qual abordagem é melhor para Go?',
          pontos: [
            'SQL puro: máximo controle e performance',
            'ORM: produtividade e abstração de banco',
            'pgx nativo vs database/sql: performance vs portabilidade',
          ],
          diasDesafio: 'Dias 61–68',
          sugestaoBlog: 'database/sql em Go: prepared statements, pool e prevenção de SQL injection',
          hashtagsExtras: '#golang #database #sql #postgres',
        },
        aplicacao: {
          projeto: 'Repositório de livros com database/sql: CRUD, paginação e busca.',
          requisitos: [
            'CRUD completo com prepared statements',
            'Connection pooling configurado',
            'Context com timeout em todas as queries',
          ],
          criterios: ['Sem SQL injection', 'Pool configurado', 'Erros tratados'],
        },
      },
    },
    {
      id: 'db-gorm-sqlc',
      title: 'GORM, Migrations e SQLC',
      description: 'ORM com GORM, auto-migrations e geração de código type-safe com SQLC.',
      estimatedMinutes: 50,
      vesa: {
        visaoGeral: {
          explicacao: 'GORM é o ORM mais popular em Go: models via structs, auto-migration, associations (HasMany, BelongsTo), hooks e scopes. SQLC gera código Go type-safe a partir de queries SQL — combina segurança de tipos com controle total. GORM para prototipagem rápida; SQLC para queries otimizadas em produção.',
          codeExample: '// GORM\ntype Product struct {\n\tgorm.Model\n\tNome  string  `gorm:"size:100;not null"`\n\tPreco float64 `gorm:"not null"`\n}\n\ndb.AutoMigrate(&Product{})\ndb.Create(&Product{Nome: "Go Book", Preco: 49.90})\n\nvar produto Product\ndb.First(&produto, 1)\ndb.Where("preco > ?", 30).Find(&produtos)\n\n// SQLC — queries.sql → código Go gerado\n// -- name: GetUser :one\n// SELECT id, name, email FROM users WHERE id = $1;',
          recursos: [
            'https://gorm.io/',
            'https://sqlc.dev/',
          ],
        },
        experimentacao: {
          desafio: 'Crie a mesma API com GORM e depois com SQLC. Compare linhas de código, type safety e performance.',
          dicas: [
            'GORM: go get gorm.io/gorm gorm.io/driver/postgres',
            'SQLC: defina queries em .sql, gere com sqlc generate',
            'Compare: developer experience vs performance',
          ],
        },
        socializacao: {
          discussao: 'GORM vs SQLC vs database/sql puro: quando usar cada um?',
          pontos: [
            'GORM: prototipagem, CRUD simples, relações complexas',
            'SQLC: produção, queries otimizadas, type safety',
            'SQL puro: máximo controle, queries dinâmicas',
          ],
          diasDesafio: 'Dias 61–68',
          sugestaoBlog: 'GORM vs SQLC em Go: qual escolher para o seu projeto?',
          hashtagsExtras: '#golang #gorm #sqlc #orm',
        },
        aplicacao: {
          projeto: 'E-commerce com GORM: produtos, categorias e pedidos com relacionamentos.',
          requisitos: [
            'Modelos com HasMany/BelongsTo',
            'Auto-migrations',
            'Queries com preload e joins',
          ],
          criterios: ['Relacionamentos corretos', 'Migrations funcionais', 'Queries eficientes'],
        },
      },
    },
  ],
};
