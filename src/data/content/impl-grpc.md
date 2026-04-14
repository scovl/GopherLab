---
title: gRPC e Protocol Buffers
description: Comunicação entre serviços com gRPC, protobuf e streaming.
estimatedMinutes: 50
recursos:
  - https://grpc.io/docs/languages/go/
  - https://protobuf.dev/
experimentacao:
  desafio: Crie um serviço gRPC de produtos - defina .proto, gere código, implemente server e client.
  dicas:
    - "Instale protoc e plugins: protoc-gen-go, protoc-gen-go-grpc"
    - "Use reflection para debugging: grpcurl"
    - Teste com grpcurl ou Evans (REPL gRPC)
  codeTemplate: |
    package main

    import (
    	"context"
    	"fmt"
    	"log"
    	"net"

    	"google.golang.org/grpc"
    	pb "exemplo/proto/user"
    )

    // Server implementa a interface gerada pelo protoc
    type server struct {
    	pb.UnimplementedUserServiceServer
    	users map[string]*pb.User
    }

    func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    	user, ok := s.users[req.Id]
    	if !ok {
    		return nil, fmt.Errorf("usuário %s não encontrado", req.Id)
    	}
    	return user, nil
    }

    func (s *server) ListUsers(req *pb.ListRequest, stream pb.UserService_ListUsersServer) error {
    	count := 0
    	for _, user := range s.users {
    		if int32(count) >= req.Limit {
    			break
    		}
    		if err := stream.Send(user); err != nil {
    			return err
    		}
    		count++
    	}
    	return nil
    }

    func main() {
    	lis, err := net.Listen("tcp", ":50051")
    	if err != nil {
    		log.Fatal(err)
    	}
    	s := grpc.NewServer()
    	pb.RegisterUserServiceServer(s, &server{
    		users: map[string]*pb.User{
    			"1": {Id: "1", Name: "Gopher", Email: "gopher@go.dev"},
    		},
    	})
    	fmt.Println("gRPC server em :50051")
    	log.Fatal(s.Serve(lis))
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`pb.UnimplementedUserServiceServer`** — struct embeddada que é **obrigatória** em servidores gRPC. Implementa todos os métodos com retorno "unimplemented". Fornece forward compatibility: se novas RPCs forem adicionadas ao `.proto`, o server compila sem implementá-las (retornam erro).

    **`protoc --go_out=. --go-grpc_out=.`** — gera duas coisas: (1) structs Go para as mensagens (`User`, `GetUserRequest`) com serialização protobuf; (2) interfaces e registradores para o serviço gRPC. Campos protobuf usam numeração (`string id = 1`) que define o formato binário.

    **Server streaming** — `ListUsers(req, stream)` envia múltiplos `User` via `stream.Send()`. O client itera com `stream.Recv()` em loop até `io.EOF`. Streaming é ideal para listas grandes (sem carregar tudo na memória) e para eventos real-time.

    **`grpc.NewServer()`** — cria servidor que aceita interceptors (equivalente a middleware): `grpc.UnaryInterceptor(loggingInterceptor)` para RPCs unárias, `grpc.StreamInterceptor(...)` para streaming. Use para logging, autenticação, rate limiting.

    **gRPC vs REST** — gRPC usa protobuf (binário, ~10x menor que JSON), HTTP/2 (multiplexing, server push), e tem **schema tipado** obrigatório. Ideal para comunicação entre microsserviços. Para APIs públicas, exponha REST via **gRPC-Gateway** que traduz automaticamente.

    **Proto3 syntax** — campos são opcionais por padrão (zero value se não enviados). `repeated` para listas, `oneof` para union types, `map<K,V>` para maps. Enums começam do 0.
socializacao:
  discussao: "gRPC vs REST: quando usar cada um?"
  pontos:
    - "gRPC: microsserviços internos, streaming, performance"
    - "REST: APIs públicas, browser, simplicidade"
    - "gRPC-Gateway: expõe gRPC como REST automaticamente"
  diasDesafio: Dias 83–90
  sugestaoBlog: "gRPC com Go: do .proto ao servidor em produção"
  hashtagsExtras: '#golang #grpc #protobuf'
aplicacao:
  projeto: Microsserviço gRPC completo com server, client, streaming e testes.
  requisitos:
    - Proto definitions com mensagens e serviço
    - Server e client implementation
    - Server streaming
  criterios:
    - Proto compilando
    - Comunicação funcional
    - Testes de integração
  starterCode: |
    package main

    import (
    	"context"
    	"fmt"
    	"log"
    	"net"

    	"google.golang.org/grpc"
    	pb "exemplo/proto/product"
    )

    type productServer struct {
    	pb.UnimplementedProductServiceServer
    	products map[string]*pb.Product
    	nextID   int
    }

    // TODO: implemente CreateProduct(ctx, req) (*pb.Product, error)
    //   - Gere ID, armazene no map
    //   - Retorne o produto criado

    // TODO: implemente GetProduct(ctx, req) (*pb.Product, error)
    //   - Busque por ID, retorne error se não encontrado

    // TODO: implemente ListProducts(req, stream) error
    //   - Envie todos os produtos via stream.Send

    // TODO: defina o arquivo .proto:
    //   syntax = "proto3";
    //   service ProductService {
    //     rpc CreateProduct(CreateProductRequest) returns (Product);
    //     rpc GetProduct(GetProductRequest) returns (Product);
    //     rpc ListProducts(ListProductsRequest) returns (stream Product);
    //   }

    func main() {
    	lis, err := net.Listen("tcp", ":50051")
    	if err != nil {
    		log.Fatal(err)
    	}
    	s := grpc.NewServer()
    	pb.RegisterProductServiceServer(s, &productServer{
    		products: make(map[string]*pb.Product),
    	})
    	fmt.Println("gRPC product server em :50051")
    	log.Fatal(s.Serve(lis))
    }

---

## O que é gRPC? — serviços conversando entre si

Imagine que você tem vários microsserviços: um cuida de usuários, outro de pedidos, outro de pagamentos. Eles precisam **conversar entre si**. Como?

- **REST/JSON:** funciona, mas é texto → lento para parsear, sem schema obrigatório
- **gRPC/Protobuf:** binário → rápido, schema obrigatório → type-safe, código gerado → menos bugs

> **Analogia:** REST é como enviar uma **carta** (texto, lento, qualquer formato). gRPC é como uma **ligação telefônica** (direto, formato fixo, resposta imediata).

O gRPC é usado por Google, Netflix, Uber e quase toda arquitetura de microsserviços moderna. Docker e Kubernetes também usam gRPC internamente.

---

## REST vs gRPC — comparação honesta

| Aspecto | REST | gRPC |
|---|---|---|
| Formato dos dados | JSON (texto) | Protobuf (binário, ~10x menor) |
| Protocolo | HTTP/1.1 | HTTP/2 (mais rápido) |
| Schema | Opcional (OpenAPI/Swagger) | **Obrigatório** (arquivo `.proto`) |
| Geração de código | Opcional | Automática (server + client) |
| Streaming | Não nativo | **4 tipos** de streaming |
| Browser | Funciona direto | Precisa de proxy (gRPC-Web) |
| Melhor para | APIs públicas, web | Microsserviços internos |

> **Quando usar gRPC?** Quando serviços **internos** precisam conversar de forma rápida e type-safe. Para APIs públicas que browsers acessam, continue com REST.

---

## Protocol Buffers (Protobuf) — a "linguagem" do gRPC

Antes de criar um serviço gRPC, você precisa definir **o contrato** num arquivo `.proto`. É como um formulário: define quais campos existem e de que tipo são.

### Definindo mensagens (os dados)

```protobuf
syntax = "proto3";

package user;

// Mensagem = struct com campos numerados
message User {
    string id    = 1;   // campo 1: ID do usuário
    string name  = 2;   // campo 2: nome
    string email = 3;   // campo 3: email
}
```

### Os números (1, 2, 3) são importantes!

Os números **não são valores** — são **identificadores** do campo no formato binário:

| Regra | Detalhe |
|---|---|
| Cada campo tem um número **único** | `string id = 1` → id é o campo 1 |
| Nunca mude o número depois de publicar | Quebraria clientes antigos |
| Pode adicionar campos novos com números novos | Compatibilidade mantida |
| Campos 1-15 usam 1 byte | Use para campos mais comuns |

```protobuf
message User {
    string id    = 1;   // ✅ campo 1
    string name  = 2;   // ✅ campo 2
    string email = 3;   // ✅ campo 3
    // Quando precisar adicionar:
    string phone = 4;   // ✅ número novo — não quebra nada
}
```

### Definindo o serviço (as funções)

```protobuf
service UserService {
    // Unary: uma request → uma response
    rpc GetUser(GetUserRequest) returns (User);

    // Server streaming: uma request → várias responses
    rpc ListUsers(ListUsersRequest) returns (stream User);
}

message GetUserRequest {
    string id = 1;
}

message ListUsersRequest {
    int32 limit = 1;
}
```

> **Leia `rpc` como uma função:** `GetUser` recebe `GetUserRequest` e retorna `User`. `ListUsers` recebe `ListUsersRequest` e retorna um **stream** de `User` (vários, um de cada vez).

---

## Os 4 tipos de comunicação gRPC

| Tipo | O que acontece | Exemplo real |
|---|---|---|
| **Unary** | 1 request → 1 response | Buscar um usuário por ID |
| **Server streaming** | 1 request → várias responses | Listar milhares de itens sem carregar tudo |
| **Client streaming** | Várias requests → 1 response | Upload de arquivo em pedaços |
| **Bidirecional** | Várias ↔ várias (ao mesmo tempo) | Chat em tempo real |

```
Unary:              Client ──req──→ Server ──resp──→ Client
Server streaming:   Client ──req──→ Server ══resp══→══resp══→══resp══→ Client
Client streaming:   Client ══req══→══req══→ Server ──resp──→ Client
Bidirecional:       Client ══req══↔══resp══ Server (ambos ao mesmo tempo)
```

Na maioria dos projetos, **Unary** e **Server streaming** cobrem 90% dos casos.

---

## Passo a passo: do .proto ao servidor Go

### Passo 1: Instale as ferramentas

```bash
# Instala o compilador protobuf
# No Mac: brew install protobuf
# No Linux: apt install protobuf-compiler
# No Windows: baixe de github.com/protocolbuffers/protobuf/releases

# Instala os plugins Go
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
```

### Passo 2: Escreva o .proto (já vimos acima)

```protobuf
// proto/user/user.proto
syntax = "proto3";
package user;
option go_package = "exemplo/proto/user";

service UserService {
    rpc GetUser(GetUserRequest) returns (User);
    rpc ListUsers(ListUsersRequest) returns (stream User);
}

message GetUserRequest { string id = 1; }
message ListUsersRequest { int32 limit = 1; }
message User { string id = 1; string name = 2; string email = 3; }
```

### Passo 3: Gere o código Go

```bash
protoc --go_out=. --go-grpc_out=. proto/user/user.proto
```

Isso gera **automaticamente**:
- `user.pb.go` — structs Go para cada message (`User`, `GetUserRequest`, etc.)
- `user_grpc.pb.go` — interface do server e client pronto para usar

> **Você nunca edita esses arquivos.** Eles são regenerados toda vez que você roda `protoc`.

### Passo 4: Implemente o servidor

```go
// O protoc gerou a interface. Você implementa a lógica:

type server struct {
    pb.UnimplementedUserServiceServer  // obrigatório — forward compatibility
    users map[string]*pb.User
}

// Unary — buscar um usuário
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    user, ok := s.users[req.Id]
    if !ok {
        return nil, fmt.Errorf("usuário %s não encontrado", req.Id)
    }
    return user, nil
}

// Server streaming — listar usuários um por um
func (s *server) ListUsers(req *pb.ListUsersRequest, stream pb.UserService_ListUsersServer) error {
    count := 0
    for _, user := range s.users {
        if int32(count) >= req.Limit {
            break
        }
        if err := stream.Send(user); err != nil {  // envia um de cada vez
            return err
        }
        count++
    }
    return nil  // fecha o stream
}
```

### O que é `UnimplementedUserServiceServer`?

Se amanhã você adicionar uma nova RPC no `.proto` (ex: `rpc DeleteUser`), mas não implementar no server, ele **ainda compila**. O `Unimplemented...` retorna erro "not implemented" para RPCs não implementadas.

> **Sem ele:** o server não compila até você implementar TODAS as RPCs. Com ele: compila sempre, RPCs novas retornam erro padrão.

### Passo 5: Suba o servidor

```go
func main() {
    // gRPC escuta em TCP (não HTTP!)
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        log.Fatal(err)
    }

    s := grpc.NewServer()
    pb.RegisterUserServiceServer(s, &server{
        users: map[string]*pb.User{
            "1": {Id: "1", Name: "Gopher", Email: "gopher@go.dev"},
        },
    })

    // Habilita reflection — necessário para grpcurl e Evans
    // Import: "google.golang.org/grpc/reflection"
    reflection.Register(s)

    fmt.Println("gRPC server em :50051")
    log.Fatal(s.Serve(lis))
}
```

### Passo 6: Crie o client

```go
func main() {
    // Conecta ao servidor (insecure apenas para dev/localhost)
    // Import: "google.golang.org/grpc/credentials/insecure"
    conn, err := grpc.NewClient("localhost:50051",
        grpc.WithTransportCredentials(insecure.NewCredentials()))
    if err != nil {
        log.Fatal(err)
    }
    defer conn.Close()

    client := pb.NewUserServiceClient(conn)

    // Chamada unary — como chamar uma função remota
    user, err := client.GetUser(context.Background(), &pb.GetUserRequest{Id: "1"})
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Usuário: %s (%s)\n", user.Name, user.Email)
}
```

> **Perceba:** o client chama `client.GetUser(ctx, req)` como se fosse uma **função local**. O gRPC cuida de serializar, enviar pela rede, deserializar e devolver o resultado. O código gerado faz toda a mágica.

---

## Interceptors — middleware do gRPC

Assim como HTTP tem middleware, gRPC tem **interceptors**:

```go
// Interceptor de logging (como middleware HTTP)
func loggingInterceptor(
    ctx context.Context,
    req interface{},
    info *grpc.UnaryServerInfo,
    handler grpc.UnaryHandler,
) (interface{}, error) {
    start := time.Now()
    resp, err := handler(ctx, req)  // chama o handler real
    log.Printf("%s %v %v", info.FullMethod, time.Since(start), err)
    return resp, err
}

// Aplica ao servidor
s := grpc.NewServer(grpc.UnaryInterceptor(loggingInterceptor))
```

---

## Testando com grpcurl — o "curl" do gRPC

Como gRPC é binário, você não pode testar com `curl`. Use `grpcurl`:

```bash
# Instale
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest

# Liste os serviços (server precisa ter reflection habilitado)
grpcurl -plaintext localhost:50051 list

# Chame uma RPC
grpcurl -plaintext -d '{"id": "1"}' localhost:50051 user.UserService/GetUser
```

---

## Resumo — o fluxo completo

```
1. Escreva o .proto          → define o contrato (messages + services)
2. Rode protoc               → gera código Go automaticamente
3. Implemente os métodos do serviço   → a lógica de negócio
4. Suba o server             → net.Listen + grpc.NewServer
5. Use o client gerado       → client.GetUser(ctx, req) — como função local
```

| Decisão | Escolha |
|---|---|
| Microsserviços internos, performance | **gRPC** |
| API pública para browsers/mobile | **REST** |
| Precisa de streaming | **gRPC** |
| Schema obrigatório entre times | **gRPC** |
| Preciso que funcione no browser direto | **REST** (ou gRPC-Web) |
