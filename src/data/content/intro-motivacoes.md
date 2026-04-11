---
title: Motivações para Aprender Go
description: Por que investir horas da sua vida aprendendo Go? Entenda o contexto, as vantagens e quando usar a linguagem.
estimatedMinutes: 20
recursos:
  - https://go.dev/solutions/
  - https://go.dev/doc/faq
  - https://githut.info/
  - https://survey.stackoverflow.co/2024/technology#most-popular-technologies-language
  - https://youtu.be/jXA0O5b-F1g?si=zo86JYln97tQ-Hju
experimentacao:
  desafio: "Execute o programa abaixo — ele imprime alguns fatos sobre Go usando variáveis. Depois adicione mais uma linha com um fato que você achou interessante sobre a linguagem."
  dicas:
    - "`:=` é a declaração curta de variável em Go: declara e atribui ao mesmo tempo."
    - "Você pode usar `fmt.Println` com múltiplos argumentos separados por vírgula."
    - "Consulte [go.dev/doc/faq](https://go.dev/doc/faq) para descobrir mais fatos sobre Go."
  codeTemplate: |
    package main

    import "fmt"

    func main() {
    	linguagem := "Go"
    	palavrasReservadas := 25
    	goroutineKB := 2

    	fmt.Println("Por que aprender", linguagem, "?")
    	fmt.Println("──────────────────────────────────────")
    	fmt.Printf("Palavras reservadas:  %d (Python tem 35, Java tem 50+)\n", palavrasReservadas)
    	fmt.Printf("Goroutine usa ~%d KB (thread OS usa ~1.000 KB)\n", goroutineKB)
    	fmt.Println("Compilação: segundos, não minutos")
    	fmt.Println("Deploy: um único binário, sem dependências")
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`:=`** — o operador de declaração curta. Ele declara a variável **e** atribui o valor ao mesmo tempo, sem precisar escrever o tipo explicitamente. Go infere que `linguagem` é `string` e `palavrasReservadas` é `int` automaticamente.

    **`fmt.Println` com múltiplos argumentos** — você pode passar vários valores separados por vírgula. Go insere um espaço entre eles automaticamente.

    **`fmt.Printf`** — formata a string antes de imprimir. O verbo `%d` substitui um inteiro, `%s` substitui texto. O `\n` adiciona a quebra de linha (que o `Printf` não adiciona sozinho, ao contrário do `Println`).
socializacao:
  discussao: O que mais te convenceu a investir tempo aprendendo Go? Foi a simplicidade, a performance, o mercado, ou outra coisa?
  pontos:
    - Você já usou alguma linguagem com deploy complicado ou compilação lenta? O que você mudaria?
    - Das empresas brasileiras que usam Go (Mercado Livre, Magazine Luiza, PagSeguro...) alguma te surpreendeu?
    - Go não é orientado a objetos do jeito tradicional — isso te preocupa ou te alivia?
  diasDesafio: Dias 1–7
  sugestaoBlog: "Por que escolhi Go: o que me convenceu depois de estudar a história e as motivações"
  hashtagsExtras: '#golang #beginner #whygo'
aplicacao:
  projeto: Escreva um programa Go que imprima seus motivos pessoais para aprender a linguagem, usando variáveis para armazenar cada informação.
  requisitos:
    - Declarar pelo menos 3 variáveis com `:=`
    - Usar `fmt.Println` ou `fmt.Printf` para imprimir cada variável
    - As variáveis devem representar informações reais suas (nome, linguagem anterior, objetivo com Go)
    - O programa deve compilar e rodar sem erros
  criterios:
    - Código compila e produz saída legível
    - Pelo menos 3 variáveis declaradas com `:=`
    - Saída faz sentido e tem contexto pessoal
  starterCode: |
    package main

    import "fmt"

    func main() {
    	nome := "Seu Nome"
    	linguagemAnterior := "JavaScript" // troque pela sua
    	objetivoComGo := "Construir APIs rápidas"

    	fmt.Println("Olá! Meu nome é", nome)
    	fmt.Println("Vim de:", linguagemAnterior)
    	fmt.Println("Quero com Go:", objetivoComGo)
    }
---

Antes de passar horas estudando Go, vale a pena entender **por que** fazer esse investimento. A linguagem foi criada dentro do Google em 2007, num contexto bem específico: os engenheiros precisavam de performance, mas linguagens rápidas como C++ eram complexas e tinham tempo de compilação absurdo projetos grandes levavam **45 minutos ou mais** para compilar. 

Ao mesmo tempo, a era dos processadores multi-núcleo estava chegando, e as linguagens existentes não eram propícias para explorar esse paralelismo com facilidade. A solução foi criar uma linguagem nova. Simples como Python, rápida como C, e pensada para concorrência desde o início.

## O que Go entrega

- **Compilação ultra-rápida** — projetos grandes compilam em segundos, não minutos.
- **Binário estático único** — o deploy é copiar um arquivo; sem instalação de runtime, sem dependências externas.
- **Garbage collector de baixa latência** — pausas abaixo de 1ms desde Go 1.14.
- **Goroutines** — como threads, mas leves: uma goroutine usa ~2 KB de memória; uma thread do OS usa ~1 MB.
- **Cross-compilation** — um comando compila seu código para Linux, Windows ou macOS de qualquer máquina.
- **Apenas 25 palavras reservadas** — menos que Python (35), muito menos que Java (50+).

## Quem usa Go hoje (2025)

Go saiu do Google e hoje está no coração da infraestrutura moderna: **[Kubernetes](https://kubernetes.io/)**, **[Docker](https://www.docker.com/)**, **[Terraform](https://www.terraform.io/)** e **[Hugo](https://gohugo.io/)** são escritos em Go. No Brasil, empresas como **[Mercado Livre](https://www.mercadolivre.com.br/)**, **[Magazine Luiza](https://www.magazineluiza.com.br/)**, **[Itaú-unibanco](https://www.itau.com.br/)**, **[PagSeguro](https://www.pagseguro.com.br/)**, **[ContaAzul](https://www.contaazul.com/)**, **[Jusbrasil](https://www.jusbrasil.com.br/)** e **[ResultadosDigitais](https://www.rd.com.br/)** usam Go em produção.

## Quando usar Go

Go brilha em qualquer situação onde **performance, simplicidade de deploy e concorrência** importam: APIs REST/gRPC, microsserviços, CLIs, ferramentas DevOps, proxies e orquestração de contêineres.

A linguagem não é orientada a objetos no sentido tradicional — não tem herança, não tem classes. Isso é uma escolha deliberada de simplicidade, não uma limitação. 

Com interfaces e composição, você resolve os mesmos problemas com menos cerimônia. Vale ler o [FAQ oficial](https://go.dev/doc/faq#Is_Go_an_object-oriented_language) sobre isso quando chegar a hora.
