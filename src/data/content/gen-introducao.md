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

Generics (Go 1.18+) permitem que funções e tipos sejam parametrizados por tipos, mantendo **type safety total** em compiletime. A sintaxe: `func F[T Constraint](args)` é instanciada pelo compilador para cada combinação de tipos concreta.

A **inferência de tipo** evita explicitar os type params na maioria das chamadas: `Filter(nums, fn)` — o compilador deduz `T=int`.

## Constraints básicas

| Constraint | Permite |
|---|---|
| `any` | Qualquer tipo — apenas atribui, passa, armazena |
| `comparable` | `==` e `!=` — necessário para chave de map ou sets |
| `~int` | `int` e qualquer tipo cujo underlying type é `int` |

## Obtendo zero value

```go
var zero T  // correto — funciona para qualquer tipo
```

Não é possível usar `nil` diretamente (a menos que `T` seja uma interface ou tipo nilável).

## Limitações do design

- Métodos **não podem ter** próprios type parameters — apenas o receiver da struct genérica
- Funções genéricas não podem ser atribuídas a variáveis sem especificar os type params
- Não há aplicação parcial de funções genéricas

## Casos de uso ideais

- Funções sobre coleções: `Map`, `Filter`, `Reduce`, `Contains`
- Tipos contêiner: `Stack`, `Queue`, `Set`, `Cache`
- Utilitários: `Must[T]`, `Ptr[T]`

> **Regra prática:** se você precisa trabalhar com a **estrutura do tipo** (índices, aritmética), use generics; se só precisa invocar métodos, use interfaces.
