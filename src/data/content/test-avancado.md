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

    **`errors.Is(err, ErrNotFound)`** — no test de "user not found", verificamos que o erro **wrapped** (`"greet: not found"`) ainda contém o sentinela original. Sem wrapping com `%w`, isso falharia. Teste sempre a cadeia de erros, não a mensagem. (Revisão: `%w` e `errors.Is` foram vistos no módulo de Tratamento de Erros.)

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

No módulo básico você viu `t.Run`, `t.Helper()`, cobertura, `httptest` e subtests paralelos com `t.Parallel()`. Agora vamos às **3 técnicas** que separam testes básicos de suites profissionais:

1. **Mocking** — testar código que depende de banco/API **sem** banco/API
2. **Benchmarks** — medir **exatamente** quão rápido seu código é
3. **Fuzzing** — deixar o computador **inventar** inputs que quebram seu código

---

## 1. Mocking: Testar Sem Depender de Nada Externo

### O problema

Imagine que você tem um serviço que busca usuários no banco de dados:

```go
func Saudacao(repo BancoDeDados, id string) (string, error) {
    usuario, err := repo.BuscarPorID(id)
    if err != nil {
        return "", err
    }
    return "Olá, " + usuario.Nome + "!", nil
}
```

Para testar essa função, você precisaria de um banco de dados rodando? **Não!** Isso seria lento, frágil e complicado.

### Analogia: ator dublê de cinema

Em filmes de ação, o ator principal não pula do prédio — um **dublê** faz isso. No teste, o banco de dados real não participa — um **mock** (dublê) faz o papel dele.

### Passo a passo: criando um mock em Go

**Passo 1:** defina a dependência como **interface** (o "contrato"):

```go
type UserRepo interface {
    BuscarPorID(id string) (*User, error)
}

type User struct {
    ID   string
    Nome string
}

var ErrNaoEncontrado = errors.New("usuário não encontrado")
```

**Passo 2:** crie o mock (o "dublê"):

```go
// mockRepo é o dublê do banco de dados
type mockRepo struct {
    usuarios map[string]*User  // banco fake: só um map!
}

func (m *mockRepo) BuscarPorID(id string) (*User, error) {
    u, ok := m.usuarios[id]
    if !ok {
        return nil, ErrNaoEncontrado
    }
    return u, nil
}
```

**Passo 3:** use o mock no teste:

```go
func TestSaudacao(t *testing.T) {
    // Cria o "banco fake" com dados controlados
    mock := &mockRepo{
        usuarios: map[string]*User{
            "1": {ID: "1", Nome: "Alice"},
        },
    }

    t.Run("usuário existe", func(t *testing.T) {
        msg, err := Saudacao(mock, "1")
        if err != nil {
            t.Fatal("erro inesperado:", err)
        }
        if msg != "Olá, Alice!" {
            t.Errorf("got %q; want %q", msg, "Olá, Alice!")
        }
    })

    t.Run("usuário não existe", func(t *testing.T) {
        _, err := Saudacao(mock, "999")
        if !errors.Is(err, ErrNaoEncontrado) {
            t.Errorf("got %v; want ErrNaoEncontrado", err)
        }
    })
}
```

### O que aconteceu?

```mermaid
flowchart LR
  subgraph prod["🏭 Código real (produção)"]
    s1(["Saudacao()"])
    pg(["🐘 PostgreSQL\nlento · rede"])
    s1 --> pg
  end

  subgraph test["🧪 Código de teste"]
    s2(["Saudacao()"])
    mock(["mockRepo{}\nmap na memória\ninstantâneo ⚡"])
    s2 --> mock
  end

  style s1   fill:#e0f7ff,stroke:#0090b8,color:#0c4a6e
  style pg   fill:#fff1f2,stroke:#fca5a5,color:#7f1d1d
  style s2   fill:#e0f7ff,stroke:#0090b8,color:#0c4a6e
  style mock fill:#dcfce7,stroke:#16a34a,color:#14532d
```

> **Regra de ouro do mocking em Go:** defina dependências como **interfaces**, não como structs concretas. Assim, o teste substitui a implementação real por um mock **sem mudar nenhuma linha do código de produção**.

### Por que Go não precisa de framework de mock?

| Linguagem | Mock como? |
|-----------|-----------|
| Java | Framework (Mockito) gera proxy em runtime |
| Python | `unittest.mock` com monkey-patching |
| **Go** | **Cria struct que implementa a interface** — pronto! |

Em Go, interfaces são implementadas **implicitamente**. Se seu mock tem os mesmos métodos, ele **já implementa** a interface. Sem anotações, sem código gerado.

### Testify: mensagens de erro melhores (opcional)

O Go nativo funciona perfeitamente, mas o **Testify** dá mensagens de erro mais claras:

