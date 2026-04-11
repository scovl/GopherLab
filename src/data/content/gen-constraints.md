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

## Recapitulando: o que é uma constraint?

Na lição anterior, você viu que generics permitem escrever funções que funcionam com vários tipos. Mas **quem decide quais tipos são permitidos?** As **constraints** (restrições).

Uma constraint é uma **interface** que diz ao compilador: "esse type parameter só aceita tipos que satisfazem essas regras".

```go
// Sem constraint — aceita QUALQUER tipo, mas não pode fazer quase nada
func Primeiro[T any](lista []T) T { return lista[0] }

// Com constraint — aceita só tipos comparáveis com < >
func Menor[T cmp.Ordered](a, b T) T {
    if a < b {  // ✅ isso funciona porque cmp.Ordered garante que < existe
        return a
    }
    return b
}
```

> **Analogia:** constraint é como a **placa na entrada de um brinquedo** — "você precisa ter pelo menos 1,20m para entrar". Se o tipo não cumpre o requisito, o compilador não deixa passar.

---

## Os 3 tipos de constraints

### 1. Interface com métodos (a que você já conhece)

```go
type Stringer interface {
    String() string
}

func Imprimir[T Stringer](v T) {
    fmt.Println(v.String())  // pode chamar String() porque a constraint garante
}
```

### 2. Interface com union de tipos (novidade dos generics)

```go
type Numero interface {
    int | float64 | int32
}

func Dobrar[T Numero](v T) T {
    return v * 2  // pode usar * porque int, float64 e int32 suportam multiplicação
}
```

O `|` funciona como "OU": aceita `int` **ou** `float64` **ou** `int32`.

### 3. Combinação dos dois

```go
type NumeroComTexto interface {
    ~int | ~float64
    String() string   // também precisa ter esse método
}
```

### Tabela resumo

| Tipo de constraint | O que permite | Exemplo |
|---|---|---|
| `any` | Qualquer tipo | Só pode comparar com `==` (se `comparable`) |
| Interface com métodos | Chamiar os métodos declarados | `io.Reader` → pode chamar `Read()` |
| Interface com union | Operações comuns dos tipos listados | `int \| float64` → pode usar `+`, `*`, `<` |
| Combinação | Métodos + operações dos tipos | O tipo precisa satisfazer ambos |

---

## O operador `~` (til) — a peça que faltava

Esse é o detalhe que mais confunde iniciantes. Vamos por partes.

### O problema

Em Go, você pode criar tipos novos baseados em tipos existentes:

```go
type Celsius float64    // tipo novo, mas "por baixo" é float64
type Idade int          // tipo novo, mas "por baixo" é int
```

Agora, se sua constraint diz:

```go
type Numero interface {
    int | float64
}
```

`Celsius` **NÃO** satisfaz essa constraint! Porque `Celsius` não é `float64` — é um tipo **diferente** que por acaso tem a mesma estrutura interna.

### A solução: `~`

O `~` (til) significa **"qualquer tipo cujo tipo base é..."**:

```go
type Numero interface {
    ~int | ~float64    // ← com til!
}
```

Agora `Celsius` (base `float64`) e `Idade` (base `int`) **satisfazem** a constraint!

### Comparação lado a lado

```go
// Sem ~ → APENAS o tipo exato
type SoInt interface { int }
// ✅ int
// ❌ type Idade int     ← rejeitado!

// Com ~ → o tipo exato E qualquer tipo baseado nele
type QualquerInt interface { ~int }
// ✅ int
// ✅ type Idade int     ← aceito!
// ✅ type Codigo int    ← aceito!
```

> **Regra prática:** sempre use `~` nas suas constraints, a menos que tenha um motivo específico para não usar. Sem `~`, você rejeita tipos customizados do usuário da sua biblioteca.

### Exemplo completo

```go
type Celsius float64
type Fahrenheit float64

type Temperatura interface {
    ~float64    // aceita Celsius, Fahrenheit, e qualquer tipo baseado em float64
}

func Dobrar[T Temperatura](t T) T {
    return t * 2
}

func main() {
    c := Celsius(36.5)
    f := Fahrenheit(98.6)
    fmt.Println(Dobrar(c))  // 73.0 (tipo Celsius!)
    fmt.Println(Dobrar(f))  // 197.2 (tipo Fahrenheit!)
}
```

Note que `Dobrar(c)` retorna **`Celsius`**, não `float64`. O type parameter preserva o tipo concreto.

