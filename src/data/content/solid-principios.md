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

## O que é SOLID? — 5 regras para código que não vira bagunça

Conforme seu projeto cresce, o código vai ficando difícil de mudar. Mexe num lugar, quebra em outro. Adiciona uma feature, precisa mudar 10 arquivos. Testa uma coisa, precisa subir o banco de dados inteiro.

**SOLID** são 5 princípios que evitam essa bagunça:

| Letra | Nome | Tradução "for dummies" |
|---|---|---|
| **S** | Single Responsibility | Cada coisa faz **uma coisa só** |
| **O** | Open/Closed | Adicione coisas novas **sem mudar** o que já existe |
| **L** | Liskov Substitution | Se prometeu uma interface, **cumpra o contrato** |
| **I** | Interface Segregation | Interfaces **pequenas** — não force quem não precisa |
| **D** | Dependency Inversion | Dependa de **contratos**, não de implementações |

> **"Mas SOLID é de Java/C#, funciona em Go?"** Sim! Go foi desenhada com esses princípios em mente — interfaces implícitas e composição (em vez de herança) tornam SOLID **natural** em Go.

---

## S — Single Responsibility (Responsabilidade Única)

### A regra: cada struct/pacote faz UMA coisa

> **Analogia:** num restaurante, o garçom anota pedidos, o cozinheiro cozinha, e o caixa cobra. Se o garçom fizesse tudo, o restaurante seria um caos.

### ❌ Antes: handler que faz TUDO

```go
func criarUsuario(w http.ResponseWriter, r *http.Request) {
    // 1. Decodifica JSON (responsabilidade: HTTP)
    var u User
    json.NewDecoder(r.Body).Decode(&u)

    // 2. Valida (responsabilidade: negócio)
    if u.Nome == "" {
        http.Error(w, "nome vazio", 400)
        return
    }

    // 3. Salva no banco (responsabilidade: persistência)
    db.Exec("INSERT INTO users ...", u.Nome, u.Email)

    // 4. Loga (responsabilidade: observabilidade)
    log.Printf("user criado: %s", u.Nome)

    // 5. Responde (responsabilidade: HTTP de novo)
    json.NewEncoder(w).Encode(u)
}
```

Esse handler tem **5 responsabilidades**. Se mudar o banco, precisa mexer aqui. Se mudar a validação, precisa mexer aqui. Se mudar o formato do log, precisa mexer aqui.

### ✅ Depois: cada um no seu quadrado

```go
// Handler — só cuida de HTTP
func (h *Handler) criarUsuario(w http.ResponseWriter, r *http.Request) {
    var u User
    if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
        respondError(w, 400, "JSON inválido")
        return
    }
    if err := h.service.Criar(u); err != nil {
        respondError(w, 400, err.Error())
        return
    }
    respondJSON(w, 201, u)
}

// Service — só cuida de regras de negócio
type UserService struct {
    repo UserRepository
}

func (s *UserService) Criar(u User) error {
    if u.Nome == "" {
        return errors.New("nome é obrigatório")
    }
    return s.repo.Save(u)
}

// Repository — só cuida de persistência
type PostgresRepo struct { db *sql.DB }

func (r *PostgresRepo) Save(u User) error {
    _, err := r.db.Exec("INSERT INTO users ...", u.Nome, u.Email)
    return err
}
```

Agora cada parte muda por **um motivo só**:
- Mudou formato da resposta? → Só mexe no Handler
- Mudou regra de validação? → Só mexe no Service
- Trocou PostgreSQL por MongoDB? → Só mexe no Repository

---

## O — Open/Closed (Aberto/Fechado)

### A regra: adicione coisas novas SEM modificar código existente

> **Analogia:** uma tomada elétrica é **fechada** (você não abre ela pra mexer nos fios) mas **aberta** (pode plugar qualquer aparelho novo).

### ❌ Antes: precisa modificar para cada tipo novo

```go
func notificar(tipo string, msg string) {
    if tipo == "email" {
        // envia email...
    } else if tipo == "sms" {
        // envia SMS...
    } else if tipo == "slack" {
        // envia Slack...
    }
    // Cada tipo novo = mexer nessa função!
}
```

### ✅ Depois: adicione tipos novos sem mexer no existente