```go
import "github.com/stretchr/testify/assert"

func TestSaudacaoComTestify(t *testing.T) {
    mock := &mockRepo{usuarios: map[string]*User{
        "1": {ID: "1", Nome: "Alice"},
    }}

    msg, err := Saudacao(mock, "1")

    // Go nativo:
    // if err != nil { t.Fatal(err) }
    // if msg != "Olá, Alice!" { t.Errorf("got %q; want %q", msg, "Olá, Alice!") }

    // Testify — mesma coisa, mais legível:
    assert.NoError(t, err)
    assert.Equal(t, "Olá, Alice!", msg)
    //                ^^^^^^^^^^^   ^^^
    //                esperado      obtido
}
```

| Pacote | O que faz | Quando usar |
|--------|----------|-------------|
| `assert` | Marca erro, **continua** o teste | Verificar múltiplos campos |
| `require` | Marca erro e **para** imediatamente | Setup falhou, sem sentido continuar |

> **Testify é opcional.** O Go nativo (`t.Errorf`, `t.Fatal`) é suficiente. Use Testify se preferir mensagens de erro mais bonitas.

---

## 2. Benchmarks: Cronômetro Científico

### O problema

Você otimizou uma função. Ficou mais rápida? **Não adivinhe — meça.**

### Analogia: cronômetro de F1

Na F1, não medem o tempo com relógio de pulso. Usam cronômetros de milésimos que rodam a volta centenas de vezes. Benchmarks em Go fazem exatamente isso com seu código.

### Como criar um benchmark

**3 regras:**

| Regra | Exemplo | Por quê |
|-------|---------|---------|
| Arquivo termina com `_test.go` | `soma_test.go` | Mesmo arquivo dos testes |
| Função começa com `Benchmark` | `func BenchmarkSoma(...)` | Go reconhece pelo prefixo |
| Recebe `*testing.B` | `func BenchmarkSoma(b *testing.B)` | `b` (não `t`!) controla o benchmark |

### Exemplo completo

```go
// arquivo: soma_test.go

// Jeito lento: concatena com +
func juntarComMais(partes []string) string {
    resultado := ""
    for _, p := range partes {
        resultado += p  // cria string nova a cada +=
    }
    return resultado
}

// Jeito rápido: usa strings.Builder
func juntarComBuilder(partes []string) string {
    var b strings.Builder
    for _, p := range partes {
        b.WriteString(p)  // escreve no mesmo buffer
    }
    return b.String()
}

func BenchmarkJuntarComMais(b *testing.B) {
    partes := []string{"Go", " é", " demais", "!"}
    for i := 0; i < b.N; i++ {  // b.N = Go decide quantas vezes
        juntarComMais(partes)
    }
}

func BenchmarkJuntarComBuilder(b *testing.B) {
    partes := []string{"Go", " é", " demais", "!"}
    for i := 0; i < b.N; i++ {
        juntarComBuilder(partes)
    }
}
```

### Rodar o benchmark

```bash
go test -bench=. -benchmem
```

Saída:
```
BenchmarkJuntarComMais-8      3000000    400 ns/op    48 B/op   3 allocs/op
BenchmarkJuntarComBuilder-8  10000000    120 ns/op    16 B/op   1 allocs/op
```

### Como ler cada coluna

```
BenchmarkJuntarComMais-8      3000000    400 ns/op    48 B/op   3 allocs/op
│                        │    │          │            │          │
│                        │    │          │            │          └─ 3 alocações de memória
│                        │    │          │            └─ 48 bytes por operação
│                        │    │          └─ 400 nanossegundos (0.4 microsegundo)
│                        │    └─ rodou 3 milhões de vezes
│                        └─ usou 8 CPUs
└─ nome do benchmark
```

**Conclusão:** Builder é **3x mais rápido** e usa **3x menos memória**. Sem benchmark, você estaria adivinhando.

### Dicas importantes

```go
func BenchmarkComSetupPesado(b *testing.B) {
    // Setup (lento) — não queremos medir isso
    dados := carregarArquivoGrande()

    b.ResetTimer()  // ← "ignore o tempo do setup, comece a contar agora"

    for i := 0; i < b.N; i++ {
        processar(dados)  // ← só isso é medido
    }
}
```

### Comparar antes vs depois

```bash
# 1. Salva resultado ANTES da mudança
go test -bench=. -benchmem -count=5 > antes.txt

# 2. Faz a otimização no código

# 3. Salva resultado DEPOIS
go test -bench=. -benchmem -count=5 > depois.txt

# 4. Compara cientificamente
go install golang.org/x/perf/cmd/benchstat@latest
benchstat antes.txt depois.txt
```

Saída do `benchstat`:
```
                    antes          depois         delta
JuntarComMais-8     400ns ± 2%     120ns ± 1%    -70% (p=0.000)
                                                   ^^^
                                          70% mais rápido! Certeza estatística.
```

