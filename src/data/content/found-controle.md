---
title: Controle de Fluxo
description: if, switch, type switch, for, for-range, break, continue e labels.
estimatedMinutes: 40
recursos:
  - https://go.dev/tour/flowcontrol/1
  - https://gobyexample.com/for
  - https://gobyexample.com/switch
experimentacao:
  desafio: Implemente FizzBuzz (1–100) usando switch sem expressão. Depois, crie um programa que busca um valor em matriz 2D usando labeled break.
  dicas:
    - "Switch sem expressão: switch { case x%3==0: ... }"
    - O operador módulo é %
    - "Labels: outer: for → break outer"
    - Type switch é útil com interface{}/any
  codeTemplate: |
    package main

    import "fmt"

    func main() {
    	for i := 0; i < 5; i++ {
    		fmt.Println(i)
    	}
    	n := 10
    	for n > 0 {
    		n--
    	}
    	for i, r := range "Olá" {
    		fmt.Printf("%d: %c\n", i, r)
    	}
    	if v := calcular(); v > 40 {
    		fmt.Println("Maior que 40")
    	}
    	dia := "segunda"
    	switch dia {
    	case "segunda", "terça", "quarta", "quinta", "sexta":
    		fmt.Println("Dia útil")
    	default:
    		fmt.Println("Fim de semana")
    	}
    	var val interface{} = 42
    	switch v := val.(type) {
    	case int:
    		fmt.Println("int:", v)
    	case string:
    		fmt.Println("string:", v)
    	}
    }
    func calcular() int { return 42 }
  notaPos: |
    #### O que aconteceu nesse código?

    **`for i := 0; i < 5; i++`** — form clássico com init, condição e post. `for n > 0` é equivalente ao `while` de outras linguagens. `for {}` é loop infinito.

    **`for i, r := range "Olá"`** — `range` sobre string decodifica **runes** (code points Unicode), não bytes. O índice `i` avança pelos **bytes** do rune — para "Olá", `á` ocupa 2 bytes, então o índice pula de 2 para 4.

    **`if v := calcular(); v > 40`** — declaração de inicialização no `if`. A variável `v` existe apenas dentro do `if` e seus blocos `else`. Idioma Go muito comum para erros: `if err := fazer(); err != nil {...}`.

    **`switch dia`** — cada `case` **não precisa de `break`** (diferente de C/Java). Fall-through é opt-in com a keyword `fallthrough`. Cases agrupam múltiplos valores com vírgula.

    **Type switch** — `switch v := val.(type)` despacha pelo tipo concreto de uma interface. Em cada case, `v` assume o tipo concreto correspondente.

    **Go 1.22+**: variáveis de loop (`for i := range s`) agora criam nova instância por iteração — o bug clássico de closures capturando `i` foi corrigido em módulos com `go 1.22+`.
socializacao:
  discussao: Por que Go tem apenas o for como laço? Isso é uma limitação ou vantagem?
  pontos:
    - "Simplicidade: um construto, muitas formas"
    - for range unifica iteração sobre todas as coleções
    - "Type switch: essencial para interfaces polimórficas"
  diasDesafio: Dias 8–18
  sugestaoBlog: "Controle de fluxo em Go: o único for, switch sem break e type switch"
  hashtagsExtras: '#golang #controlflow'
aplicacao:
  projeto: Jogo de adivinhação onde o programa escolhe número aleatório e o jogador tenta adivinhar, com dicas maior/menor e contagem de tentativas.
  requisitos:
    - math/rand para gerar número aleatório
    - Loop principal com for
    - Dar dicas maior ou menor
    - Contar tentativas e apresentar resultado
  criterios:
    - Jogo funcional
    - Tratamento de entrada inválida
    - Boa experiência do usuário
  starterCode: |
    package main

    import (
    	"bufio"
    	"fmt"
    	"math/rand"
    	"os"
    	"strconv"
    	"strings"
    )

    func main() {
    	alvo := rand.Intn(100) + 1
    	tentativas := 0
    	scanner := bufio.NewScanner(os.Stdin)

    	fmt.Println("Adivinhe o número entre 1 e 100!")
    	for {
    		tentativas++
    		fmt.Print("Seu chute: ")
    		scanner.Scan()
    		chute, err := strconv.Atoi(strings.TrimSpace(scanner.Text()))
    		if err != nil {
    			fmt.Println("Digite um número válido.")
    			tentativas--
    			continue
    		}
    		switch {
    		case chute == alvo:
    			fmt.Printf("Correto em %d tentativas!\n", tentativas)
    			return
    		case chute < alvo:
    			fmt.Println("Maior!")
    		default:
    			fmt.Println("Menor!")
    		}
    	}
    }

