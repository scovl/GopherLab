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

## Por que aprender Go?

Você já tem milhares de linguagens para escolher. Por que gastar seu tempo com mais uma? Aqui vai a resposta curta: **Go foi feita para resolver problemas reais que outras linguagens populares não resolvem bem**.

## O trade-off que Go resolveu

Cada linguagem popular resolvia bem um problema — mas criava outro. Go foi desenhada para pegar o melhor de cada uma:

| Linguagem | Boa em... | Mas... |
|---|---|---|
| **C/C++** | Velocidade de execução | Compilação lenta, código complexo, bugs de memória |
| **Java** | Projetos grandes, tipos seguros | Verbosa demais, JVM pesada para deploy |
| **Python** | Produtividade, legibilidade | Lenta para rodar, sem tipos em compile time |

Go foi a resposta: pegar as **melhores partes de cada uma** e deixar de fora a complexidade.

## O que Go te dá na prática

### 1. Compilação em segundos

Enquanto projetos C++ compilam em minutos e Java em dezenas de segundos, Go compila projetos grandes em **poucos segundos**. Você muda o código, compila, testa — tudo rápido.

### 2. Um único arquivo para deploy

Quando você compila um programa Go, sai um **único arquivo executável**. Sem runtime (como JVM do Java), sem gerenciador de pacotes no servidor (como pip do Python), sem `node_modules`. Você copia o arquivo para o servidor e pronto — funciona.

```bash
# Compila para Linux a partir de qualquer sistema
GOOS=linux GOARCH=amd64 go build -o meu-programa

# Deploy = copiar o arquivo
scp meu-programa servidor:/app/
```

### 3. Goroutines — concorrência sem dor de cabeça

Go foi projetada para fazer várias coisas ao mesmo tempo (concorrência). A ferramenta principal são as **goroutines** — como threads, mas muito mais leves:

| | Thread do sistema | Goroutine |
|---|---|---|
| **Memória** | ~1 MB cada | ~2 KB cada |
| **Criar 10.000** | Pesado, muitas vezes impossível | Tranquilo |
| **Comunicação** | Locks, mutexes (complicado) | Channels (simples) |

Você pode ter **milhares de goroutines** rodando ao mesmo tempo num programa Go sem problemas.

### 4. Uma linguagem pequena de verdade

Go tem apenas **25 palavras reservadas**. Para comparação:

- [Python: 35](https://docs.python.org/3/reference/lexical_analysis.html#keywords)
- [Java: 50+](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/_keywords.html)
- [C++: 80+](https://en.cppreference.com/w/cpp/keyword)

Menos palavras = menos coisas para decorar = **mais rápido para ficar produtivo**.

### 5. Garbage collector invisível

Go limpa a memória que você não usa mais automaticamente (garbage collection), com pausas **menores que 1 milissegundo**. Você não precisa pensar em gerenciamento de memória como em C/C++, e não sofre pausas longas como em Java.

## Quem usa Go no mundo real?

Como visto na lição anterior, Go é a linguagem por trás de Docker, Kubernetes, Terraform e Hugo. No Brasil, empresas como **Mercado Livre**, **Magazine Luiza**, **Itaú**, **PagSeguro**, **ContaAzul** e **Jusbrasil** usam Go em produção — especialmente em APIs, microsserviços e infraestrutura.

## Quando Go é a escolha certa?

Go brilha especialmente em:

- **APIs e microsserviços** — HTTP, REST, gRPC
- **Ferramentas de linha de comando (CLI)** — como Docker, kubectl, Terraform
- **Infraestrutura e DevOps** — proxies, load balancers, automação
- **Sistemas que precisam de concorrência** — servidores web, processamento de filas

## E quando Go NÃO é a melhor escolha?

Nenhuma linguagem é perfeita para tudo. Go não é ideal para:

- **Apps mobile** — Swift/Kotlin são melhores aqui
- **Frontend web** — JavaScript/TypeScript dominam esse espaço
- **Data Science/ML** — Python tem ecossistema imbatível
- **Jogos** — C++, C# (Unity) e Rust são mais indicados

## "Mas Go não tem classes nem herança!"

Correto. Go **não é orientada a objetos** no sentido tradicional — sem classes, sem herança, sem hierarquias complexas. Isso é uma **escolha de design**, não uma limitação.

Em vez de herança, Go usa **composição** (combinar tipos simples para criar complexos) e **interfaces** (contratos que tipos satisfazem automaticamente). O resultado é código mais simples e mais fácil de manter. Você vai entender isso em detalhes nas lições de structs e interfaces.

> **Resumo:** Go é rápida como C, simples como Python, feita para concorrência, e compila num único binário. Se você quer construir APIs, microsserviços ou ferramentas de infraestrutura, Go é uma escolha excelente.
