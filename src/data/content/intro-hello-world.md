---
title: Anatomia do Hello, World!
description: Entenda cada linha do primeiro programa Go — package, import, func main e fmt.Println.
estimatedMinutes: 20
recursos:
  - https://pkg.go.dev/fmt#Println
  - https://go.dev/ref/spec#Package_clause
  - https://go.dev/doc/effective_go#blank
  - https://youtu.be/tdZ2I2RZ7JI?si=N0bgmF0lUVC8AOe6
experimentacao:
  desafio: "Execute o programa abaixo e observe a saída. Depois modifique o `fmt.Println` para imprimir seu nome e uma coisa que você quer construir com Go."
  dicas:
    - "`fmt.Println` aceita qualquer número de argumentos separados por vírgula — ele insere um espaço entre eles automaticamente."
    - "Tente passar texto, número e `true` ao mesmo tempo: `fmt.Println(\"Go\", 2009, true)`."
    - "Consulte [pkg.go.dev/fmt](https://pkg.go.dev/fmt) para ver todas as funções do pacote `fmt`."
  codeTemplate: |
    package main

    import "fmt"

    func main() {
    	fmt.Println("Hello, World!")
    	fmt.Println("Olá,", "Go!")
    	fmt.Println("Versão:", 1.23, "— compilado:", true)
    }
  notaPos: |
    #### Anatomia desse código

    **`package main`** — todo arquivo Go começa declarando seu pacote. O pacote `main` é especial: diz ao compilador que este é um **executável**, não uma biblioteca.

    **`import "fmt"`** — importa o pacote `fmt` da biblioteca padrão. Em Go, imports não usados causam **erro de compilação** — a linguagem não permite código morto.

    **`func main()`** — é a **porta de entrada** do programa. O Go começa a execução aqui e termina quando a última linha de `main` é executada.

    **`fmt.Println`** — notação `pacote.Identificador`: você acessa qualquer função, variável ou tipo de outro pacote com essa sintaxe. Ela nunca muda — é sempre `pacote.Identificador`.

    **Múltiplos argumentos** — `Println` é uma função *variádica* (`...any`): aceita qualquer quantidade de argumentos de qualquer tipo. Por isso `fmt.Println("texto", 42, true)` funciona sem conversão.
socializacao:
  discussao: O que mais te surpreendeu na estrutura do Hello, World! em Go comparado com linguagens que você já conhecia?
  pontos:
    - Em Python não há `package` nem `func main` — como isso muda a organização do código?
    - O fato de Go não compilar com imports não usados parece rígido ou faz sentido para você?
    - A notação `pacote.Identificador` é diferente de `objeto.metodo` em OOP — qual a diferença na sua cabeça?
  diasDesafio: Dias 1–7
  sugestaoBlog: "Anatomia do Hello, World! em Go: o que cada linha realmente significa"
  hashtagsExtras: '#golang #beginner #helloworld'
aplicacao:
  projeto: Escreva um programa Go que use `fmt.Println` para imprimir pelo menos 4 informações sobre você, misturando texto, número e booleano na mesma chamada.
  requisitos:
    - Ter `package main` e `import "fmt"` corretos
    - Pelo menos 4 chamadas de `fmt.Println`
    - Pelo menos uma chamada com múltiplos argumentos de tipos diferentes
    - O programa deve compilar e rodar sem erros
  criterios:
    - Código compila e produz saída legível
    - Usa múltiplos argumentos em pelo menos uma chamada
    - Estrutura correta do programa Go
  starterCode: |
    package main

    import "fmt"

    func main() {
    	fmt.Println("Nome:", "Seu Nome")
    	fmt.Println("Idade:", 0)
    	fmt.Println("Linguagem favorita:", "Go")
    	fmt.Println("Aprendendo Go?", true)
    }
---

O **Hello, World!** é uma tradição em todas as linguagens de programação: o primeiro programa que todo iniciante escreve. Ele imprime a frase "Hello, World!" na tela — simples assim. Mas o valor real não é a frase: é o que ele revela sobre a estrutura básica da linguagem.

## A estrutura do programa

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

Toda linha aqui tem um propósito claro.

## `package main`

Todo arquivo Go pertence a um **pacote**. O pacote `main` é o ponto de partida: indica ao compilador que este arquivo produz um **executável**. Outros pacotes (como `fmt`) são bibliotecas não têm `func main`, não rodam sozinhos.

## `import "fmt"`

Importa o pacote `fmt` da biblioteca padrão. Go não permite imports não usados — se você importar e não usar, **não compila**. Isso é intencional: a linguagem foi projetada para não ter código morto.

## `func main()`

A função `main` é a porta de entrada de qualquer programa Go. A execução começa aqui e termina quando `main` retorna. Você pode ter centenas de funções no seu programa, mas o Go sempre começa por `main`.

## `fmt.Println`

A notação `pacote.Identificador` é a forma padrão de acessar qualquer coisa de outro pacote. `fmt.Println` significa: "função `Println` do pacote `fmt`". Essa notação é usada para funções, variáveis, tipos e constantes — e nunca muda.

`Println` é uma função *variádica*: aceita qualquer número de argumentos de qualquer tipo, inserindo um espaço entre eles e uma quebra de linha no final.

## O identificador em branco `_`

Go exige que toda variável declarada seja usada. Quando uma função retorna múltiplos valores e você quer descartar um deles, usa o `_` (underline):

```go
n, _ := fmt.Println("Hello")  // descarta o erro, mantém n (bytes escritos)
```

O `_` significa: "recebo esse valor, mas não vou usá-lo". É o jeito idiomático de dizer ao compilador que o descarte é intencional.

