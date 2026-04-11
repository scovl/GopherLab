---
title: Princípios SOLID em Go
description: "SRP, OCP, LSP, ISP e DIP com exemplos idiomáticos."
estimatedMinutes: 60
recursos:
  - https://dave.cheney.net/2016/08/20/solid-go-design
experimentacao:
  desafio: Refatore um código monolítico (handler que faz tudo - HTTP, validação, banco) aplicando cada princípio SOLID.
  dicas:
    - "SRP: separe handler, service, repository"
    - "ISP: interface Repository com apenas os métodos usados"
    - "DIP: service recebe interface, não struct concreto"
  codeTemplate: |
    package main

    import "fmt"

    // ════ ANTES: monolito que viola SOLID ════

    // Handler que faz TUDO: HTTP, validação, "banco", log
    // Viola: SRP, DIP, OCP, ISP
    // func criarUsuarioHandler(w http.ResponseWriter, r *http.Request) {
    //   var u User
    //   json.NewDecoder(r.Body).Decode(&u)
    //   if u.Name == "" { http.Error(w, "nome vazio", 400); return }
    //   db.Exec("INSERT INTO users ...", u.Name, u.Email)
    //   log.Printf("user criado: %s", u.Name)
    //   json.NewEncoder(w).Encode(u)
    // }

    // ════ DEPOIS: aplicando SOLID ════

    // SRP — cada tipo tem uma responsabilidade
    type User struct {
    	Name  string
    	Email string
    }

    // ISP — interfaces pequenas e focadas
    type UserSaver interface {
    	Save(u User) error
    }

    type UserFinder interface {
    	FindByEmail(email string) (*User, error)
    }

    // DIP — service depende de interface, não de implementação
    type UserService struct {
    	store UserSaver
    }

    func NewUserService(store UserSaver) *UserService {
    	return &UserService{store: store}
    }

    func (s *UserService) Create(name, email string) error {
    	if name == "" {
    		return fmt.Errorf("nome é obrigatório")
    	}
    	return s.store.Save(User{Name: name, Email: email})
    }

    // OCP — novos notifiers sem modificar UserService
    type Notifier interface {
    	Notify(msg string) error
    }

    type EmailNotifier struct{}

    func (n *EmailNotifier) Notify(msg string) error {
    	fmt.Println("Email:", msg)
    	return nil
    }

    type SlackNotifier struct{}

    func (n *SlackNotifier) Notify(msg string) error {
    	fmt.Println("Slack:", msg)
    	return nil
    }

    // LSP — qualquer Notifier é substituível
    func notificarTodos(notifiers []Notifier, msg string) {
    	for _, n := range notifiers {
    		n.Notify(msg)
    	}
    }

    func main() {
    	notifiers := []Notifier{&EmailNotifier{}, &SlackNotifier{}}
    	notificarTodos(notifiers, "Usuário criado com sucesso")
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **SRP (Single Responsibility)** — `UserService` só tem lógica de negócio; não sabe de HTTP, banco ou logging. O handler HTTP decodifica JSON e chama `service.Create()`. O repositório persiste. Cada um muda por um motivo diferente.

    **ISP (Interface Segregation)** — `UserSaver` tem 1 método (`Save`), `UserFinder` tem 1 método (`FindByEmail`). Se o service só salva, dependa só de `UserSaver`. Em Go, interfaces com 1-2 métodos são a norma: `io.Reader`, `io.Writer`, `fmt.Stringer`. Interfaces grandes forçam dependências desnecessárias.

    **DIP (Dependency Inversion)** — `UserService` recebe `UserSaver` (interface) no construtor, não `*PostgresRepo` (concreto). Resultado: (1) testável — passe um mock; (2) flexível — troque PostgreSQL por Redis sem alterar o service.

    **OCP (Open/Closed)** — para adicionar notificação por SMS, crie `SMSNotifier` que implementa `Notifier`. Não modifique `notificarTodos` nem `UserService`. Em Go, interfaces implícitas significam que qualquer tipo que tenha `Notify(string) error` é automaticamente um `Notifier`.

    **LSP (Liskov Substitution)** — todo `Notifier` é substituível sem alterar comportamento. Se `SlackNotifier` lançasse panic em certas mensagens, violaria LSP. O contrato: `Notify` recebe string, retorna error, nunca entra em panic.

    **Go vs OOP clássico** — Go não tem herança. Composição (`type Service struct { store UserSaver }`) substitui. Interfaces implícitas tornam ISP e DIP naturais — não precisa declarar "implements".
socializacao:
  discussao: SOLID foi criado para OOP com herança. Faz sentido em Go que usa composição?
  pontos:
    - "Go não tem herança – composição é mais flexível"
    - Interfaces implícitas facilitam ISP e DIP naturalmente
    - Pragmatismo > purismo – aplique onde faz diferença
  diasDesafio: Dias 77–82
  sugestaoBlog: "SOLID em Go: design com composição e interfaces implícitas"
  hashtagsExtras: '#golang #solid #cleancode'
aplicacao:
  projeto: Refatore um monolito em Go aplicando os 5 princípios com before/after.
  requisitos:
    - Demonstrar cada princípio
    - Testes para validar refatoração
    - Documentar decisões de design
  criterios:
    - Cada princípio aplicado
    - Código mais testável
    - Sem regressões
  starterCode: |
    package main

    import (
    	"encoding/json"
    	"fmt"
    	"net/http"
    )

    // ════ CÓDIGO MONOLÍTICO (refatore aplicando SOLID) ════

    // Este handler faz tudo: decode, validação, persistência, resposta
    // Seu desafio: separe em Service, Repository (interface), Handler

    type Produto struct {
    	Nome  string  `json:"nome"`
    	Preco float64 `json:"preco"`
    }

    var produtos = map[string]Produto{}
    var nextID = 1

    func criarProdutoHandler(w http.ResponseWriter, r *http.Request) {
    	var p Produto
    	json.NewDecoder(r.Body).Decode(&p)
    	if p.Nome == "" {
    		http.Error(w, "nome obrigatório", 400)
    		return
    	}
    	if p.Preco <= 0 {
    		http.Error(w, "preço inválido", 400)
    		return
    	}
    	id := fmt.Sprintf("%d", nextID)
    	nextID++
    	produtos[id] = p
    	w.WriteHeader(201)
    	json.NewEncoder(w).Encode(p)
    }

    // TODO: Extraia interface ProdutoRepository { Save, FindByID }
    // TODO: Crie ProdutoService com validação de negócio
    // TODO: Crie ProdutoHandler que só faz HTTP decode/encode
    // TODO: Crie mockRepository e teste ProdutoService isolado
    // TODO: Adicione interface Notifier para notificação (OCP)
    // TODO: Garanta que todas as implementações são substituíveis (LSP)

    func main() {
    	http.HandleFunc("POST /produtos", criarProdutoHandler)
    	fmt.Println("Refatore este código aplicando SOLID")
    }

---

SOLID é um conjunto de princípios de design de software. Go os aplica naturalmente através de interfaces implícitas, composição e pacotes.

## S — Single Responsibility Principle

Cada struct/package tem **uma responsabilidade**. Não misture lógica de negócio com I/O, validação com persistência.

## O — Open/Closed Principle

Aberto para extensão, fechado para modificação. Interfaces permitem estender comportamento **sem modificar código existente**:

```go
type Notifier interface{ Notify(msg string) error }
// Adicione EmailNotifier, SMSNotifier, SlackNotifier sem modificar o UseCase
```

## L — Liskov Substitution Principle

Tipos que implementam uma interface devem ser **substituíveis** sem alterar o comportamento esperado. Em Go, qualquer tipo que implementa a interface pode ser usado no lugar de outro.

## I — Interface Segregation Principle

Interfaces **pequenas e focadas**:

```go
type Reader interface{ Read(p []byte) (n int, err error) }   // 1 método
type Writer interface{ Write(p []byte) (n int, err error) }  // 1 método
type ReadWriter interface{ Reader; Writer }                  // composição
```

Não force clientes a depender de métodos que não usam.

## D — Dependency Inversion Principle

Dependa de **interfaces**, não de implementações concretas:

```go
// ❌ Concreto
type Service struct{ db *sql.DB }

// ✅ Abstrato (testável, extensível)
type Storage interface { Save(item Item) error }
type Service struct{ storage Storage }
```

Isso facilita testes (mock da interface) e troca de implementação (PostgreSQL → Redis) sem alterar o `Service`.