---

## Go tem um único loop: `for`

Enquanto outras linguagens têm `for`, `while`, `do-while` e `foreach`, Go simplificou: **só existe `for`**. Mas ele assume várias formas:

### Forma clássica (como o `for` de C/Java)

```go
for i := 0; i < 5; i++ {
    fmt.Println(i)  // 0, 1, 2, 3, 4
}
```

### Forma "while" (só a condição)

```go
n := 10
for n > 0 {
    fmt.Println(n)
    n--
}
```

### Loop infinito

```go
for {
    // roda para sempre até break, return ou panic
    break  // sai do loop
}
```

### Repetir N vezes (Go 1.22+)

```go
for range 5 {
    fmt.Println("Oi!")  // imprime 5 vezes
}

for i := range 5 {
    fmt.Println(i)  // 0, 1, 2, 3, 4
}
```

## `for range` — percorrer coleções

`range` é a forma de percorrer slices, maps, strings e channels. Ele devolve **dois valores**: o índice e o elemento:

```go
frutas := []string{"maçã", "banana", "uva"}
for i, fruta := range frutas {
    fmt.Printf("%d: %s\n", i, fruta)
}
// 0: maçã
// 1: banana
// 2: uva
```

Se você não precisa do índice, use `_`:

```go
for _, fruta := range frutas {
    fmt.Println(fruta)
}
```

### Cuidados com `range`

| Tipo | O que `range` retorna | Detalhe importante |
|---|---|---|
| Slice/Array | `índice, valor` | Cópia do elemento |
| Map | `chave, valor` | Ordem **aleatória** — muda a cada execução! |
| String | `índice (byte), rune` | Decodifica UTF-8; o índice pula bytes, não letras |
| Channel | `valor` | Bloqueia até receber; para quando fecha |

## `if` — com um truque útil

O `if` de Go tem uma feature que outras linguagens não têm: você pode **declarar uma variável** que só existe dentro do `if`:

```go
if v := calcular(); v > 40 {
    fmt.Println("Grande:", v)  // v existe aqui
} else {
    fmt.Println("Pequeno:", v) // e aqui também
}
// v NÃO existe aqui fora
```

Isso é muito usado para verificar erros:

```go
if err := fazerAlgo(); err != nil {
    fmt.Println("Deu ruim:", err)
    return
}
// se chegou aqui, deu tudo certo
```

## `switch` — sem `break` necessário

Em C/Java, se você esquecer o `break` no `switch`, o código "cai" para o próximo case. Em Go, **cada case para automaticamente**:

```go
dia := "segunda"
switch dia {
case "segunda", "terça", "quarta", "quinta", "sexta":
    fmt.Println("Dia útil")    // para aqui, não cai no default
case "sábado", "domingo":
    fmt.Println("Fim de semana")
default:
    fmt.Println("Dia inválido")
}
```

Note que um `case` pode ter **múltiplos valores** separados por vírgula.

### Switch sem expressão — substitui if/else if

Se você omitir a expressão do `switch`, ele funciona como uma cadeia de `if/else if`:

```go
nota := 85
switch {
case nota >= 90:
    fmt.Println("A")
case nota >= 80:
    fmt.Println("B")  // entra aqui (85 >= 80)
case nota >= 70:
    fmt.Println("C")
default:
    fmt.Println("F")
}
```

### Type switch — descobrir o tipo de uma interface

Quando você tem um valor `any` (interface vazia), pode usar type switch para saber o que tem dentro:

```go
func descrever(val any) {
    switch v := val.(type) {
    case int:
        fmt.Println("É inteiro:", v)
    case string:
        fmt.Println("É texto:", v)
    case bool:
        fmt.Println("É booleano:", v)
    default:
        fmt.Printf("Tipo desconhecido: %T\n", v)
    }
}
```

## Labels — sair de loops aninhados

Quando você tem um loop dentro de outro, `break` só sai do loop **interno**. Para sair dos dois de uma vez, use um **label**:

```go
// Sem label: break só sai do for interno
// Com label: break sai dos DOIS loops de uma vez

procura:
    for i := 0; i < 3; i++ {
        for j := 0; j < 3; j++ {
            if i == 1 && j == 1 {
                break procura  // sai dos dois loops!
            }
            fmt.Printf("(%d,%d) ", i, j)
        }
    }
// saída: (0,0) (0,1) (0,2) (1,0)
```

> **Sobre `goto`:** Go tem `goto`, mas é quase nunca usado. Se você está pensando em usar `goto`, provavelmente existe uma forma melhor. Labels com `break`/`continue` resolvem 99% dos casos.
