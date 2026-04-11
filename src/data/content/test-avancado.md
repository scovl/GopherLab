---
title: Mocks, Fuzzing e Benchmarks
description: Interfaces para mocking, testify, fuzzing (Go 1.18+), benchmarks e profiling.
estimatedMinutes: 45
recursos:
  - https://github.com/stretchr/testify
  - https://go.dev/doc/fuzz/
  - https://pkg.go.dev/testing#hdr-Benchmarks
experimentacao:
  desafio: Crie mock para uma interface Repository, escreva testes isolados do banco, adicione benchmark para uma função de sorting e fuzz para um parser.
  dicas:
    - "Mock manual: struct que implementa interface"
    - "Testify: assert.Equal(t, expected, got)"
    - go test -bench=. -benchmem -count=5
    - go test -fuzz=FuzzNome -fuzztime=30s
  codeTemplate: |
    package store

    import (
    	"errors"
    	"fmt"
    	"strings"
    	"testing"
    )

    // Interface para mocking
    type UserRepo interface {
    	FindByID(id string) (*User, error)
    	Save(u *User) error
    }

    type User struct {
    	ID   string
    	Name string
    }

    var ErrNotFound = errors.New("not found")

    // Mock manual — implementa a interface
    type mockRepo struct {
    	users map[string]*User
    	saved []*User
    }

    func (m *mockRepo) FindByID(id string) (*User, error) {
    	u, ok := m.users[id]
    	if !ok {
    		return nil, ErrNotFound
    	}
    	return u, nil
    }

    func (m *mockRepo) Save(u *User) error {
    	m.saved = append(m.saved, u)
    	return nil
    }

    // Service que depende da interface
    type UserService struct {
    	repo UserRepo
    }

    func (s *UserService) Greet(id string) (string, error) {
    	u, err := s.repo.FindByID(id)
    	if err != nil {
    		return "", fmt.Errorf("greet: %w", err)
    	}
    	return "Olá, " + u.Name + "!", nil
    }

    func TestGreet(t *testing.T) {
    	mock := &mockRepo{users: map[string]*User{
    		"1": {ID: "1", Name: "Alice"},
    	}}
    	svc := &UserService{repo: mock}

    	t.Run("user exists", func(t *testing.T) {
    		msg, err := svc.Greet("1")
    		if err != nil {
    			t.Fatal("unexpected error:", err)
    		}
    		if msg != "Olá, Alice!" {
    			t.Errorf("got %q; want %q", msg, "Olá, Alice!")
    		}
    	})

    	t.Run("user not found", func(t *testing.T) {
    		_, err := svc.Greet("999")
    		if !errors.Is(err, ErrNotFound) {
    			t.Errorf("got %v; want ErrNotFound", err)
    		}
    	})
    }

    // Benchmark
    func BenchmarkGreet(b *testing.B) {
    	mock := &mockRepo{users: map[string]*User{
    		"1": {ID: "1", Name: "Alice"},
    	}}
    	svc := &UserService{repo: mock}
    	for i := 0; i < b.N; i++ {
    		svc.Greet("1")
    	}
    }

    // Fuzz
    func FuzzGreetName(f *testing.F) {
    	f.Add("Alice")
    	f.Add("")
    	f.Add("日本語")
    	f.Fuzz(func(t *testing.T, name string) {
    		mock := &mockRepo{users: map[string]*User{
    			"1": {ID: "1", Name: name},
    		}}
    		svc := &UserService{repo: mock}
    		msg, err := svc.Greet("1")
    		if err != nil {
    			t.Fatal(err)
    		}
    		if !strings.HasPrefix(msg, "Olá, ") {
    			t.Errorf("greeting %q doesn't start with 'Olá, '", msg)
    		}
    	})
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **Mock manual via interface** — `mockRepo` implementa `UserRepo` com um `map` interno. Não precisa de framework: defina a interface, crie struct com os dados de teste, implemente os métodos. Go incentiva interfaces pequenas (1-3 métodos) — fáceis de mocar.

    **`errors.Is(err, ErrNotFound)`** — no test de "user not found", verificamos que o erro **wrapped** (`"greet: not found"`) ainda contém o sentinela original. Sem wrapping com `%w`, isso falharia. Teste sempre a cadeia de erros, não a mensagem.

    **Benchmark `b.N`** — o framework ajusta `b.N` automaticamente para obter medição estável. `go test -bench=. -benchmem -count=5` mostra ns/op, B/op e allocs/op. `-count=5` roda 5 vezes para detectar variação.

    **`b.ResetTimer()`** — se o benchmark tem setup pesado, chame `b.ResetTimer()` após o setup para não contaminar a medição. `b.ReportAllocs()` é equivalente a `-benchmem` para um benchmark específico.

    **Fuzzing `f.Add` + `f.Fuzz`** — `f.Add("seed")` define o seed corpus; o fuzzer gera variações automaticamente. Inputs que causam panic são salvos em `testdata/fuzz/FuzzNome/` e executados em testes normais. Use fuzzing para funções que aceitam input do usuário.

    **Testify** — `assert.Equal(t, expected, got)` dá diff claro na falha. `require.NoError(t, err)` para na primeira falha (equivalente a `t.Fatal`). Testify é opcional — Go nativo é suficiente para a maioria dos casos.
socializacao:
  discussao: "Mocks vs integration tests: qual o balanço ideal?"
  pontos:
    - "Mocks: rápidos, isolados, testam lógica"
    - "Integration: lentos, reais, testam conexão"
    - Fuzzing encontra bugs que testes manuais não acham
  diasDesafio: Dias 45–52
  sugestaoBlog: "Mocks, Fuzzing e Benchmarks: testando além do básico em Go"
  hashtagsExtras: '#golang #testing #fuzzing #benchmark'
aplicacao:
  projeto: Adicione testes completos a um projeto com unit (mock), fuzz (parser) e bench (hot path).
  requisitos:
    - Mocks para dependências externas
    - Fuzzing para funções que aceitam input do usuário
    - Benchmarks para funções críticas
  criterios:
    - Suite completa
    - Mocks isolam deps
    - Benchmarks documentados
  starterCode: |
    package calc

    import (
    	"errors"
    	"testing"
    )

    type Calculator interface {
    	Add(a, b float64) float64
    	Divide(a, b float64) (float64, error)
    }

    var ErrDivideByZero = errors.New("division by zero")

    type calculator struct{}

    func (c *calculator) Add(a, b float64) float64 { return a + b }

    func (c *calculator) Divide(a, b float64) (float64, error) {
    	if b == 0 {
    		return 0, ErrDivideByZero
    	}
    	return a / b, nil
    }

    func New() Calculator { return &calculator{} }

    // TODO: implemente TestAdd com table-driven tests
    //   Casos: positivos, negativos, zeros, floats grandes

    // TODO: implemente TestDivide com table-driven tests
    //   Inclua caso de divisão por zero com errors.Is

    // TODO: implemente BenchmarkAdd e BenchmarkDivide

    // TODO: implemente FuzzDivide
    //   - Seed: (10, 2), (0, 1), (1, 0)
    //   - Verifique: result * b ≈ a (com tolerância)
    //   - Verifique: b == 0 retorna ErrDivideByZero

    // TODO: crie mockCalculator para testar código que depende
    //   da interface Calculator sem usar a implementação real

    func TestPlaceholder(t *testing.T) {
    	c := New()
    	_ = c
    	t.Log("Implemente os testes acima")
    }

---

## Mocking com interfaces

Mocking em Go é feito naturalmente com interfaces: define-se a dependência como interface, e o teste fornece uma implementação fake. **Não é necessário framework especial.**

```go
type UserRepo interface {
    FindByID(id string) (*User, error)
}

type mockRepo struct{ users map[string]*User }

func (m *mockRepo) FindByID(id string) (*User, error) {
    u, ok := m.users[id]
    if !ok { return nil, ErrNotFound }
    return u, nil
}
```

- **Testify** (`github.com/stretchr/testify`): `assert.Equal(t, expected, got)` com diff claro, `require` (fatal na primeira falha)
- **gomock** (`uber-go/mock`): gera código de mock a partir de interfaces via `mockgen`

## Benchmarks

```go
func BenchmarkSoma(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Soma(1, 2)
    }
}
```

```bash
go test -bench=. -benchmem -benchtime=5s -count=3
```

- `-benchmem`: mostra `allocs/op` e `B/op` — essencial para otimizar hot paths
- `b.ResetTimer()`: reinicia o contador após setup
- `b.ReportAllocs()`: equivalente a `-benchmem` para o benchmark específico

## Fuzzing (Go 1.18+)

```go
func FuzzSoma(f *testing.F) {
    f.Add(1, 2)  // seed corpus
    f.Fuzz(func(t *testing.T, a, b int) {
        result := Soma(a, b)
        if result != a+b {
            t.Errorf("Soma(%d, %d) = %d", a, b, result)
        }
    })
}
```

```bash
go test -fuzz=FuzzSoma -fuzztime=30s
```

Inputs que causam panic são salvos em `testdata/fuzz/FuzzNome/` e reproduzidos em execuções normais.

## Profiling

```bash
go test -cpuprofile=cpu.out -memprofile=mem.out
go tool pprof cpu.out
```