```go
// Contrato (interface)
type Notifier interface {
    Notify(msg string) error
}

// Implementações — cada uma num arquivo, independente
type EmailNotifier struct{}
func (n *EmailNotifier) Notify(msg string) error {
    fmt.Println("📧 Email:", msg)
    return nil
}

type SlackNotifier struct{}
func (n *SlackNotifier) Notify(msg string) error {
    fmt.Println("💬 Slack:", msg)
    return nil
}

// Usar — funciona com qualquer Notifier, presente ou futuro
func notificarTodos(notifiers []Notifier, msg string) {
    for _, n := range notifiers {
        n.Notify(msg)
    }
}

func main() {
    notifiers := []Notifier{
        &EmailNotifier{},
        &SlackNotifier{},
        // Adicionar SMSNotifier? Crie a struct e pronto!
        // NÃO precisa mexer em notificarTodos.
    }
    notificarTodos(notifiers, "Usuário criado")
}
```

> **O segredo:** a função `notificarTodos` nunca muda. Para adicionar SMS, WhatsApp ou Telegram, basta criar uma nova struct que implemente `Notify`. Em Go, interfaces são implícitas — não precisa declarar "implements".

---

## L — Liskov Substitution (Substituição de Liskov)

### A regra: se prometeu uma interface, cumpra o contrato inteiro

> **Analogia:** se um restaurante promete "delivery", espera-se que entregue a comida. Se um delivery específico sempre "esquece" o pedido, ele **viola o contrato** — não pode substituir os outros.

### ❌ Violando: implementação que "mente"

```go
type Notifier interface {
    Notify(msg string) error
}

type FakeNotifier struct{}

func (n *FakeNotifier) Notify(msg string) error {
    panic("não implementado!")  // ❌ Viola o contrato!
    // Quem usa Notifier espera que funcione, não que exploda
}
```

### ✅ Cumprindo: toda implementação funciona como esperado

```go
type EmailNotifier struct{}
func (n *EmailNotifier) Notify(msg string) error {
    // Envia email → funciona ✅
    return nil
}

type LogNotifier struct{}
func (n *LogNotifier) Notify(msg string) error {
    // Só loga → funciona ✅ (é uma implementação válida)
    log.Println(msg)
    return nil
}
```

### O contrato em Go

| Se a interface diz... | A implementação DEVE... |
|---|---|
| Retorna `error` | Retornar erro real, não panic |
| Aceita qualquer `string` | Funcionar com string vazia, longa, etc. |
| Faz alguma coisa | Realmente fazer (ou ser um no-op válido) |

> **Em Go:** como interfaces são implícitas, é fácil "acidentalmente" implementar uma interface sem cumprir o contrato. Cuidado com implementações que dão panic ou ignoram parâmetros.

---

## I — Interface Segregation (Segregação de Interfaces)

### A regra: interfaces pequenas — não force quem não precisa

> **Analogia:** imagine um controle remoto com 200 botões. Você só usa 5. Os outros 195 atrapalham. Melhor ter vários controles pequenos (um para TV, um para som) do que um gigante.

### ❌ Antes: interface gigante

```go
type UserRepository interface {
    Save(u User) error
    FindByID(id string) (*User, error)
    FindByEmail(email string) (*User, error)
    Update(u User) error
    Delete(id string) error
    ListAll() ([]User, error)
    Count() (int, error)
}

// O service de criação só precisa de Save...
// Mas é forçado a depender de uma interface com 7 métodos!
type CreateService struct {
    repo UserRepository  // ← depende de 7 métodos, usa 1
}
```

### ✅ Depois: interfaces focadas

```go
type UserSaver interface {
    Save(u User) error
}

type UserFinder interface {
    FindByID(id string) (*User, error)
}

// Cada service depende APENAS do que usa
type CreateService struct {
    repo UserSaver  // ← depende só de Save ✅
}

type GetService struct {
    repo UserFinder  // ← depende só de FindByID ✅
}

// Precisa de ambos? Componha!
type UserStore interface {
    UserSaver
    UserFinder
}
```

### Go já faz isso na stdlib!

```go
io.Reader  → 1 método: Read
io.Writer  → 1 método: Write
io.Closer  → 1 método: Close

io.ReadWriter  → Reader + Writer (composição)
io.ReadCloser  → Reader + Closer (composição)
```

> **Regra prática em Go:** interfaces com **1-3 métodos** são o ideal. Se sua interface tem 5+ métodos, provavelmente pode ser quebrada em interfaces menores.

---

## D — Dependency Inversion (Inversão de Dependência)

### A regra: dependa de contratos (interfaces), não de implementações

