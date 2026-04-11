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

Go tem apenas **um construto de laço**: `for`.

```go
for {}                          // loop infinito
for condition {}                // equivalente ao while
for init; cond; post {}         // forma clássica
for i, v := range slice {}      // range
```

## for-range

`range` itera sobre arrays, slices, maps, strings e channels:

- **Strings**: decodifica `rune`s (não bytes), retorna `(byteIndex, rune)` — avança o índice pelo tamanho em bytes do rune
- **Maps**: a ordem de iteração é **indefinida** e muda entre execuções
- **Channels**: bloqueia até receber um valor; termina quando o channel é fechado
- **Inteiros (Go 1.22+)**: `for range N {}` itera N vezes sem variável necessária; `for i := range N {}` fornece `i` de 0 a N-1. Equivalente ao `for i := 0; i < N; i++` porém mais conciso.

> **Go 1.22 — variável por iteração**: antes do Go 1.22, a variável de loop era compartilhada entre todas as iterações. Closures lançadas dentro do loop capturavam a mesma variável e podiam imprimir o mesmo valor. Em módulos com `go 1.22+`, cada iteração cria uma nova variável — o comportamento agora é intuitivo.

## if com declaração de inicialização

```go
if v := calcular(); v > 0 {
    // v existe apenas dentro deste bloco
}
```

A variável `v` existe apenas dentro do `if` e seus blocos `else`.

## switch

- Cada `case` **não necessita de `break`** — fall-through é opt-in com a keyword `fallthrough`
- Cases podem agrupar múltiplos valores: `case "sol", "lua":`
- `switch` sem expressão equivale a `switch true {}` — ideal para encadear condições
- **Type switch**: `switch v := x.(type) {}` — despacho por tipo concreto de uma interface

## Labels e goto

Labels permitem `break` e `continue` saírem de loops aninhados:

```go
outer:
for {
    for {
        break outer
    }
}
```

`goto` existe mas é desaconselhado. Não há `do-while` em Go — use `for { ...; if !cond { break } }`.
