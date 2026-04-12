#!/bin/bash
# Setup workspace projects for each terminal lesson module
set -e

WORKSPACE=/home/learner/workspace
GO=/usr/local/go/bin/go
GOPATH=/home/learner/go
GOCACHE=/home/learner/.cache/go-build
export GOPATH GOCACHE PATH=/usr/local/go/bin:$GOPATH/bin:$PATH

# ─── tool-qualidade ───────────────────────────────────────────────────────────
mkdir -p $WORKSPACE/tool-qualidade && cd $WORKSPACE/tool-qualidade
$GO mod init tool-qualidade
cat > main.go << 'EOF'
package main

import (
	"fmt"
	"strings"
)

// palavras conta as ocorrências de cada palavra numa frase
func palavras(s string) map[string]int {
	m := make(map[string]int)
	for _, w := range strings.Fields(s) {
		m[strings.ToLower(w)]++
	}
	return m
}

// soma retorna a soma de uma slice de inteiros
func soma(nums []int) int {
	var total int
	for _, n := range nums {
		total = total + n // golangci-lint vai sugerir +=
	}
	return total
}

// duplicatas tem código morto que staticcheck vai detectar
func duplicatas(x int) int {
	if x > 0 {
		return x * 2
	} else { // golint: else após return é desnecessário
		return 0
	}
}

func main() {
	fmt.Println(palavras("go é incrível go é rápido"))
	fmt.Println(soma([]int{1, 2, 3, 4, 5}))
	fmt.Println(duplicatas(10))
}
EOF

cat > .golangci.yml << 'EOF'
linters:
  enable:
    - govet
    - staticcheck
    - errcheck
    - gosimple
    - ineffassign
    - unused
    - misspell
    - gocritic
linters-settings:
  gocritic:
    enabled-tags:
      - diagnostic
      - style
EOF

$GO vet ./...

# ─── tool-performance ──────────────────────────────────────────────────────────
mkdir -p $WORKSPACE/tool-performance && cd $WORKSPACE/tool-performance
$GO mod init tool-performance
cat > main.go << 'EOF'
package main

import (
	"fmt"
	"net/http"
	_ "net/http/pprof" // registra automaticamente /debug/pprof
	"strings"
	"time"
)

// concat usa strings.Builder (eficiente) — compare com concatenação naïve
func concat(words []string) string {
	var sb strings.Builder
	for _, w := range words {
		sb.WriteString(w)
	}
	return sb.String()
}

// trabalhoIntenso simula processamento para gerar CPU profile
func trabalhoIntenso() {
	words := make([]string, 1000)
	for i := range words {
		words[i] = fmt.Sprintf("palavra%d", i)
	}
	for range 500 {
		_ = concat(words)
	}
}

func main() {
	// pprof disponível em http://localhost:6060/debug/pprof/
	go func() {
		http.ListenAndServe(":6060", nil)
	}()

	fmt.Println("Servidor pprof em http://localhost:6060/debug/pprof/")
	fmt.Println("Gerando carga de CPU...")

	go func() {
		for {
			trabalhoIntenso()
			time.Sleep(100 * time.Millisecond)
		}
	}()

	// Mantém o servidor vivo
	select {}
}
EOF

cat > bench_test.go << 'EOF'
package main

import (
	"fmt"
	"strings"
	"testing"
)

// BenchmarkConcat testa a implementação eficiente
func BenchmarkConcat(b *testing.B) {
	words := make([]string, 1000)
	for i := range words {
		words[i] = fmt.Sprintf("palavra%d", i)
	}
	b.ResetTimer()
	for range b.N {
		_ = concat(words)
	}
}

// BenchmarkConcatNaive para comparação — concatenação ingênua
func BenchmarkConcatNaive(b *testing.B) {
	words := make([]string, 1000)
	for i := range words {
		words[i] = fmt.Sprintf("palavra%d", i)
	}
	b.ResetTimer()
	for range b.N {
		s := ""
		for _, w := range words {
			s += w // alocação por iteração!
		}
		_ = strings.ToLower(s)
	}
}
EOF

$GO test -run='^$' ./...  # compile check only

# ─── deploy-docker-k8s ────────────────────────────────────────────────────────
mkdir -p $WORKSPACE/deploy-docker && cd $WORKSPACE/deploy-docker
$GO mod init deploy-docker
cat > main.go << 'EOF'
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