> **Analogia:** sua TV funciona com **qualquer tomada** que siga o padrão brasileiro. Ela não depende de "tomada da sala" — depende do **padrão**. Se trocar a tomada, a TV continua funcionando.

### ❌ Antes: depende do concreto

```go
type UserService struct {
    db *sql.DB  // ← grudado no PostgreSQL!
}

func (s *UserService) Criar(u User) error {
    _, err := s.db.Exec("INSERT INTO users ...", u.Nome)
    return err
}

// Problemas:
// - Testar exige banco PostgreSQL rodando
// - Trocar para MongoDB exige reescrever o Service
// - Service conhece detalhes de SQL
```

### ✅ Depois: depende da interface

```go
// Interface (o "padrão da tomada")
type UserStorage interface {
    Save(u User) error
}

// Service depende da interface, não do banco
type UserService struct {
    storage UserStorage  // ← qualquer coisa que saiba salvar
}

func (s *UserService) Criar(u User) error {
    if u.Nome == "" {
        return errors.New("nome obrigatório")
    }
    return s.storage.Save(u)
}
```

### Agora: troque a implementação sem mudar o Service

```go
// Produção → PostgreSQL
type PostgresStorage struct { db *sql.DB }
func (p *PostgresStorage) Save(u User) error {
    _, err := p.db.Exec("INSERT INTO users ...", u.Nome, u.Email)
    return err
}

// Testes → mock em memória (sem banco!)
type MockStorage struct { users []User }
func (m *MockStorage) Save(u User) error {
    m.users = append(m.users, u)
    return nil
}
```

```go
// Em produção:
service := &UserService{storage: &PostgresStorage{db: db}}

// Nos testes:
mock := &MockStorage{}
service := &UserService{storage: mock}
service.Criar(User{Nome: "Alice"})
// Agora verifica: mock.users[0].Nome == "Alice" ✅
// Sem banco! Sem Docker! Teste roda em milissegundos!
```

> **Este é o princípio mais importante na prática.** Ele torna seu código **testável** (mock fácil) e **flexível** (trocar implementação sem dor).

---

## O fluxo completo — tudo junto

```
Handler (HTTP)           → decodifica request, chama service, envia response
    ↓ usa
Service (Negócio)        → valida, aplica regras, chama repository
    ↓ depende de (interface, nunca do concreto)
UserStorage (Interface)  → contrato: Save, Find, Delete
    ↑ implementado por
    ├── PostgresRepo (Concreto)  → implementação real
    └── MockRepo (Concreto)      → implementação fake para testes
```

> **Esse padrão é o esqueleto da Clean Architecture.** No próximo módulo vamos formalizar esse layout num projeto completo — você vai reconhecer todo o código.

```go
// Montando tudo (main.go):
func main() {
    db := conectarBanco()

    repo := &PostgresRepo{db: db}           // concreto
    service := &UserService{storage: repo}   // recebe interface
    handler := &Handler{service: service}    // recebe service

    mux := http.NewServeMux()
    mux.HandleFunc("POST /users", handler.criarUsuario)
    http.ListenAndServe(":8080", mux)
}
```

---

## SOLID em Go vs outras linguagens

| Conceito OOP | Em Java/C# | Em Go |
|---|---|---|
| Herança | `class Dog extends Animal` | **Não existe** — use composição |
| Implements | `class Dog implements Animal` | **Implícito** — implementou os métodos? É! |
| Abstract class | `abstract class Shape` | Interface + struct com métodos |
| Interfaces grandes | Comum (5-10 métodos) | **Evite** — 1-3 métodos é o ideal |
| Injeção de dependência | Framework (Spring, Dagger) | **Manual** — passo no construtor |

> **Go é pragmático:** não precisa de framework de injeção de dependência. Passe as dependências no construtor (`NewService(repo)`) e pronto.

---

## Resumo — quando aplicar cada princípio

| Princípio | Sinal de que está violando | Solução |
|---|---|---|
| **S** — Single Responsibility | Função/struct com 100+ linhas, muitos motivos para mudar | Separe em Handler, Service, Repository |
| **O** — Open/Closed | Todo `if/else` ou `switch` para tipos novos | Use interfaces — tipos novos = nova struct |
| **L** — Liskov Substitution | Implementação que dá panic ou ignora parâmetros | Cumpra o contrato da interface |
| **I** — Interface Segregation | Interface com 5+ métodos | Quebre em interfaces com 1-3 métodos |
| **D** — Dependency Inversion | Teste exige banco/rede/serviço externo | Receba interface, não struct concreto |