---

## Constraints prontas da stdlib — não reinvente a roda

### `any` e `comparable` (embutidos)

| Constraint | O que permite | Quando usar |
|---|---|---|
| `any` | Nada além de atribuir/retornar | Container genérico que não opera nos valores |
| `comparable` | `==` e `!=` | Maps (`map[K]V` exige `K comparable`), busca em slice |

```go
func Contem[T comparable](lista []T, alvo T) bool {
    for _, v := range lista {
        if v == alvo {  // ✅ comparable permite ==
            return true
        }
    }
    return false
}
```

### `cmp.Ordered` (Go 1.21+, stdlib)

Permite `<`, `>`, `<=`, `>=` — todos os tipos numéricos + `string`:

```go
import "cmp"

func Min[T cmp.Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}

Min(3, 7)          // 3
Min("ana", "bob")  // "ana" (comparação lexicográfica)
Min(3.14, 2.71)   // 2.71
```

### Hierarquia das constraints

```
any (qualquer tipo)
 └── comparable (suporta == !=)
      └── cmp.Ordered (suporta < > <= >=)
```

> **Na prática:** use `any` quando não precisa operar nos valores, `comparable` quando precisa de `==`, e `cmp.Ordered` quando precisa de ordenação.

---

## Criando suas próprias constraints

### Constraint para números

```go
type Number interface {
    ~int | ~int8 | ~int16 | ~int32 | ~int64 |
    ~float32 | ~float64
}

func Soma[T Number](nums []T) T {
    var total T
    for _, n := range nums {
        total += n  // ✅ todos os tipos na union suportam +
    }
    return total
}
```

### Constraint que combina union + método

```go
type Printable interface {
    ~int | ~string
    String() string
}
```

O tipo precisa satisfazer **ambas** as condições: ter base `int` ou `string` **E** ter o método `String()`.

---

## Interfaces com union NÃO podem ser usadas como tipo

Essa é uma pegadinha importante:

```go
type Numero interface {
    ~int | ~float64
}

// ✅ Como constraint — funciona
func Dobrar[T Numero](v T) T { return v * 2 }

// ❌ Como tipo de variável — NÃO compila!
var x Numero = 42  // ERRO: cannot use interface Numero as type
```

Interfaces com union de tipos **só podem ser usadas como constraints** de type parameters. Não podem ser usadas como tipo de variável, parâmetro de função normal ou retorno.

> **Por quê?** Porque o compilador precisa saber o tamanho exato do tipo em tempo de compilação. Uma interface com union pode ser `int` (8 bytes) ou `float64` (8 bytes) — mas poderiam ser tipos de tamanhos diferentes.

---

## Limitações dos generics em Go — o que NÃO dá para fazer

Go escolheu deliberadamente um design simples para generics. Isso significa que algumas coisas não funcionam:

| O que você quer | Funciona? | Detalhe |
|---|---|---|
| Função genérica | ✅ Sim | `func F[T any](v T) T` |
| Struct genérica | ✅ Sim | `type Box[T any] struct { Val T }` |
| **Método** com type param próprio | ❌ Não | Métodos só podem usar type params do receiver |
| Tratar `int` diferente de `string` dentro da função | ❌ Não | Não existe specialization |
| Converter `[]int` para `[]any` | ❌ Não | Slices de tipos diferentes são incompatíveis |
| Número variável de type params | ❌ Não | Não existem variádicos genéricos |

### O mais confuso: métodos não podem ter type params

```go
type Box[T any] struct { Val T }

// ✅ Método que usa o T do receiver — funciona
func (b Box[T]) Get() T { return b.Val }

// ❌ Método com type param PRÓPRIO — NÃO compila!
func (b Box[T]) Convert[U any]() U { ... }  // ERRO
```

Se precisar, transforme em função:

```go
// ✅ Função livre com dois type params — funciona
func Convert[T any, U any](b Box[T]) U { ... }
```

---

## Resumo — quando usar qual constraint

| Preciso de... | Use | Exemplo |
|---|---|---|
| Aceitar qualquer tipo | `any` | Container, wrapper |
| Comparar com `==` | `comparable` | Busca, map key |
| Comparar com `<` `>` | `cmp.Ordered` | Sort, min/max |
| Operações numéricas | Crie `Number interface { ~int \| ~float64 \| ... }` | Soma, média |
| Aceitar tipos customizados | Use `~` na constraint | `~int` aceita `type Idade int` |
