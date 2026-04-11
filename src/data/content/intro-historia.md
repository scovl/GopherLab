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

## Como Go nasceu: de uma compilação de 45 minutos

Em 2007, três engenheiros do Google — **Robert Griesemer**, **Rob Pike** e **Ken Thompson** — estavam esperando um projeto C++ compilar. Demorou **45 minutos**. Enquanto esperavam, começaram a rascunhar uma linguagem nova que resolvesse os problemas que os incomodavam:

- Compilação lenta demais
- Código complexo demais para ler e manter
- Problemas com concorrência (fazer várias coisas ao mesmo tempo)
- Dependências confusas entre pacotes

O resultado foi Go: uma linguagem que **compila em segundos**, tem sintaxe simples, e foi feita do zero para lidar com programas que precisam fazer muitas coisas ao mesmo tempo (servidores web, microsserviços, ferramentas de infraestrutura).

## Quem são os criadores?

| Criador | Por que ele importa |
|---|---|
| **Ken Thompson** | Co-criou o Unix e a linguagem C. Ganhou o prêmio Turing (o "Nobel da computação") em 1983. Também co-criou o UTF-8, o encoding que o mundo inteiro usa |
| **Rob Pike** | Trabalhou com Thompson no Unix e no Plan 9. Criou o suporte a UTF-8 em Go. É co-autor do livro "The Unix Programming Environment" |
| **Robert Griesemer** | Trabalhou no motor JavaScript V8 (o que roda dentro do Chrome e do Node.js) e na Java HotSpot VM |

> **Curiosidade:** como Thompson co-criou UTF-8, Go nasceu com suporte nativo a Unicode. Strings em Go são UTF-8 por padrão — você não precisa configurar nada para trabalhar com acentos, emojis ou ideogramas chineses.

## A linha do tempo

| Ano | O que aconteceu |
|---|---|
| **2007** | Griesemer, Pike e Thompson começam a desenhar a linguagem |
| **2009** | Go é anunciado publicamente como projeto open source |
| **2012** | Lançamento do **Go 1.0** com a promessa de compatibilidade |
| **2015** | **Go 1.5** — o compilador foi reescrito em Go! (antes era em C) |
| **2018** | **Go 1.11** — chegam os Go Modules, resolvendo o caos de dependências |
| **2022** | **Go 1.18** — finalmente Generics, a feature mais pedida por anos |
| **2023** | **Go 1.21** — funções `min`/`max` embutidas, pacotes `slices`/`maps` |

## A promessa de compatibilidade

Quando o Go 1.0 foi lançado em 2012, a equipe fez uma promessa ousada: **todo código escrito para Go 1.x vai continuar compilando e funcionando em versões futuras**. Isso significa que um programa escrito em 2012 roda sem alteração em Go 1.23 (2024).

Para quem já sofreu atualizando projetos em Python 2→3, Ruby, Angular ou qualquer outra linguagem que quebra código antigo, isso é um alívio enorme. Você aprende Go uma vez e o que aprendeu continua valendo.

## Por que o nome "Go"? E "Golang"?

O nome oficial é **Go**. O problema é que "Go" é uma palavra muito genérica — difícil de pesquisar no Google. Por isso a comunidade usa **Golang** (Go + language) para facilitar buscas. O site oficial é [go.dev](https://go.dev), mas se você pesquisar "golang" no Google, encontra tudo o que precisa.

## Onde Go é usado hoje?

Go é a linguagem por trás de muitas ferramentas que você provavelmente já usou (mesmo sem saber):

- **Docker** — a plataforma de containers
- **Kubernetes** — o orquestrador de containers
- **Terraform** — infraestrutura como código
- **Hugo** — gerador de sites estáticos (um dos mais rápidos do mundo)
- **Prometheus** — monitoramento e alertas

Empresas como Google, Uber, Twitch, Dropbox e Mercado Livre usam Go em produção. A linguagem é especialmente popular para **APIs, microsserviços e ferramentas de DevOps**.
