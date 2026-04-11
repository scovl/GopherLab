---
title: Constraints Avançadas
description: constraints.Ordered, union types, ~T, limitações e design patterns.
estimatedMinutes: 40
recursos:
  - https://pkg.go.dev/golang.org/x/exp/constraints
  - https://go.dev/blog/intro-generics
experimentacao:
  desafio: Implemente BinarySearch e MergeSort genéricos usando constraints.Ordered. Compare performance com sort.Slice.
  dicas:
    - go get golang.org/x/exp para usar constraints
    - "Crie sua constraint: type Numeric interface { ~int | ~float64 }"
    - "~ é essencial para aceitar type aliases"
  codeTemplate: |
    package main

    import (
    	"cmp"
    	"fmt"
    )

    // Constraint customizada com union types e tilde
    type Number interface {
    	~int | ~int8 | ~int16 | ~int32 | ~int64 |
    	~float32 | ~float64
    }

    func Sum[T Number](nums []T) T {
    	var total T
    	for _, n := range nums {
    		total += n
    	}
    	return total
    }

    // BinarySearch genérico com cmp.Ordered (stdlib Go 1.21)
    func BinarySearch[T cmp.Ordered](sorted []T, target T) int {
    	lo, hi := 0, len(sorted)-1
    	for lo <= hi {
    		mid := lo + (hi-lo)/2
    		switch {
    		case sorted[mid] == target:
    			return mid
    		case sorted[mid] < target:
    			lo = mid + 1
    		default:
    			hi = mid - 1
    		}
    	}
    	return -1
    }

    // Min genérico
    func Min[T cmp.Ordered](a, b T) T {
    	if a < b {
    		return a
    	}
    	return b
    }

    // Tipo definido com underlying type
    type Celsius float64
    type Fahrenheit float64

    func main() {
    	// Sum aceita ~float64 — inclui Celsius
    	temps := []Celsius{20.5, 25.0, 18.3}
    	fmt.Printf("Soma das temperaturas: %.1f°C\n", Sum(temps))

    	// BinarySearch com strings
    	nomes := []string{"Alice", "Bob", "Charlie", "Diana"}
    	idx := BinarySearch(nomes, "Charlie")
    	fmt.Println("Charlie no índice:", idx)

    	// Min com int
    	fmt.Println("Min(3, 7):", Min(3, 7))
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`~int` (tilde)** — significa "qualquer tipo cujo **underlying type** é `int`". `type Idade int` satisfaz `~int` mas NÃO satisfaz `int` sem tilde. Sem `~`, apenas o tipo exato seria aceito. Sempre use `~` nas constraints para aceitar tipos definidos pelo usuário.

    **`cmp.Ordered` (Go 1.21, stdlib)** — constraint que permite `<`, `>`, `<=`, `>=`. Inclui todos os tipos numéricos e `string`. Substituiu `golang.org/x/exp/constraints.Ordered` que existia apenas como experimental.

    **`Number` interface — union de tipos** — `~int | ~float64 | ...` define o conjunto de tipos aceitos. Diferente de interfaces com métodos, essas interfaces **só podem ser usadas como constraints** — não como tipo de variável. `var x Number` é erro de compilação.

    **`Sum[T Number](nums []T) T`** — o `+` é permitido porque todos os tipos em `Number` suportam adição. Se a constraint fosse `any`, `+` seria erro de compilação. A constraint determina quais operações estão disponíveis.

    **Tipo `Celsius` com `Sum`** — `Celsius` tem underlying type `float64`, que satisfaz `~float64` na constraint `Number`. O resultado é `Celsius`, não `float64` — o type parameter preserva o tipo concreto.

    **Limitações** — (1) não existe specialization (tratar `int` diferente de `float64` dentro de uma função genérica); (2) métodos não podem ter type params próprios; (3) conversão `[]T` → `[]interface{}` not allowed; (4) variádicos genéricos não existem.
socializacao:
  discussao: Go acertou no design de generics? Quais limitações surpreenderam?
  pontos:
    - Métodos não podem ter type params próprios
    - Sem specialization (tratamento especial por tipo)
    - Comparado com C++ templates - muito mais simples
    - "Go priorizou simplicidade — trade-off válido"
  diasDesafio: Dias 69–76
  sugestaoBlog: "Constraints em Go: ~T, union types e limitações dos generics"
  hashtagsExtras: '#golang #generics #constraints'
aplicacao:
  projeto: Biblioteca de algoritmos genéricos com BinarySearch, MergeSort e MinHeap.
  requisitos:
    - BinarySearch[T constraints.Ordered]
    - MergeSort[T constraints.Ordered]
    - MinHeap[T constraints.Ordered] com Push/Pop/Peek
  criterios:
    - Corretos
    - Performance competitiva
    - Testes com edge cases
  starterCode: |
    package main

    import (
    	"cmp"
    	"fmt"
    )

    // TODO: implemente MergeSort[T cmp.Ordered](s []T) []T
    //   - Divida o slice ao meio recursivamente
    //   - Combine os resultados ordenados (merge)
    //   - Caso base: len(s) <= 1

    // TODO: implemente MinHeap[T cmp.Ordered]
    //   - struct com []T interno
    //   - Push(v T) — adiciona e sobe (sift up)
    //   - Pop() (T, bool) — remove menor e desce (sift down)
    //   - Peek() (T, bool) — retorna menor sem remover
    //   - Len() int

    // TODO: implemente Clamp[T cmp.Ordered](val, min, max T) T
    //   - Retorna val limitado ao range [min, max]

    // TODO: implemente Contains[T comparable](s []T, v T) bool

    func main() {
    	nums := []int{5, 3, 8, 1, 9, 2, 7, 4, 6}
    	// sorted := MergeSort(nums)
    	// fmt.Println("Sorted:", sorted)

    	// heap := NewMinHeap[int]()
    	// for _, n := range nums { heap.Push(n) }
    	// for heap.Len() > 0 { v, _ := heap.Pop(); fmt.Print(v, " ") }

    	_ = nums
    	_ = cmp.Ordered
    	fmt.Println("Implemente MergeSort, MinHeap, Clamp e Contains")
    }

---

Constraints em Go generics são **interfaces** que definem o conjunto de tipos permitidos e as operações disponíveis:

1. Interface com métodos (como `io.Reader`) — habilita apenas esses métodos
2. Interface com union de tipos (`int | string`) — habilita operações comuns a todos
3. Combinação de ambos

## O operador ~ (tilde)

```go
type Minutes int  // underlying type é int

func Double[T ~int](v T) T {  // aceita int E Minutes
    return v * 2
}
```

`~int` significa "qualquer tipo cujo **underlying type** é `int`". Sem `~`, apenas o tipo exato `int` satisfaria a constraint.

Tipicamente as constraints customizadas usam `~` para aceitar tipos definidos:

```go
type Integer interface {
    ~int | ~int8 | ~int16 | ~int32 | ~int64
}
```

## Constraints da stdlib

- **`cmp.Ordered`** (Go 1.21, stdlib): todos os tipos com `>`, `<`, `>=`, `<=`
- `slices.Sort[S ~[]E, E cmp.Ordered](s S)` usa isso na prática

O pacote `golang.org/x/exp/constraints` (experimental) oferece: `Ordered`, `Integer`, `Float`, `Complex`, `Signed`, `Unsigned`.

## Limitações atuais

| Limitação | Detalhe |
|---|---|
| Type params em métodos | Não permitido — apenas no receiver da struct |
| Specialization | Não existe — mesmo código gerado para todos os tipos |
| Conversão `[]T` → `[]interface{}` | Não permitido |
| Variádicos genéricos | Não existem |

Essas limitações foram **escolhas deliberadas de simplicidade** e podem ser relaxadas em versões futuras.
