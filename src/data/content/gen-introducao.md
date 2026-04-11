---
title: Introdução a Generics
description: Type parameters, any, comparable, funções e tipos genéricos.
estimatedMinutes: 45
recursos:
  - https://go.dev/doc/tutorial/generics
  - https://go.dev/blog/intro-generics
experimentacao:
  desafio: Implemente Map, Filter e Reduce genéricos. Depois, crie um Set[T comparable] com Add, Contains, Remove, Union e Intersection.
  dicas:
    - "Map[T, U any]([]T, func(T) U) []U"
    - "Set usa map[T]struct{} internamente (memoria mínima)"
    - "Reduce[T, U any]([]T, U, func(U, T) U) U"
  codeTemplate: |
    package main

    import "fmt"

    // Map transforma cada elemento de um slice
    func Map[T, U any](s []T, fn func(T) U) []U {
    	result := make([]U, len(s))
    	for i, v := range s {
    		result[i] = fn(v)
    	}
    	return result
    }

    // Filter retorna elementos que satisfazem o predicado
    func Filter[T any](s []T, fn func(T) bool) []T {
    	var result []T
    	for _, v := range s {
    		if fn(v) {
    			result = append(result, v)
    		}
    	}
    	return result
    }

    // Reduce agrega os elementos em um único valor
    func Reduce[T, U any](s []T, initial U, fn func(U, T) U) U {
    	acc := initial
    	for _, v := range s {
    		acc = fn(acc, v)
    	}
    	return acc
    }

    // Set genérico com comparable
    type Set[T comparable] struct {
    	items map[T]struct{}
    }

    func NewSet[T comparable]() *Set[T] {
    	return &Set[T]{items: make(map[T]struct{})}
    }

    func (s *Set[T]) Add(v T)            { s.items[v] = struct{}{} }
    func (s *Set[T]) Contains(v T) bool   { _, ok := s.items[v]; return ok }
    func (s *Set[T]) Remove(v T)          { delete(s.items, v) }
    func (s *Set[T]) Len() int            { return len(s.items) }

    func main() {
    	nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

    	doubled := Map(nums, func(n int) int { return n * 2 })
    	fmt.Println("Doubled:", doubled)

    	evens := Filter(nums, func(n int) bool { return n%2 == 0 })
    	fmt.Println("Evens:", evens)

    	sum := Reduce(nums, 0, func(acc, n int) int { return acc + n })
    	fmt.Println("Sum:", sum)

    	s := NewSet[string]()
    	s.Add("go")
    	s.Add("rust")
    	s.Add("go") // duplicata ignorada
    	fmt.Println("Set size:", s.Len(), "contains go:", s.Contains("go"))
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`func Map[T, U any](s []T, fn func(T) U) []U`** — `[T, U any]` declara dois type parameters com constraint `any` (aceita qualquer tipo). O compilador instancia uma versão concreta para cada combinação de tipos usada (ex: `Map[int, string]`).

    **Inferência de tipo** — em `Map(nums, func(n int) int {...})`, não precisamos escrever `Map[int, int](...)`. O compilador deduz `T=int, U=int` a partir dos argumentos. A inferência funciona na maioria dos casos; só precisa explicitar quando há ambiguidade.

    **`comparable`** — constraint que permite `==` e `!=`. Necessário para usar como chave de map (`map[T]struct{}`). Tipos como slices, maps e funções **não satisfazem** `comparable`. Todo tipo `comparable` também satisfaz `any`, mas o inverso não é verdadeiro.

    **`map[T]struct{}`** — representação idiomática de Set em Go. `struct{}` ocupa **zero bytes** de memória, diferente de `map[T]bool` que gasta 1 byte por valor. Para milhões de elementos, a economia é significativa.

    **`var zero T`** — para obter o zero value de um type parameter, use `var zero T`. Não é possível usar `nil` (a menos que `T` seja restrito a uma interface ou tipo nilável). Zero values de tipos genéricos: `0` para números, `""` para strings, `false` para bool.

    **Limitações atuais** — (1) métodos não podem ter type params próprios (apenas o receiver da struct genérica); (2) não há specialization (tratamento especial por tipo); (3) funções genéricas não podem ser atribuídas a variáveis sem especificar os type params.
socializacao:
  discussao: Generics resolvem quais problemas? Quando NÃO usar?
  pontos:
    - "Antes: sort.IntSlice, sort.StringSlice, sort.Float64Slice..."
    - "Agora: uma função Sort[T constraints.Ordered]"
    - Não use quando interface simples resolve o problema
  diasDesafio: Dias 69–76
  sugestaoBlog: "Generics em Go: Map, Filter, Reduce e coleções type-safe"
  hashtagsExtras: '#golang #generics'
aplicacao:
  projeto: Pacote de coleções genéricas com Set[T], Queue[T] e Cache[K, V] com TTL.
  requisitos:
    - "Set: Add, Remove, Contains, Union, Intersection"
    - "Queue: Enqueue, Dequeue, Peek, Len"
    - "Cache: Get, Set com TTL, Delete, cleanup automático"
  criterios:
    - Type safety em compilação
    - Testes unitários
    - Benchmark vs interface{}
  starterCode: |
    package main

    import "fmt"

    // Set[T] — já implementado acima como referência
    type Set[T comparable] struct {
    	items map[T]struct{}
    }

    func NewSet[T comparable]() *Set[T] {
    	return &Set[T]{items: make(map[T]struct{})}
    }

    func (s *Set[T]) Add(v T)          { s.items[v] = struct{}{} }
    func (s *Set[T]) Contains(v T) bool { _, ok := s.items[v]; return ok }

    // TODO: implemente Union(other *Set[T]) *Set[T]
    // TODO: implemente Intersection(other *Set[T]) *Set[T]
    // TODO: implemente Values() []T

    // Queue[T] — fila FIFO genérica
    type Queue[T any] struct {
    	items []T
    }

    // TODO: implemente Enqueue(v T)
    // TODO: implemente Dequeue() (T, bool)
    // TODO: implemente Peek() (T, bool)
    // TODO: implemente Len() int

    // Cache[K, V] — cache com TTL
    // TODO: defina a struct Cache[K comparable, V any]
    //   com map interno e time.Duration para TTL
    // TODO: implemente Set(key K, value V)
    // TODO: implemente Get(key K) (V, bool)
    // TODO: implemente Delete(key K)

    func main() {
    	s1 := NewSet[int]()
    	s1.Add(1)
    	s1.Add(2)
    	s1.Add(3)

    	s2 := NewSet[int]()
    	s2.Add(2)
    	s2.Add(3)
    	s2.Add(4)

    	// Depois de implementar:
    	// union := s1.Union(s2)       // {1, 2, 3, 4}
    	// inter := s1.Intersection(s2) // {2, 3}
    	fmt.Println("Implemente Set.Union, Set.Intersection, Queue e Cache")
    }

---

## O problema que generics resolve

Imagine que você precisa de uma função que retorna o maior valor de um slice. Sem generics, você precisaria escrever **uma função para cada tipo**:

```go
func MaxInt(nums []int) int {
    best := nums[0]
    for _, n := range nums[1:] {
        if n > best { best = n }
    }
    return best
}

func MaxFloat64(nums []float64) float64 {
    best := nums[0]
    for _, n := range nums[1:] {
        if n > best { best = n }
    }
    return best
}

func MaxString(strs []string) string {
    // mesma lógica de novo...
}
```

**Três funções praticamente idênticas.** A única diferença é o tipo. Isso é cansativo, repetitivo e propenso a erros.

> **Analogia:** é como ter um molde de biscoito que só funciona com massa de chocolate. Se quiser baunilha, precisa de outro molde idêntico. Generics é o **molde universal** — funciona com qualquer massa.

---

## A solução: uma função, qualquer tipo

Com generics (Go 1.18+), você escreve **uma vez** e funciona para todos os tipos:

```go
func Max[T cmp.Ordered](nums []T) T {
    best := nums[0]
    for _, n := range nums[1:] {
        if n > best {
            best = n
        }
    }
    return best
}

// Funciona com int, float64, string — qualquer tipo que suporte < >
fmt.Println(Max([]int{3, 7, 1}))         // 7
fmt.Println(Max([]float64{2.1, 9.5}))    // 9.5
fmt.Println(Max([]string{"go", "rust"}))  // "rust"
```

### Decompondo a sintaxe

```go
func Max[T cmp.Ordered](nums []T) T
//       ↑              ↑          ↑
//       |              |          retorna T (o mesmo tipo que entrou)
//       |              parâmetro é []T (slice de T)
//       T = type parameter, cmp.Ordered = constraint
```

| Parte | O que significa |
|---|---|
| `[T cmp.Ordered]` | "T é um tipo qualquer, desde que suporte `<` `>` `<=` `>=`" |
| `nums []T` | "nums é um slice de T — se T for int, é []int" |
| `T` (retorno) | "retorna o mesmo tipo que entrou" |

> **Leia assim:** "Max recebe um type parameter T (que precisa ser Ordered) e um slice de T, e retorna um T."

---

## Inferência de tipo — Go adivinha o tipo para você

Na maioria dos casos, você **não precisa** dizer qual é o tipo. Go deduz:

```go
// Você PODE explicitar:
Max[int]([]int{3, 7, 1})

// Mas não PRECISA — Go vê que é []int e deduz T=int:
Max([]int{3, 7, 1})  // ← mais limpo, mesmo resultado
```

A inferência funciona quase sempre. Só precisa explicitar quando Go não consegue adivinhar (raro).

---

## Constraints — "o que T pode fazer?"

O constraint diz ao compilador quais operações são permitidas em `T`:

```go
// Constraint "any" — aceita qualquer tipo, mas não pode fazer quase nada
func Primeiro[T any](lista []T) T {
    return lista[0]  // ✅ indexar slice funciona com qualquer tipo
    // lista[0] + lista[1]  ← ❌ ERRO! "any" não garante que + existe
}

// Constraint "comparable" — pode usar == e !=
func Contem[T comparable](lista []T, alvo T) bool {
    for _, v := range lista {
        if v == alvo {  // ✅ == funciona porque constraint é "comparable"
            return true
        }
    }
    return false
}

// Constraint "cmp.Ordered" — pode usar < > <= >=
func Min[T cmp.Ordered](a, b T) T {
    if a < b {  // ✅ < funciona porque constraint é "cmp.Ordered"
        return a
    }
    return b
}
```

### Tabela das constraints mais comuns

| Constraint | O que permite | Exemplo de uso |
|---|---|---|
| `any` | Nada além de guardar e devolver | Container, wrapper |
| `comparable` | `==` e `!=` | Busca em slice, chave de map |
| `cmp.Ordered` | `<` `>` `<=` `>=` (e também `==`) | Sort, min/max, busca binária |

> **Pense assim:** constraint é como a **descrição do cargo** numa vaga de emprego. `any` = "aceito qualquer pessoa". `comparable` = "precisa saber comparar coisas". `cmp.Ordered` = "precisa saber ordenar coisas".

---

## Funções genéricas úteis: Map, Filter, Reduce

Essas três funções aparecem em quase todas as linguagens. Em Go, com generics:

### Map — transforma cada elemento

```go
func Map[T, U any](s []T, fn func(T) U) []U {
    result := make([]U, len(s))
    for i, v := range s {
        result[i] = fn(v)
    }
    return result
}

// string → int (comprimento)
nomes := []string{"Go", "Rust", "Python"}
tamanhos := Map(nomes, func(s string) int { return len(s) })
// [2, 4, 6]
```

Note os **dois** type parameters: `T` (tipo de entrada) e `U` (tipo de saída). Podem ser diferentes!

### Filter — mantém os que passam no teste

```go
func Filter[T any](s []T, fn func(T) bool) []T {
    var result []T
    for _, v := range s {
        if fn(v) {
            result = append(result, v)
        }
    }
    return result
}

pares := Filter([]int{1, 2, 3, 4, 5}, func(n int) bool {
    return n%2 == 0
})
// [2, 4]
```

### Reduce — reduz tudo a um valor

```go
func Reduce[T, U any](s []T, initial U, fn func(U, T) U) U {
    acc := initial
    for _, v := range s {
        acc = fn(acc, v)
    }
    return acc
}

soma := Reduce([]int{1, 2, 3, 4, 5}, 0, func(acc, n int) int {
    return acc + n
})
// 15
```

---

## Structs genéricas — tipos que funcionam com qualquer tipo

Assim como funções, structs também podem ter type parameters:

```go
type Caixa[T any] struct {
    Valor T
}

// Caixa de int
c1 := Caixa[int]{Valor: 42}

// Caixa de string
c2 := Caixa[string]{Valor: "Olá"}
```

### Exemplo prático: Set genérico

Um Set (conjunto) que funciona com qualquer tipo comparável:

```go
type Set[T comparable] struct {
    items map[T]struct{}
}

func NewSet[T comparable]() *Set[T] {
    return &Set[T]{items: make(map[T]struct{})}
}

func (s *Set[T]) Add(v T)          { s.items[v] = struct{}{} }
func (s *Set[T]) Contains(v T) bool { _, ok := s.items[v]; return ok }
func (s *Set[T]) Remove(v T)       { delete(s.items, v) }
func (s *Set[T]) Len() int         { return len(s.items) }
```

```go
nomes := NewSet[string]()
nomes.Add("Go")
nomes.Add("Rust")
nomes.Add("Go")           // duplicata ignorada
fmt.Println(nomes.Len())  // 2
fmt.Println(nomes.Contains("Go"))  // true
```

> **Por que `map[T]struct{}`?** O `struct{}` ocupa **zero bytes** de memória. Se usasse `map[T]bool`, cada valor gastaria 1 byte. Para milhões de elementos, a economia é significativa.

---

## Zero value de tipos genéricos

Para obter o zero value de um type parameter, use `var`:

```go
func ZeroOuValor[T any](lista []T, indice int) T {
    if indice >= len(lista) {
        var zero T      // zero value de T (0 para int, "" para string, etc.)
        return zero
    }
    return lista[indice]
}
```

> **Armadilha:** `return nil` **não funciona** com type parameters (a menos que T seja restrito a tipos niláveis). Use `var zero T` e `return zero`.

---

## Quando usar generics vs interfaces?

Essa é a dúvida mais comum:

| Use **Generics** quando... | Use **Interfaces** quando... |
|---|---|
| Precisa operar na **estrutura** (índices, `+`, `<`) | Precisa chamar **métodos** |
| Quer preservar o tipo concreto no retorno | Não importa o tipo concreto |
| Coleções: Map, Filter, Set, Queue | Comportamento: Reader, Writer, Stringer |
| O tipo importa em **compilação** | O tipo é decidido em **runtime** |

```go
// ✅ Generics: opera na estrutura (usa <)
func Min[T cmp.Ordered](a, b T) T { ... }

// ✅ Interface: opera no comportamento (chama método)
func Imprimir(w io.Writer, data []byte) { w.Write(data) }
```

> **Regra prática:** se sua função precisa de `<`, `>`, `+`, `==` nos valores → generics. Se precisa chamar `.Read()`, `.Write()`, `.String()` → interface.

---

## Resumo

| Conceito | Sintaxe | O que faz |
|---|---|---|
| Função genérica | `func F[T any](v T) T` | Funciona com qualquer tipo |
| Constraint | `[T cmp.Ordered]` | Restringe quais tipos são aceitos |
| Struct genérica | `type S[T any] struct{}` | Struct que guarda qualquer tipo |
| Inferência | `Max(nums)` em vez de `Max[int](nums)` | Go deduz o tipo automaticamente |
| Zero value | `var zero T` | Obtém o zero value do type parameter |