type Info struct {
	Hostname string    `json:"hostname"`
	Version  string    `json:"version"`
	Time     time.Time `json:"time"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func infoHandler(w http.ResponseWriter, r *http.Request) {
	host, _ := os.Hostname()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Info{
		Hostname: host,
		Version:  "1.0.0",
		Time:     time.Now(),
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", healthHandler)
	mux.HandleFunc("GET /info", infoHandler)

	fmt.Printf("Servidor em http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
EOF

cat > Dockerfile << 'EOF'
# Multistage build — imagem final mínima
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY *.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /server .

FROM scratch
COPY --from=builder /server /server
EXPOSE 8080
CMD ["/server"]
EOF

$GO build ./...

# ─── impl-cli ─────────────────────────────────────────────────────────────────
mkdir -p $WORKSPACE/impl-cli && cd $WORKSPACE/impl-cli
$GO mod init impl-cli
$GO get github.com/spf13/cobra@v1.8.1
cat > main.go << 'EOF'
package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "gopherlab-cli",
	Short: "CLI de exemplo — módulo impl-cli",
	Long:  `Uma CLI com subcomandos, flags e args para praticar cobra.`,
}

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Inicia o servidor HTTP",
	Run: func(cmd *cobra.Command, args []string) {
		port, _ := cmd.Flags().GetInt("port")
		fmt.Printf("🚀 Servidor iniciado na porta %d\n", port)
	},
}

var echoCmd = &cobra.Command{
	Use:   "echo [texto]",
	Short: "Ecoa o texto em maiúsculas",
	Args:  cobra.MinimumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println(strings.ToUpper(strings.Join(args, " ")))
	},
}

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Exibe a versão",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("gopherlab-cli v1.0.0")
	},
}

func init() {
	serveCmd.Flags().IntP("port", "p", 8080, "Porta do servidor")
	rootCmd.AddCommand(serveCmd, echoCmd, versionCmd)
}

func main() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}
EOF
$GO mod tidy
$GO build -o gopherlab-cli .

# ─── impl-grpc ────────────────────────────────────────────────────────────────
mkdir -p $WORKSPACE/impl-grpc && cd $WORKSPACE/impl-grpc
$GO mod init impl-grpc
$GO get google.golang.org/grpc@v1.63.2
$GO get google.golang.org/protobuf@v1.34.1
mkdir -p proto server client

cat > proto/produto.proto << 'EOF'
syntax = "proto3";
package produto;
option go_package = "./proto";

service ProdutoService {
  rpc Buscar (BuscarRequest) returns (Produto);
  rpc Listar (ListarRequest) returns (ListarResponse);
}

message BuscarRequest { string id = 1; }
message ListarRequest {}
message Produto {
  string id    = 1;
  string nome  = 2;
  double preco = 3;
}
message ListarResponse { repeated Produto produtos = 1; }
EOF

cat > server/main.go << 'EOF'
package main

import (
	"context"
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc"
	pb "impl-grpc/proto"
)

type server struct{ pb.UnimplementedProdutoServiceServer }

var produtos = map[string]*pb.Produto{
	"1": {Id: "1", Nome: "Teclado Mecânico", Preco: 299.90},
	"2": {Id: "2", Nome: "Mouse Gamer", Preco: 149.50},
	"3": {Id: "3", Nome: "Monitor 4K", Preco: 1899.00},
}

func (s *server) Buscar(_ context.Context, req *pb.BuscarRequest) (*pb.Produto, error) {
	p, ok := produtos[req.Id]
	if !ok {
		return nil, fmt.Errorf("produto %s não encontrado", req.Id)
	}
	return p, nil
}

func (s *server) Listar(_ context.Context, _ *pb.ListarRequest) (*pb.ListarResponse, error) {
	var lista []*pb.Produto
	for _, p := range produtos {
		lista = append(lista, p)
	}
	return &pb.ListarResponse{Produtos: lista}, nil
}

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatal(err)
	}
	s := grpc.NewServer()
	pb.RegisterProdutoServiceServer(s, &server{})
	log.Println("gRPC server em :50051")
	s.Serve(lis)
}
EOF

$GO mod tidy

# ─── impl-graphql ─────────────────────────────────────────────────────────────
mkdir -p $WORKSPACE/impl-graphql && cd $WORKSPACE/impl-graphql
$GO mod init impl-graphql
$GO get github.com/graphql-go/graphql@v0.8.1
$GO get github.com/graphql-go/handler@v0.2.3

cat > main.go << 'EOF'
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/graphql-go/graphql"
	"github.com/graphql-go/handler"
)

type Livro struct {
	ID     string  `json:"id"`
	Titulo string  `json:"titulo"`
	Autor  string  `json:"autor"`
	Preco  float64 `json:"preco"`
}

var livros = []Livro{
	{ID: "1", Titulo: "The Go Programming Language", Autor: "Donovan & Kernighan", Preco: 79.90},
	{ID: "2", Titulo: "Go in Action", Autor: "Kennedy et al", Preco: 89.90},
	{ID: "3", Titulo: "Concurrency in Go", Autor: "Katherine Cox-Buday", Preco: 69.90},
}

var livroType = graphql.NewObject(graphql.ObjectConfig{
	Name: "Livro",
	Fields: graphql.Fields{
		"id":     &graphql.Field{Type: graphql.String},
		"titulo": &graphql.Field{Type: graphql.String},
		"autor":  &graphql.Field{Type: graphql.String},
		"preco":  &graphql.Field{Type: graphql.Float},
	},
})

var schema, _ = graphql.NewSchema(graphql.SchemaConfig{
	Query: graphql.NewObject(graphql.ObjectConfig{
		Name: "Query",
		Fields: graphql.Fields{
			"livros": &graphql.Field{
				Type: graphql.NewList(livroType),
				Resolve: func(p graphql.ResolveParams) (any, error) {
					return livros, nil
				},
			},
			"livro": &graphql.Field{
				Type: livroType,
				Args: graphql.FieldConfigArgument{
					"id": &graphql.ArgumentConfig{Type: graphql.String},
				},
				Resolve: func(p graphql.ResolveParams) (any, error) {
					id, _ := p.Args["id"].(string)
					for _, l := range livros {
						if l.ID == id {
							return l, nil
						}
					}
					return nil, nil
				},
			},
		},
	}),
})

func main() {
	h := handler.New(&handler.Config{
		Schema:     &schema,
		Pretty:     true,
		GraphiQL:   true, // abre http://localhost:8080/graphql no browser
		Playground: true,
	})

	http.Handle("/graphql", h)
	fmt.Println("GraphQL Playground em http://localhost:8080/graphql")
	fmt.Println(`Teste: curl -X POST http://localhost:8080/graphql \`)
	fmt.Println(`  -H "Content-Type: application/json" \`)
	fmt.Println(`  -d '{"query":"{ livros { id titulo preco } }"}'`)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
EOF
$GO mod tidy
$GO build ./...

# ─── opensource (shared git setup) ────────────────────────────────────────────
mkdir -p $WORKSPACE/opensource && cd $WORKSPACE/opensource
git init -q
git config user.email "learner@gopherlab.local"
git config user.name "Aprendiz Go"
$GO mod init opensource-demo
cat > main.go << 'EOF'
// Projeto demo para contribuição open source
// Tem bugs intencionais para praticar o fluxo de PR
package main

import "fmt"

// Fibonacci calcula o n-ésimo número de Fibonacci
// BUG: não trata n < 0
func Fibonacci(n int) int {
	if n <= 1 {
		return n
	}
	return Fibonacci(n-1) + Fibonacci(n-2)
}

// Fatorial calcula n!
// BUG: não usa int64, vai overflow para n > 20
func Fatorial(n int) int {
	if n == 0 {
		return 1
	}
	return n * Fatorial(n-1)
}

func main() {
	for i := range 10 {
		fmt.Printf("Fibonacci(%d) = %d\n", i, Fibonacci(i))
	}
	fmt.Printf("Fatorial(10) = %d\n", Fatorial(10))
}
EOF

cat > main_test.go << 'EOF'
package main

import "testing"

func TestFibonacci(t *testing.T) {
	casos := []struct{ n, esperado int }{
		{0, 0}, {1, 1}, {2, 1}, {3, 2}, {5, 5}, {10, 55},
	}
	for _, tc := range casos {
		if got := Fibonacci(tc.n); got != tc.esperado {
			t.Errorf("Fibonacci(%d) = %d; quer %d", tc.n, got, tc.esperado)
		}
	}
}

func TestFatorial(t *testing.T) {
	if got := Fatorial(5); got != 120 {
		t.Errorf("Fatorial(5) = %d; quer 120", got)
	}
}
EOF

cat > CONTRIBUTING.md << 'EOF'
# Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b fix/minha-correcao`
3. Faça suas mudanças e rode os testes: `go test ./...`
4. Commit com mensagem clara: `git commit -m "fix: descrição"`
5. Abra um Pull Request
EOF

$GO mod tidy
$GO test ./...
git add .
git commit -q -m "feat: projeto inicial para prática de contribuição"

echo "✅ Workspaces configurados!"
