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

Aqui começa a parte prática do curso. E a boa notícia: **você não precisa instalar nada**. O AprendaGo tem um playground embutido — basta clicar na aba **Experimentação** e seu código é compilado e executado na hora, direto no browser.

> **Nota:** A aba **Aplicação** é um ambiente mais completo, com suporte a múltiplos arquivos e testes. Ele roda um container Linux com Go instalado — como uma máquina virtual na nuvem para você programar.

## O que é uma variável?

Uma variável é uma **caixinha com nome** onde você guarda um valor. Você escolhe o nome, coloca um valor dentro, e depois pode usar esse nome para acessar o valor.

```go
nome := "Ana"
fmt.Println(nome)  // Ana
```

Pronto. Criamos uma caixinha chamada `nome`, colocamos `"Ana"` dentro, e depois imprimimos o conteúdo.

## Duas formas de criar variáveis

Go tem duas maneiras de declarar variáveis. Veja a diferença:

### Forma curta: `:=` (a mais usada)

```go
nome := "Go"
idade := 15
preco := 29.90
ativo := true
```

O compilador **olha o valor da direita** e adivinha o tipo sozinho. `"Go"` é texto? Então `nome` é `string`. `15` é número inteiro? Então `idade` é `int`. Isso se chama **inferência de tipo**.

> **Restrição:** `:=` só funciona **dentro de funções**. Fora delas, use `var`.

### Forma longa: `var`

```go
var nome string = "Go"
var idade int = 15
var preco float64 = 29.90
var ativo bool = true
```

Aqui você escreve o tipo explicitamente. É mais verboso, mas útil quando você quer:
- Declarar uma variável **sem dar valor ainda** (ela nasce com o valor zero)
- Declarar variáveis **fora de funções** (escopo de pacote)

```go
var contador int     // nasce com valor 0 (valor zero de int)
var mensagem string  // nasce com "" (valor zero de string)
```

## Os 4 tipos básicos que você vai usar o tempo todo

| Tipo | Para que serve | Exemplo | Valor zero |
|---|---|---|---|
| `string` | Texto | `"Olá, Go!"` | `""` (texto vazio) |
| `int` | Números inteiros | `42`, `-7` | `0` |
| `float64` | Números com casas decimais | `3.14`, `99.90` | `0` |
| `bool` | Verdadeiro ou falso | `true`, `false` | `false` |

Existem outros tipos (veremos na lição de Tipos), mas com esses quatro você resolve a maioria dos problemas iniciais.

## Valor zero — nada fica "indefinido"

Em muitas linguagens, uma variável declarada sem valor pode conter **lixo de memória** ou causar erro. Em Go, **toda variável nasce com um valor padrão** chamado *valor zero*:

```go
var x int       // 0
var s string    // ""
var b bool      // false
var f float64   // 0
```

Você nunca vai encontrar uma variável "indefinida" em Go. Isso torna o código mais previsível.

## Como saber o tipo de uma variável?

Use `%T` no `fmt.Printf`:

```go
nome := "Go"
idade := 15
fmt.Printf("nome é %T, idade é %T\n", nome, idade)
// nome é string, idade é int
```

Isso é muito útil quando você não tem certeza de qual tipo o Go inferiu.

## O tipo é fixo — para sempre

Depois que uma variável é criada, o tipo dela **nunca muda**:

```go
x := 42       // x é int
x = 100       // ✅ OK — 100 também é int
x = "texto"   // ❌ Erro! Não pode colocar string numa variável int
```

Se você vem de JavaScript ou Python, onde uma variável pode ser número agora e texto depois, isso é diferente. Em Go, o tipo é decidido na criação e **não muda mais**.

## A regra que pega todo mundo de surpresa

Go **não compila** se você declarar uma variável e **não usar**:

```go
x := 42
// ❌ Erro: x declared but not used
```

Parece chato no começo, mas é uma das melhores features de Go: impede que variáveis esquecidas se acumulem no código. Se declarou, tem que usar — ou apague. 