---

## 3. Fuzzing: O Computador Testa Coisas Que Você Nem Pensou

### O problema

Você testou sua função com 5 inputs que **você escolheu**. Mas e os milhares de inputs estranhos que **você não pensou**? Strings com emoji? Números gigantes? Caracteres especiais?

### Analogia: macaco apertando botões

Imagine um macaco clicando botões aleatórios do seu programa durante horas. Se algo quebrar, ele avisa. Isso é **fuzzing** — o computador gera inputs aleatórios e vê se algo dá errado.

### Como funciona

```mermaid
flowchart TD
  seeds(["🌱 Seeds\nf.Add(Alice), f.Add('') ..."])
  fuzzer(["🤖 Go Fuzzer\ngera milhares de variações\nAAA...AAA · '' · 日本語🎉 · \\x00\\xff"])
  check{"🔍 Encontrou\npanic / falha?"}
  save(["💾 Salva em testdata/\npara reproduzir sempre"])
  ok(["✅ Continua gerando\npor fuzztime"])

  seeds --> fuzzer
  fuzzer --> check
  check -->|"sim"| save
  check -->|"não"| ok
  ok --> fuzzer

  style seeds  fill:#e0f7ff,stroke:#0090b8,color:#0c4a6e
  style fuzzer fill:#fef9c3,stroke:#ca8a04,color:#713f12
  style check  fill:#fce7f3,stroke:#db2777,color:#831843
  style save   fill:#fff1f2,stroke:#fca5a5,color:#7f1d1d
  style ok     fill:#dcfce7,stroke:#16a34a,color:#14532d
```

### Passo a passo

**3 regras do fuzzing:**

| Regra | Exemplo | Por quê |
|-------|---------|---------|
| Função começa com `Fuzz` | `func FuzzParsear(...)` | Go reconhece pelo prefixo |
| Recebe `*testing.F` | `func FuzzParsear(f *testing.F)` | `f` (não `t`!) controla o fuzzing |
| Seed + Fuzz | `f.Add(...)` + `f.Fuzz(...)` | Exemplos iniciais + gerador automático |

### Exemplo completo

Imagine uma função que parseia idade a partir de string:

```go
func ParsearIdade(s string) (int, error) {
    idade, err := strconv.Atoi(strings.TrimSpace(s))
    if err != nil {
        return 0, fmt.Errorf("idade inválida: %q", s)
    }
    if idade < 0 || idade > 150 {
        return 0, fmt.Errorf("idade fora do range: %d", idade)
    }
    return idade, nil
}
```

O fuzz test:

```go
func FuzzParsearIdade(f *testing.F) {
    // 1. Seeds: exemplos que você conhece
    f.Add("25")
    f.Add("0")
    f.Add("150")
    f.Add("")
    f.Add("abc")

    // 2. Go vai gerar milhares de variações a partir dos seeds
    f.Fuzz(func(t *testing.T, input string) {
        idade, err := ParsearIdade(input)

        // Se não deu erro, a idade deve fazer sentido
        if err == nil {
            if idade < 0 || idade > 150 {
                t.Errorf("ParsearIdade(%q) = %d; deveria estar entre 0-150", input, idade)
            }
        }
        // Se deu erro, ok — a função detectou input inválido
    })
}
```

### Rodar o fuzzing

```bash
# Roda por 30 segundos gerando inputs aleatórios
go test -fuzz=FuzzParsearIdade -fuzztime=30s
```

Saída (se encontrar bug):
```
--- FAIL: FuzzParsearIdade (0.5s)
    --- FAIL: FuzzParsearIdade/abc123 (0.00s)
        idade_test.go:25: ParsearIdade("999") = 999; deveria estar entre 0-150

    Failing input written to testdata/fuzz/FuzzParsearIdade/abc123
```

### O que acontece quando encontra um bug?

```
1. Go salva o input que quebrou em:
   testdata/fuzz/FuzzParsearIdade/abc123

2. Na próxima vez que rodar go test (sem -fuzz),
   esse input é testado AUTOMATICAMENTE

3. Você corrige o bug → testa de novo → passa!
```

> **Quando usar fuzzing:** funções que recebem **input do usuário** — parsers, validadores, decodificadores. O fuzzer encontra edge cases que humanos não pensam.

---

## 4. Profiling nos Testes: Onde Está o Gargalo?

### Analogia: gravação de câmera nos testes

Além de medir tempo (benchmark), você pode gravar **o que seu código fez internamente** durante os testes. Quanto de CPU usou? Quanta memória alocou?

### Como usar

```bash
# Gera CPU profile e memory profile
go test -cpuprofile=cpu.out -memprofile=mem.out -bench=.

# Analisa CPU (onde gasta mais tempo?)
go tool pprof cpu.out
# → (pprof) top 10

# Analisa memória (onde aloca mais?)
go tool pprof mem.out
# → (pprof) top 10

# Visualiza no navegador (gráfico!)
go tool pprof -http=:8081 cpu.out
```

