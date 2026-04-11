---
title: Interfaces e Polimorfismo
description: Interfaces implícitas, empty interface, type assertions, embedding de interfaces e polimorfismo.
estimatedMinutes: 45
recursos:
  - https://go.dev/tour/methods/9
  - https://gobyexample.com/interfaces
  - https://jordanorelli.com/post/32665860244/how-to-use-interfaces-in-go
experimentacao:
  desafio: Crie uma interface Stringer com String() string e implemente para 3 tipos diferentes. Depois, crie uma interface Writer e use type assertion para verificar se um valor também implementa Stringer.
  dicas:
    - Interfaces são satisfeitas implicitamente — sem "implements"
    - "Comma-ok para type assertion segura: val, ok := x.(MinhaInterface)"
    - "Interface embedding: type ReadWriter interface { Reader; Writer }"
  codeTemplate: |
    package main

    import (
    	"fmt"
    	"math"
    )

    type Area interface {
    	Area() float64
    }

    type Perimetro interface {
    	Perimetro() float64
    }

    type Forma interface {
    	Area
    	Perimetro
    }

    type Circulo struct{ Raio float64 }

    func (c Circulo) Area() float64      { return math.Pi * c.Raio * c.Raio }
    func (c Circulo) Perimetro() float64 { return 2 * math.Pi * c.Raio }

    type Retangulo struct{ L, A float64 }

    func (r Retangulo) Area() float64      { return r.L * r.A }
    func (r Retangulo) Perimetro() float64 { return 2 * (r.L + r.A) }

    func descrever(f Forma) {
    	fmt.Printf("Área: %.2f, Perímetro: %.2f\n", f.Area(), f.Perimetro())
    }

    func main() {
    	formas := []Forma{Circulo{Raio: 5}, Retangulo{L: 3, A: 4}}
    	for _, f := range formas {
    		descrever(f)
    	}
    	var val any = "hello"
    	if s, ok := val.(string); ok {
    		fmt.Println("String:", s)
    	}
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **Interface embedding** — `Forma` incorpora `Area` e `Perimetro`. Qualquer tipo que satisfaz ambas satisfaz `Forma` automaticamente. Interfaces são satisfeitas **implicitamente** — sem `implements` ou declaração explícita.

    **`descrever(f Forma)`** — polimorfismo: `Circulo` e `Retangulo` passam como `Forma`. O compilador verifica a satisfação em **compile time**.

    **`[]Forma{Circulo{...}, Retangulo{...}}`** — slice de interface armazenando tipos concretos diferentes. O dispatch de métodos ocorre em runtime via tabela de métodos (vtable).

    **Type assertion** — `val.(string)` extrai o valor concreto. **Use sempre a forma segura**: `s, ok := val.(string)` — sem `ok`, causa panic se o tipo não bater.

    **`any`** — alias de `interface{}` desde Go 1.18. Aceita qualquer valor. Use apenas quando necessário, pois perde type safety em compile time.

    **A armadilha nil-interface** — um `*Pessoa` nil atribuído a `Stringer` resulta numa interface **não-nil** (tem tipo concreto `*Pessoa`, valor nil). Isso causa bugs sutis: `i == nil` retorna `false` mesmo com valor nil. Sempre compare com o tipo concreto.
socializacao:
  discussao: "Interfaces implícitas vs explícitas (como em Java): qual abordagem prefere e por quê?"
  pontos:
    - "Go: duck typing compilado — mais flexível"
    - "Java: implements — mais explícito, autodocumentado"
    - "Princípio ISP do SOLID: interfaces pequenas"
  diasDesafio: Dias 8–18
  sugestaoBlog: "Interfaces em Go: polimorfismo sem herança e o poder do duck typing compilado"
  hashtagsExtras: '#golang #interfaces #polymorphism'
aplicacao:
  projeto: Mini-framework de formas geométricas com área e perímetro - use interfaces para polimorfismo e type assertions para formatação especial.
  requisitos:
    - Interface Forma com Area() e Perimetro()
    - Pelo menos 3 formas implementadas
    - Função que recebe []Forma e calcula soma de áreas
    - Type assertion para tratar formas com atributos extras
  criterios:
    - Interfaces corretas
    - Polimorfismo funcional
    - Testes unitários
  starterCode: |
    package main

    import (
    	"fmt"
    	"math"
    )

    type Forma interface {
    	Area() float64
    	Perimetro() float64
    	String() string
    }

    type Circulo struct{ Raio float64 }

    func (c Circulo) Area() float64      { return math.Pi * c.Raio * c.Raio }
    func (c Circulo) Perimetro() float64 { return 2 * math.Pi * c.Raio }
    func (c Circulo) String() string     { return fmt.Sprintf("Círculo(r=%.1f)", c.Raio) }

    // TODO: implemente Retangulo e Triangulo

    func somaAreas(formas []Forma) float64 {
    	total := 0.0
    	for _, f := range formas {
    		total += f.Area()
    	}
    	return total
    }

    func main() {
    	formas := []Forma{
    		Circulo{Raio: 3},
    		// TODO: adicione Retangulo e Triangulo
    	}
    	for _, f := range formas {
    		fmt.Printf("%s → área=%.2f  perímetro=%.2f\n", f, f.Area(), f.Perimetro())
    	}
    	fmt.Printf("Soma das áreas: %.2f\n", somaAreas(formas))
    }

---

## O que é uma interface?

Uma **interface** é um "contrato" — uma lista de métodos que um tipo precisa ter. Se o tipo tem todos os métodos, ele **automaticamente** satisfaz a interface. Não precisa escrever `implements` como em Java.

```go
type Animal interface {
    Falar() string
}
```

Qualquer tipo que tenha um método `Falar() string` é um `Animal`:

```go
type Cachorro struct{}
func (c Cachorro) Falar() string { return "Au au!" }

type Gato struct{}
func (g Gato) Falar() string { return "Miau!" }
```

Nenhum dos dois "declarou" que implementa `Animal`. Mas ambos têm `Falar() string`, então o compilador aceita os dois como `Animal`:

```go
func cumprimentar(a Animal) {
    fmt.Println(a.Falar())
}

cumprimentar(Cachorro{})  // Au au!
cumprimentar(Gato{})      // Miau!
```

> **Analogia:** pense numa tomada elétrica. Se o plugue encaixa (tem os métodos certos), funciona. Não importa se é um ventilador ou uma TV — a tomada não precisa "saber" o tipo do aparelho.

Esse conceito tem nome: **duck typing** — "se anda como pato e faz quack como pato, é um pato". A diferença é que Go verifica isso em **tempo de compilação**, não em runtime.

## `any` — a interface que aceita tudo

`any` (que é apelido de `interface{}`) é uma interface sem nenhum método. Como todo tipo tem "zero ou mais métodos", **qualquer valor** satisfaz `any`:

```go
var x any
x = 42          // ✅
x = "texto"     // ✅
x = true        // ✅
```

É útil quando você não sabe o tipo de antemão (como em JSON genérico), mas use com moderação — você perde a segurança de tipos.

## Type assertion — "o que tem dentro desta interface?"

Quando você tem um valor `any` (ou qualquer interface), pode **descobrir o tipo concreto** com type assertion:

```go
var val any = "Olá, Go!"

// ❌ Forma perigosa — causa panic se o tipo não bater
s := val.(string)

// ✅ Forma segura — ok é false se o tipo não bater
s, ok := val.(string)
if ok {
    fmt.Println("É string:", s)
}
```

> **Regra prática:** *sempre* use a forma com `ok`. A forma sem `ok` causa panic e derruba o programa.

## Type switch — testar vários tipos de uma vez

Quando o valor pode ser de vários tipos, use um **type switch**:

```go
func descrever(val any) {
    switch v := val.(type) {
    case int:
        fmt.Println("É inteiro:", v)
    case string:
        fmt.Println("É string:", v)
    case bool:
        fmt.Println("É bool:", v)
    default:
        fmt.Println("Tipo desconhecido")
    }
}
```

Dentro de cada `case`, a variável `v` já tem o tipo correto — não precisa de cast.

## A armadilha do nil na interface

Essa é a pegadinha mais confusa de Go. Uma interface guarda **duas coisas** internamente:

1. O **tipo** do valor concreto
2. O **valor** em si

Uma interface só é `nil` quando **ambos** são nil:

```go
var p *Pessoa         // ponteiro nil
var i Stringer = p    // ⚠️ i NÃO é nil!
fmt.Println(i == nil) // false — surpresa!
```

Por quê? Porque `i` sabe que o tipo é `*Pessoa` (campo 1 preenchido), mesmo que o valor seja nil (campo 2 vazio). É como uma caixa rotulada "Pessoa" que está vazia — a caixa existe, não é nil.

**Como evitar:** não atribua ponteiros nil a interfaces. Se precisa retornar "nada", retorne `nil` diretamente:

```go
// ❌ Problemático
var p *Pessoa = nil
return p  // retorna interface não-nil com valor nil

// ✅ Correto
return nil  // retorna interface nil de verdade
```

## Composição de interfaces — interfaces pequenas

Em Go, interfaces grandes são raras. A filosofia é criar interfaces **pequenas e focadas**, depois combiná-las:

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

// Combina as duas por embedding
type ReadWriter interface {
    Reader
    Writer
}
```

A interface `Reader` da biblioteca padrão tem **um único método**. Mesmo assim, dezenas de tipos a implementam: arquivos, conexões de rede, buffers, compressores...

> **Princípio:** a melhor interface é a menor possível. `io.Reader` com 1 método é muito mais útil que uma interface com 20 métodos — porque mais tipos conseguem satisfazê-la.

## Interfaces no ponto de uso

Uma dica importante: em Go, interfaces são definidas por **quem usa**, não por quem implementa. 

Em Java, o autor da classe decide quais interfaces ela implementa. Em Go, **você** decide: se precisa de algo que tenha `Read()`, cria uma interface `Reader` no seu package e aceita qualquer tipo que tenha esse método. O autor do tipo nem precisa saber que sua interface existe.
