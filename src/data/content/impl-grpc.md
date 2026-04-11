---
title: gRPC e Protocol Buffers
description: Comunicação entre serviços com gRPC, protobuf e streaming.
estimatedMinutes: 50

  service UserService {
    rpc GetUser(GetUserRequest) returns (User);
    rpc ListUsers(ListRequest) returns (stream User);
  }

  message GetUserRequest { string id = 1; }
  message User { string id = 1; string name = 2; string email = 3; }
  message ListRequest { int32 limit = 1; }

  // protoc --go_out=. --go-grpc_out=. user.proto
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

**gRPC** usa **Protocol Buffers** para definir serviços e mensagens em um arquivo `.proto`. É mais eficiente que REST para microsserviços (binário vs JSON, schema tipado, geração de código automática).

## Tipos de comunicação gRPC

| Tipo | Descrição |
|---|---|
| Unary | Uma request, uma response (como REST) |
| Server streaming | Uma request, stream de responses |
| Client streaming | Stream de requests, uma response |
| Bidirecional | Stream nos dois sentidos |

## Definindo um serviço

```protobuf
syntax = "proto3";

service UserService {
    rpc GetUser(GetUserRequest) returns (UserResponse);
    rpc ListUsers(ListUsersRequest) returns (stream UserResponse);
}

message GetUserRequest { string id = 1; }
message UserResponse {
    string id   = 1;
    string name = 2;
}
```

## Gerando código Go

```bash
protoc --go_out=. --go-grpc_out=. user.proto
```

Isso gera structs Go fortemente tipadas e interfaces de server/client.

## Quando usar gRPC vs REST

- **gRPC**: microsserviços internos, streaming bidirecional, performance crítica, schema first
- **REST**: APIs públicas, simplicidade, compatibilidade com browsers, tooling universal
