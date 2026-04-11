---
title: Ponteiros e Call by Value
description: Ponteiros, &, *, new(), call by value vs referência e nil safety.
estimatedMinutes: 40
recursos:
  - https://go.dev/tour/moretypes/1
  - https://gobyexample.com/pointers
experimentacao:
  desafio: Crie uma struct Config e funções com value receiver (leitura) e pointer receiver (modificação). Compare tamanho em memória com unsafe.Sizeof. Monte uma linked list com ponteiros.
  dicas:
    - "Structs grandes (>64 bytes): use ponteiro"
    - Slices já são referências — ponteiro para slice é raro
    - unsafe.Sizeof mostra tamanho do tipo, não do conteúdo
  codeTemplate: |
    package main

    import "fmt"

    type Ponto struct {
    	X, Y float64
    }

    func (p Ponto) Distancia() float64 {
    	return p.X*p.X + p.Y*p.Y
    }

    func (p *Ponto) Mover(dx, dy float64) {
    	p.X += dx
    	p.Y += dy
    }

    func duplicar(n *int) {
    	*n = *n * 2
    }

    func main() {
    	x := 10
    	duplicar(&x)
    	fmt.Println(x)
    	p := Ponto{3, 4}
    	p.Mover(1, 1)
    	fmt.Println(p)
    	y := new(int)
    	*y = 42
    	var ptr *int
    	if ptr != nil {
    		fmt.Println(*ptr)
    	}
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`duplicar(&x)`** — passamos o **endereço** de `x` (um `*int`). Dentro da função, `*n *= 2` derreferencia e modifica o valor original. Sem o ponteiro, a função receberia uma cópia de `x` e a modificação não seria visível fora.

    **`p.Mover(1, 1)` (pointer receiver)** — Go auto-derreferencia. O compilador executa `(&p).Mover()` automaticamente pois `Mover` tem receiver `*Ponto`. O método modifica o `Ponto` original.

    **`p.Distancia()` (value receiver)** — opera em uma **cópia** de `Ponto`. Não pode modificar o receptor. Use value receivers em tipos pequenos e operações de leitura.

    **`new(int)`** — aloca um `int` com zero value e retorna `*int`. Equivale a `var y int; return &y`. O compilador decide se aloca em stack ou heap (escape analysis) — não há `malloc` manual em Go.

    **`var ptr *int`** — sem inicialização, `ptr` é `nil`. Derreferenciar `nil` (`*ptr`) causa **panic em runtime**. Sempre verifique `ptr != nil` antes de dereferenciar.

    **Regra de ouro** — se o método modifica a struct, use pointer receiver. Se a struct tem mais de ~64 bytes, use ponteiro para evitar cópias caras. Todos os métodos de um tipo devem usar o mesmo kind de receiver (consistência).
socializacao:
  discussao: Quando usar ponteiro vs valor em Go? Qual a regra de ouro?
  pontos:
    - Se o método modifica → pointer receiver
    - "Se struct é grande (>64 bytes) → ponteiro para evitar cópia"
    - "Consistência: se um método é pointer, todos devem ser"
  diasDesafio: Dias 8–18
  sugestaoBlog: "Ponteiros em Go: value vs pointer receiver e when to use each"
  hashtagsExtras: '#golang #pointers #memory'
aplicacao:
  projeto: Implemente uma linked list com ponteiros - inserir, buscar, remover e imprimir.
  requisitos:
    - Struct Node com valor e ponteiro para próximo
    - "Funções: InsertEnd, Find, Remove, Print"
    - Tratamento de lista vazia e elemento não encontrado
  criterios:
    - Ponteiros corretos
    - Sem nil dereference
    - Testes básicos
  starterCode: |
    package main

    import "fmt"

    type No struct {
    	Valor int
    	Prox  *No
    }

    type Lista struct {
    	Cabeca *No
    	Tamanho int
    }

    func (l *Lista) Inserir(valor int) {
    	novo := &No{Valor: valor}
    	if l.Cabeca == nil {
    		l.Cabeca = novo
    	} else {
    		atual := l.Cabeca
    		for atual.Prox != nil {
    			atual = atual.Prox
    		}
    		atual.Prox = novo
    	}
    	l.Tamanho++
    }

    func (l *Lista) Imprimir() {
    	for n := l.Cabeca; n != nil; n = n.Prox {
    		fmt.Printf("%d ", n.Valor)
    	}
    	fmt.Println()
    }

    func main() {
    	var lista Lista
    	lista.Inserir(10)
    	lista.Inserir(20)
    	lista.Inserir(30)
    	lista.Imprimir()
    	fmt.Println("Tamanho:", lista.Tamanho)
    	// TODO: implemente Buscar(valor int) bool e Remover(valor int)
    }

---

## O problema: funções recebem cópias

Em Go, **tudo é passado por cópia**. Quando você passa uma variável para uma função, ela recebe uma **cópia independente** — modificar a cópia não altera o original:

```go
func tentarDobrar(n int) {
    n = n * 2  // modifica a cópia local
}

x := 10
tentarDobrar(x)
fmt.Println(x)  // 10 — não mudou nada!
```

E agora? Se eu *preciso* que a função altere minha variável?

## A solução: ponteiros

Um **ponteiro** é o endereço de memória onde uma variável mora. Em vez de passar a variável, você passa o **endereço** — e a função consegue acessar o valor original:

```go
func dobrar(n *int) {   // recebe um ponteiro para int
    *n = *n * 2          // modifica o valor no endereço
}

x := 10
dobrar(&x)              // passa o endereço de x
fmt.Println(x)          // 20 — agora sim!
```

Dois operadores para gravar:

| Operador | Leia como | O que faz | Exemplo |
|---|---|---|---|
| `&` | "endereço de" | Pega o endereço de uma variável | `&x` → ponteiro para x |
| `*` | "valor em" | Acessa o valor no endereço | `*n` → o int que mora naquele endereço |

> **Analogia:** pense num ponteiro como o **endereço de uma casa**. `&casa` te dá o endereço. `*endereco` te leva até a casa. Passar o endereço permite que alguém vá lá e mude algo na casa de verdade.

## `new()` — criar um ponteiro do zero

`new(T)` cria um valor do tipo `T` com zero value e devolve um ponteiro para ele:

```go
p := new(int)     // p é *int, apontando para um int que vale 0
*p = 42           // agora vale 42
fmt.Println(*p)   // 42
```

Na prática, a maioria dos gophers prefere a forma direta:

```go
x := 42
p := &x  // mesmo resultado: p é *int apontando para 42
```

## Ponteiro nil — a armadilha mortal

Um ponteiro sem inicializar vale `nil` (nada, nenhum endereço). Tentar acessar o valor de um ponteiro nil **causa panic** e derruba o programa:

```go
var p *int          // nil — não aponta para nada
fmt.Println(*p)     // 💥 PANIC: nil pointer dereference
```

**Sempre verifique antes de usar:**

```go
if p != nil {
    fmt.Println(*p)  // seguro
}
```

## Go NÃO tem aritmética de ponteiro

Em C/C++, você pode fazer `p++` para avançar o ponteiro para o próximo endereço. Em Go, **isso não existe**. Ponteiros são mais seguros: você só pode acessar exatamente o que eles apontam.

## Métodos: value receiver vs pointer receiver

Quando você cria métodos em structs, precisa decidir: o método recebe uma **cópia** da struct ou um **ponteiro** para ela?

```go
type Ponto struct {
    X, Y float64
}

// Value receiver — recebe cópia, NÃO modifica o original
func (p Ponto) Mostrar() {
    fmt.Printf("(%v, %v)\n", p.X, p.Y)
}

// Pointer receiver — recebe ponteiro, PODE modificar o original
func (p *Ponto) Mover(dx, dy float64) {
    p.X += dx
    p.Y += dy
}
```

Quando usar cada um:

| Situação | Use |
|---|---|
| O método só **lê** dados | Value receiver `(p Ponto)` |
| O método **modifica** a struct | Pointer receiver `(p *Ponto)` |
| A struct é grande (>64 bytes) | Pointer receiver (evita cópia cara) |
| A struct tem `sync.Mutex` ou similar | Pointer receiver (mutex não pode ser copiado) |

Uma facilidade: Go faz a conversão automaticamente. Se `p` é um `Ponto` (não ponteiro), você pode chamar `p.Mover(1, 2)` e o compilador entende como `(&p).Mover(1, 2)`.

> **Regra prática:** se **qualquer** método do tipo precisa ser pointer receiver, faça **todos** pointer receiver. Manter consistência evita surpresas.

## Slices e maps — o caso especial

Slices e maps parecem "passar por referência", mas tecnicamente não é isso. O que acontece:

- Um slice é internamente um **descritor** com 3 campos: ponteiro para o array, comprimento e capacidade
- Quando você passa um slice para uma função, o **descritor é copiado**, mas o ponteiro interno aponta para o **mesmo array**

```go
func mudarPrimeiro(s []int) {
    s[0] = 999  // ✅ modifica o array original — ambos apontam para ele
}

func tentarAppend(s []int) {
    s = append(s, 42)  // ❌ o append pode criar novo array, e o caller não vê
}
```

Por isso: modificar **elementos** de um slice dentro de uma função funciona, mas `append` pode não ser visível. Se precisar fazer `append` dentro de uma função, retorne o novo slice ou passe `*[]int`.
