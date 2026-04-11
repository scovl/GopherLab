---
title: Variáveis, Valores e Tipos
description: Declare variáveis, entenda os tipos básicos de Go e veja como o compilador infere tipos automaticamente.
estimatedMinutes: 25
recursos:
  - https://go.dev/tour/basics/8
  - https://go.dev/doc/effective_go#variables
  - https://go.dev/ref/spec#Types
  - https://youtu.be/Qf2645sTqH0?si=REgYs1_hwjTTuPuO
experimentacao:
  desafio: "Execute o programa abaixo — ele declara variáveis de tipos diferentes e imprime seus valores. Depois adicione uma variável `bool` chamada `aprendendo` com o valor `true` e imprima ela usando `fmt.Println`."
  dicas:
    - "`var nome string = \"valor\"` e `nome := \"valor\"` fazem a mesma coisa — o segundo é mais comum dentro de funções."
    - "O valor zero de `int` é `0`, de `string` é `\"\"` (vazio), de `bool` é `false`."
    - "Use `fmt.Printf(\"%T\\n\", variavel)` para ver o tipo de qualquer variável."
  codeTemplate: |
    package main

    import "fmt"

    func main() {
    	var linguagem string = "Go"
    	ano := 2009
    	versao := 1.23
    	compilado := true

    	fmt.Println("Linguagem:", linguagem)
    	fmt.Println("Ano de criação:", ano)
    	fmt.Printf("Versão atual: %.2f\n", versao)
    	fmt.Println("É compilado?", compilado)
    	fmt.Printf("Tipos: %T, %T, %T, %T\n", linguagem, ano, versao, compilado)
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`var linguagem string = "Go"`** — declaração explícita: palavra-chave `var`, nome, tipo e valor. Útil quando você quer deixar o tipo visível ou declarar uma variável sem atribuir valor ainda.

    **`ano := 2009`** — declaração curta: Go infere que `ano` é `int` pelo valor `2009`. É a forma mais comum dentro de funções.

    **`%.2f`** — verbo de formatação para decimais com 2 casas. O tipo `float64` é o padrão para números decimais em Go.

    **`%T`** — verbo especial que imprime o **tipo** da variável em vez do valor. Experimente usá-lo para descobrir o tipo de qualquer coisa.

    **Tipos básicos:** `string` (texto), `int` (inteiro), `float64` (decimal), `bool` (verdadeiro/falso). Cada tipo tem um **valor zero** — o padrão quando nenhum valor é atribuído: `""` para string, `0` para tipos numéricos, `false` para bool.
socializacao:
  discussao: Você já programou em alguma linguagem com tipagem dinâmica (JavaScript, Python, Ruby)? O que muda na sua cabeça ao ver tipos explícitos em Go?
  pontos:
    - Em linguagens dinâmicas, o tipo muda em tempo de execução — em Go, ele é fixo na compilação. Isso te parece limitação ou segurança?
    - O operador `:=` infere o tipo automaticamente — isso parece "dinâmico" mas não é. Qual a diferença?
    - O compilador Go rejeita variáveis declaradas e não usadas. Você acha isso útil ou chato?
  diasDesafio: Dias 1–7
  sugestaoBlog: "Meu primeiro contato com tipos em Go: o que eu aprendi sobre var, := e valor zero"
  hashtagsExtras: '#golang #beginner #tipos'
aplicacao:
  projeto: Crie um programa Go que imprima uma ficha de apresentação usando variáveis de pelo menos 3 tipos diferentes (`string`, `int`, `bool`).
  requisitos:
    - Declarar pelo menos uma variável com `var` explícito e pelo menos duas com `:=`
    - Usar ao menos 3 tipos diferentes (`string`, `int`, `bool`)
    - Imprimir todas as variáveis com `fmt.Println` ou `fmt.Printf`
    - O programa deve compilar e rodar sem erros
  criterios:
    - Código compila e produz saída legível
    - Pelo menos 3 tipos diferentes usados
    - Mistura de `var` e `:=` presente
  starterCode: |
    package main

    import "fmt"

    func main() {
    	var nome string = "Seu Nome"
    	idade := 0 // troque pelo seu valor
    	linguagem := "Go"
    	aprendendo := true

    	fmt.Println("Nome:", nome)
    	fmt.Println("Idade:", idade)
    	fmt.Println("Linguagem:", linguagem)
    	fmt.Println("Aprendendo:", aprendendo)
    }
---

Aqui começa a parte prática do curso. E a boa notícia: você não precisa instalar nada. O AprendaGo já tem um [playground embutido](https://play.golang.org/) — basta clicar na aba Experimentação e também na Aplicação que seu código é compilado e executado na hora, direto no browser.

> **Nota**: Diferentemente da abra Experimentação que usa de fato o playground embutido, a aba Aplicação é um ambiente de desenvolvimento mais completo, com suporte a múltiplos arquivos, testes unitários e até mesmo módulos. Ele roda um container Linux com Go instalado, então é como se você tivesse uma máquina virtual na nuvem para programar.

## Variáveis em Go

Uma variável é um nome que aponta para um valor na memória. Em Go, existem duas formas de declarar:

```go
var nome string = "Go"   // declaração explícita — tipo visível
nome := "Go"             // declaração curta — tipo inferido pelo compilador
```

Dentro de funções, `:=` é o padrão. Fora de funções (escopo de pacote), só `var` funciona.

## Tipos básicos

| Tipo | Exemplo | Valor zero |
|------|---------|------------|
| `string` | `"Hello"` | `""` |
| `int` | `42` | `0` |
| `float64` | `3.14` | `0` |
| `bool` | `true` | `false` |

O **valor zero** é o valor padrão de uma variável declarada mas não atribuída. Em Go, não existe variável "não inicializada" — toda variável tem um valor zero garantido.

## Inferência de tipos

Go infere o tipo pelo valor atribuído: `x := 42` cria um `int`, `x := 3.14` cria um `float64`, `x := "texto"` cria uma `string`. O tipo é fixo após a declaração — você não pode atribuir um `string` para uma variável `int`.

## Uma regra importante

Go não compila se você declarar uma variável e não usá-la. Isso parece rígido, mas evita variáveis esquecidas que confundem quem lê o código depois. 

