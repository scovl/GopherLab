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

Interfaces em Go definem **conjuntos de métodos**. se implementar todos os métodos — sem declaração explícita de `implements`. Isso é duck typing com verificação em compiletime.

## A armadilha do nil-interface

Uma interface tem valor não-nil somente se o **tipo concreto** e o **valor concreto** forem ambos não-nil.

```go
var p *Pessoa        // p é nil
var i Stringer = p   // i é NÃO-nil! (tem tipo concreto *Pessoa, mas valor nil)
fmt.Println(i == nil) // false — armadilha!
```

Para comparar com nil corretamente, compare o tipo concreto diretamente, ou use `reflect.ValueOf(i).IsNil()`.

## Type assertion

```go
val.(Type)         // panics se o tipo não bater
s, ok := val.(string)  // forma segura: ok=false sem pânico
```

**Type switch:**
```go
switch v := x.(type) {
case int:    // v é int
case string: // v é string
}
```

`any` é alias de `interface{}` (Go 1.18+) e aceita qualquer valor.

## Composição de interfaces

Interfaces são compostas por embedding:

```go
type ReadWriter interface {
    io.Reader
    io.Writer
}
```

Siga o princípio de **interfaces pequenas e focadas** (ISP do SOLID): `io.Reader` tem apenas `Read()`, `io.Writer` tem apenas `Write()`. Use interfaces para desacoplar no **ponto de uso**, não no ponto de definição.