> **Dica:** rode profiling junto com benchmarks (`-bench=.`) para ter dados consistentes. Sem `-bench`, os testes são rápidos demais para coletar amostras significativas.

---

## `TestMain`: Setup e Teardown para o Pacote Inteiro

Às vezes você precisa de um banco de dados de teste, arquivos temporários ou um servidor fake que precisam existir **antes de qualquer teste rodar** — e ser destruídos depois. Para isso existe `TestMain`:

```go
func TestMain(m *testing.M) {
    // 1. Setup: roda ANTES de todos os testes do pacote
    db = abrirBancoDeTeste()
    defer db.Close()

    // 2. m.Run() executa todos os TestXxx, BenchmarkXxx e FuzzXxx
    codigo := m.Run()

    // 3. Teardown: roda DEPOIS de todos os testes
    limparBancoDeTeste(db)

    // 4. Encerra com o código de saída correto (0 = passou, 1 = falhou)
    os.Exit(codigo)
}
```

> **Importante:** se você define `TestMain`, precisa chamar `m.Run()` — caso contrário, nenhum teste roda. E `os.Exit(m.Run())` deve ser a última linha, pois `os.Exit` não executa defers.

| Sem `TestMain` | Com `TestMain` |
|---|---|
| Cada `TestXxx` abre e fecha sua própria conexão | Uma conexão compartilhada — muito mais rápido |
| Não há teardown garantido para o pacote | `defer` ou código após `m.Run()` garante limpeza |
| Simples, ideal para unitários | Necessário para testes de integração |

Você vai usar `TestMain` principalmente quando o módulo de Banco de Dados for integrado em testes — mas o padrão é o mesmo: abrir recurso, `m.Run()`, fechar recurso, `os.Exit`.

---

## Resumo Visual: As 3 Técnicas

```mermaid
flowchart LR
  subgraph mock["🎭 MOCKING\n\"Dublê de cinema\""]
    m1(["Substitui banco/API\npor mock"])
    m2(["*testing.T\ninterface{}"])
    m1 --> m2
  end

  subgraph bench["⏱️ BENCHMARKS\n\"Cronômetro de F1\""]
    b1(["Mede tempo e memória\ncom precisão"])
    b2(["*testing.B\nb.N loop"])
    b1 --> b2
  end

  subgraph fuzz["🐒 FUZZING\n\"Macaco apertando botões\""]
    f1(["Gera inputs aleatórios\nautomaticamente"])
    f2(["*testing.F\nf.Add + f.Fuzz"])
    f1 --> f2
  end

  style m1 fill:#e0f7ff,stroke:#0090b8,color:#0c4a6e
  style m2 fill:#e0f7ff,stroke:#0090b8,color:#0c4a6e
  style b1 fill:#fef9c3,stroke:#ca8a04,color:#713f12
  style b2 fill:#fef9c3,stroke:#ca8a04,color:#713f12
  style f1 fill:#dcfce7,stroke:#16a34a,color:#14532d
  style f2 fill:#dcfce7,stroke:#16a34a,color:#14532d
```

---

## Erros Comuns de Iniciante

| Erro | Consequência | Solução |
|------|-------------|---------|
| Testar com banco real | Testes lentos e frágeis | Mock via interface |
| Mock com struct concreta | Impossível substituir no teste | Use **interface** como dependência |
| Benchmark sem `-benchmem` | Não vê alocações (causa #1 de lentidão) | Sempre use `-benchmem` |
| Benchmark com setup no loop | Mede tempo do setup, não do código | `b.ResetTimer()` após setup |
| Não usar fuzzing em parsers | Bugs com inputs estranhos em produção | `go test -fuzz=FuzzX -fuzztime=30s` |
| Rodar `-count=1` no benchmark | Resultado pode ter variação alta | `-count=5` mínimo para consistência |

---

## Preciso de... → Use isso

| Preciso de... | Use |
|---|---|
| Testar sem banco de dados | Mock: interface + struct fake |
| Mensagens de erro mais claras nos testes | `github.com/stretchr/testify` |
| Medir quanto tempo uma função leva | `func BenchmarkX(b *testing.B)` |
| Saber quantas alocações uma função faz | `go test -bench=. -benchmem` |
| Comparar performance antes/depois | `benchstat antes.txt depois.txt` |
| Encontrar bugs com inputs aleatórios | Fuzzing: `func FuzzX(f *testing.F)` |
| Gerar mock automaticamente de interface | `go install go.uber.org/mock/mockgen@latest` |
| Ver onde o tempo é gasto nos testes | `go test -cpuprofile=cpu.out -bench=.` |
