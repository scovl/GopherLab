---
title: Sistema de Tipos
description: Tipos numéricos (int8–64, float32/64), constantes, iota, conversão explícita e strconv.
estimatedMinutes: 45
recursos:
  - https://go.dev/tour/basics/8
  - https://gobyexample.com/variables
  - https://gobyexample.com/constants
experimentacao:
  desafio: "Crie uma enumeração com iota para estados de um pedido (Pendente, Pago, Enviado, Entregue). Experimente int8, int32 e int64 para ver diferença de range. Teste as três formas de converter int para string: string(), strconv.Itoa() e fmt.Sprintf()."
  dicas:
    - Use %T em fmt.Printf para ver o tipo de uma variável
    - "Conversão string ↔ int: strconv.Itoa(), strconv.Atoi()"
    - string(65) retorna "A" (converte rune), não "65"
    - Escopo variável declarada em if {} não existe fora dele
  codeTemplate: |
    package main

    import (
    	"fmt"
    	"strconv"
    )

    type Permission uint

    const (
    	Readable   Permission = 1 << iota
    	Writable
    	Executable
    )

    func main() {
    	var nome string = "Go"
    	idade := 15
    	var x int
    	var s string
    	var b bool
    	var p *int
    	f := float64(idade)
    	n := int(f)
    	fmt.Println(string(65))
    	fmt.Println(strconv.Itoa(65))
    	perms := Readable | Writable
    	fmt.Println(perms&Executable != 0)
    	fmt.Println(nome, idade, x, s, b, p, f, n)
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`iota`** — gerador de constantes em blocos `const`. Começa em `0` na primeira linha e incrementa 1 por linha. A expressão `1 << iota` é copiada para as linhas seguintes: `Readable = 1`, `Writable = 2`, `Executable = 4`.

    **`string(65)`** — converte o inteiro 65 para o **caractere Unicode** de code point 65: `"A"`. Para converter o número para a string `"65"`, use `strconv.Itoa(65)` ou `fmt.Sprintf("%d", 65)`.

    **Valor zero de ponteiro** — `var p *int` tem valor zero `nil`. Ponteiros não inicializados são `nil`; desreferenciar `nil` causa panic. Os zero values dos tipos básicos (int→0, string→"", bool→false) já foram vistos em `intro-variaveis`.

    **Conversão explícita** — `float64(idade)` e `int(f)` são obrigatórias. Go não converte implicitamente entre tipos. `int(f)` **trunca** (não arredonda) a parte fracionária.

    **Bitwise** — `perms&Executable != 0` verifica se o bit da permissão está ativo. `Readable | Writable` une permissões com OR.
socializacao:
  discussao: Quais são as vantagens e desvantagens da tipagem forte do Go comparada com linguagens dinâmicas?
  pontos:
    - Segurança em tempo de compilação vs flexibilidade
    - var vs := — quando usar cada um?
    - Por que Go não tem conversão implícita como C?
  diasDesafio: Dias 8–18
  sugestaoBlog: "Sistema de tipos em Go: tipagem forte, zero values, iota e conversões"
  hashtagsExtras: '#golang #types #gobasics'
aplicacao:
  projeto: Crie uma calculadora de conversão de temperaturas (Celsius ↔ Fahrenheit ↔ Kelvin) com enum de unidade via iota.
  requisitos:
    - Enum de unidades com iota
    - Variáveis tipadas corretamente
    - Conversão com funções e fmt.Scan para entrada
  criterios:
    - Tipos corretos
    - Conversões precisas
    - Código limpo
  starterCode: |
    package main

    import (
    	"fmt"
    	"strconv"
    )

    type Status int

    const (
    	Pendente Status = iota
    	Pago
    	Enviado
    	Entregue
    )

    func nomeStatus(s Status) string {
    	switch s {
    	case Pendente:
    		return "Pendente"
    	case Pago:
    		return "Pago"
    	case Enviado:
    		return "Enviado"
    	case Entregue:
    		return "Entregue"
    	default:
    		return "Desconhecido"
    	}
    }

    func main() {
    	temperatura := 100.0
    	inteiro := int(temperatura)
    	texto := strconv.FormatFloat(temperatura, 'f', 1, 64)
    	fmt.Println("Temperatura:", temperatura)
    	fmt.Println("Como int:", inteiro)
    	fmt.Println("Como string:", texto)
    	fmt.Println("string(65):", string(65))
    	fmt.Println("strconv.Itoa(65):", strconv.Itoa(65))
    	pedido := Enviado
    	fmt.Println("Status:", nomeStatus(pedido))
    }

---

Em Go, **todo valor tem um tipo definido antes do programa rodar**. Isso se chama **tipagem estática** — o compilador verifica se você está usando os tipos certos e avisa na hora se algo não bate. Você nunca vai descobrir um erro de tipo só quando o programa estiver rodando em produção.

## Os tipos básicos do Go

Go tem **17 tipos embutidos** organizados em 5 famílias:

| Família | Tipos | Exemplo |
|---|---|---|
| Booleano | `bool` | `true`, `false` |
| Inteiros | `int`, `int8`, `int16`, `int32`, `int64`, `uint`, `uint8`, `uint16`, `uint32`, `uint64`, `uintptr` | `42`, `-7` |
| Ponto flutuante | `float32`, `float64` | `3.14` |
| Complexos | `complex64`, `complex128` | `1+2i` |
| Texto | `string` | `"Olá"` |

Dois atalhos úteis: `byte` é o mesmo que `uint8` (um byte de dado) e `rune` é o mesmo que `int32` (um caractere Unicode).

> **Dica prática:** na dúvida, use `int` para inteiros e `float64` para decimais — são os mais comuns no dia-a-dia.

## Variáveis: `var` e `:=`

Existem **duas formas** de criar variáveis:

```go
var nome string = "Go"   // forma longa — funciona em qualquer lugar
idade := 15              // forma curta — só funciona dentro de funções
```

A forma curta `:=` é a mais usada no dia-a-dia. O compilador **adivinha o tipo** pelo valor da direita (isso se chama *inferência de tipo*).

**Regra importante:** se você declarar uma variável e **não usar**, o compilador **não compila**. Isso evita sujeira no código.

## Constantes e `const`

Constantes são valores que **nunca mudam**:

```go
const pi = 3.14159
const versao = "1.0"
```

Diferente de variáveis, constantes são resolvidas **em tempo de compilação** — o compilador substitui o valor diretamente no código final.

## `iota` — o contador automático

Quando você precisa de uma sequência de constantes (como um enum), `iota` gera os números para você. Ele começa em `0` e **soma 1 a cada linha** dentro do bloco `const`:

```go
const (
    Pendente  = iota  // 0
    Pago              // 1
    Enviado           // 2
    Entregue          // 3
)
```

Se quiser valores mais elaborados, a expressão é **copiada automaticamente** para as linhas seguintes:

```go
const (
    Readable   = 1 << iota  // 1  (bit 0)
    Writable                // 2  (bit 1)
    Executable              // 4  (bit 2)
)
```

## Zero values — nada fica "indefinido"

Em Go, toda variável **nasce com um valor padrão**, chamado *zero value*. Você nunca vai encontrar lixo de memória:

| Tipo | Zero value |
|---|---|
| `int`, `float64` | `0` |
| `string` | `""` (string vazia) |
| `bool` | `false` |
| Ponteiros, slices, maps | `nil` |

## Conversões — sempre explícitas

Go **não converte tipos sozinho**. Se você tem um `int` e precisa de um `float64`, tem que pedir:

```go
idade := 25
f := float64(idade)  // int → float64 ✅
n := int(3.7)        // float64 → int = 3 (trunca, não arredonda!)
```

> **Armadilha clássica:** `string(65)` **não** retorna `"65"`. Retorna `"A"` — porque 65 é o código Unicode da letra A! Para converter número em texto, use `strconv.Itoa(65)` → `"65"`.

## Cuidado com o sombreamento de variáveis

Quando você usa `:=` dentro de um `if` ou `for`, pode **criar uma variável nova** que esconde a de fora sem querer:

```go
x := 10
if true {
    x := 20  // ⚠️ nova variável x, a de fora continua valendo 10!
    fmt.Println(x) // 20
}
fmt.Println(x) // 10 — surpresa?
```

Isso se chama *shadowing*. Quando quiser **modificar** a variável de fora, use `=` em vez de `:=`.
