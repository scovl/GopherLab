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

O **Hello, World!** é o primeiro programa que todo programador escreve em uma linguagem nova. Ele faz uma coisa só: imprime uma frase na tela. Parece bobo, mas cada linha revela algo importante sobre como Go funciona.

## O programa completo

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

São só 7 linhas e o programa já roda. Vamos entender cada uma.

## Linha 1: `package main`

Todo arquivo Go começa dizendo a qual **pacote** ele pertence. Pense num pacote como uma pasta que agrupa código relacionado.

O pacote `main` é especial — ele diz ao Go: "isso aqui é um **programa executável**". Se o pacote tiver outro nome (como `fmt` ou `math`), ele é uma **biblioteca** que outros programas usam, mas não roda sozinho.

> **Resumo:** `package main` = "sou um programa que pode rodar".

## Linha 3: `import "fmt"`

Essa linha traz o pacote `fmt` (abreviação de "format") para dentro do seu programa. É nele que mora a função `Println` que usamos para imprimir na tela.

Go é rigoroso aqui: se você importar um pacote e **não usar nenhuma função dele**, o compilador **recusa compilar**. Nada de código morto! Isso pode parecer chato no começo, mas mantém o código limpo.

```go
import "fmt"      // ✅ OK — usamos fmt.Println
import "math"     // ❌ Erro — importou mas não usou nada de math
```

## Linha 5: `func main()`

Essa é a **porta de entrada** do programa. Quando você roda o executável, o Go procura a função `main` dentro do pacote `main` e começa a execução por aqui.

- O programa começa na primeira linha de `main`
- Quando a última linha de `main` termina, o programa acaba
- Pode haver centenas de outras funções no código, mas tudo começa aqui

> **Analogia:** `func main()` é como a porta da frente de uma casa. Não importa quantos cômodos existam — você sempre entra pela porta da frente.

## Linha 6: `fmt.Println("Hello, World!")`

Aqui está a ação! Vamos decompor:

| Parte | Significado |
|---|---|
| `fmt` | O pacote que importamos |
| `.` | Separador — "pegue algo de dentro do pacote" |
| `Println` | A função que imprime texto + quebra de linha |
| `("Hello, World!")` | O texto que queremos imprimir |

Essa notação `pacote.Função` é **sempre assim** em Go. Não importa se é `fmt.Println`, `math.Sqrt` ou `strings.ToUpper` — o padrão é o mesmo.

### `Println` aceita qualquer coisa

`Println` é uma função **variádica** — aceita qualquer número de argumentos de qualquer tipo. Ela coloca um espaço entre eles e uma quebra de linha no final:

```go
fmt.Println("Go", 2009, true)
// Saída: Go 2009 true
```

Não precisa converter nada — ela se vira com texto, números e booleanos.

## Bônus: o `_` (underline) — "não quero esse valor"

Go exige que toda variável declarada seja usada. Mas às vezes uma função retorna dois valores e você só quer um deles. Para isso, use `_`:

```go
n, _ := fmt.Println("Hello")  // _ descarta o erro, n guarda quantos bytes foram escritos
```

O `_` diz ao compilador: "sei que tem um valor aqui, mas não preciso dele". É como assinar um recibo sem ler — você reconhece que recebeu, mas não vai usar.

> **Dica:** por enquanto, não se preocupe com o `_`. Você vai encontrá-lo muito quando começar a lidar com **erros** (que é o próximo grande tema do Go).

