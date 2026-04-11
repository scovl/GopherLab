---
title: Sobre a Linguagem e seu Histórico
description: A história do Go, criadores e filosofia da linguagem.
estimatedMinutes: 30
recursos:
  - https://go.dev/doc/
  - https://go.dev/blog/go-brand
  - https://youtu.be/WiGU_ZB-u0w?si=XjTuIuFwODaclfBE
experimentacao:
  desafio: "Execute o programa abaixo — é o Hello, World! tradicional de Go. Depois troque a mensagem para se apresentar: imprima seu nome e por que você está aprendendo Go."
  dicas:
    - "Use `fmt.Println(\"Texto aqui\")` para imprimir qualquer texto."
    - "Você pode chamar `fmt.Println` mais de uma vez para imprimir várias linhas."
    - "Strings em Go usam aspas duplas `\"`, nunca aspas simples."
  codeTemplate: |
    package main

    import "fmt"

    func main() {
    	fmt.Println("Hello, Go!")
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`package main`** — todo programa Go pertence a um pacote. O pacote `main` é especial: indica que este arquivo é um **executável**, não uma biblioteca.

    **`import "fmt"`** — importa o pacote `fmt` (format) da biblioteca padrão. Ele fornece funções para imprimir texto e formatar saída.

    **`func main()`** — a função `main` é o **ponto de entrada** do programa. É a primeira coisa que o Go executa quando você roda `go run`.

    **`fmt.Println("Hello, Go!")`** — chama a função `Println` do pacote `fmt`. Ela imprime o texto e adiciona uma quebra de linha automaticamente.
socializacao:
  discussao: O que te motivou a começar a aprender Go? O que mais te chamou atenção na história da linguagem?
  pontos:
    - Você conhecia algum dos criadores (Ken Thompson, Rob Pike) antes de estudar Go?
    - O fato de Go ter nascido por frustração com C++ muda sua percepção da linguagem?
    - O que significa para você que Go mantém compatibilidade retroativa desde 2012?
  diasDesafio: Dias 1–7
  sugestaoBlog: "Meu primeiro Hello, World! em Go: por que escolhi essa linguagem"
  hashtagsExtras: '#golang #beginner #helloworld'
aplicacao:
  projeto: Escreva um programa Go que se apresente para o mundo — imprima seu nome, de onde você vem e por que está aprendendo Go, usando apenas `fmt.Println`.
  requisitos:
    - O programa deve ter `package main` e `import "fmt"`
    - Usar `fmt.Println` pelo menos 3 vezes
    - Imprimir nome, origem e motivação para aprender Go
    - O programa deve compilar e rodar sem erros
  criterios:
    - Código compila e produz saída legível
    - Pelo menos 3 linhas de texto impresso
    - Estrutura correta do programa Go (package, import, func main)
  starterCode: |
    package main

    import "fmt"

    func main() {
    	fmt.Println("Olá! Meu nome é ...")
    	fmt.Println("Sou de ...")
    	fmt.Println("Estou aprendendo Go porque ...")
    }
---

Go (ou Golang) foi iniciado em setembro de 2007 por **Robert Griesemer**, **Rob Pike** e **Ken Thompson** enquanto aguardavam uma compilação C++ de 45 minutos no Google. O design começou em um documento interno de Pike e Thompson. A linguagem foi anunciada publicamente em novembro de 2009, com a versão 1.0 lançada em março de 2012. A promessa da v1.0 é mantida até hoje: **compatibilidade retroativa total** — qualquer código escrito para Go 1.x continua compilando e funcionando nas versões futuras.

## Marcos históricos

- **Go 1.5** (2015): compilador e runtime reescritos em Go (antes era C)
- **Go 1.11** (2018): Go Modules — resolveu o gerenciamento de dependências
- **Go 1.13** (2019): literais numéricos modernos (`0b`, `0o`, `_`)
- **Go 1.18** (2022): Generics — a feature mais requisitada em anos
- **Go 1.21** (2023): funções embutidas `min`/`max`, pacotes `slices`/`maps`/`cmp`, e `log/slog` para logging estruturado

## Os criadores

**Ken Thompson** criou Unix e C (Turing Award 1983) e co-criou UTF-8. **Rob Pike** trabalhou com Thompson em Unix e Plan 9, e criou o pacote `utf8`. Ambos são responsáveis diretos pelo fato de Go ser nativamente UTF-8.

Go é uma das poucas linguagens cujo compilador é escrito na própria linguagem depois de poucos anos de existência, demonstrando auto-suficiência.
