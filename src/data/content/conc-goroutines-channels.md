---
title: Goroutines e Channels
description: Goroutines, channels buffered/unbuffered, select e padrão produtor/consumidor.
estimatedMinutes: 50
recursos:
  - https://go.dev/tour/concurrency/1
  - https://gobyexample.com/goroutines
  - https://gobyexample.com/channels
  - https://gobyexample.com/select
experimentacao:
  desafio: "Implemente o padrão fan-out/fan-in: distribua URLs entre N workers que fazem HTTP GET concorrente e colete resultados em um channel único."
  dicas:
    - "Fan-out: um channel de jobs lido por N goroutines"
    - "Fan-in: N goroutines escrevem em um channel de resultados"
    - select com default para operação não-bloqueante
    - Sempre close(ch) quando não há mais dados a enviar
  codeTemplate: |
    package main

    import (
    	"fmt"
    	"sync"
    	"time"
    )

    func produtor(ch chan<- int, id int) {
    	for i := 0; i < 5; i++ {
    		val := id*100 + i
    		ch <- val
    		fmt.Printf("Produtor %d enviou %d\n", id, val)
    	}
    }

    func consumidor(ch <-chan int, wg *sync.WaitGroup) {
    	defer wg.Done()
    	for val := range ch {
    		fmt.Printf("  Consumidor recebeu: %d\n", val)
    		time.Sleep(100 * time.Millisecond)
    	}
    }

    func main() {
    	ch := make(chan int, 3) // channel buffered

    	// Fan-out: 2 produtores
    	go produtor(ch, 1)
    	go produtor(ch, 2)

    	// Fecha o channel quando produtores terminarem
    	go func() {
    		time.Sleep(time.Second)
    		close(ch)
    	}()

    	// Fan-in: 2 consumidores
    	var wg sync.WaitGroup
    	for i := 0; i < 2; i++ {
    		wg.Add(1)
    		go consumidor(ch, &wg)
    	}
    	wg.Wait()
    	fmt.Println("Pipeline finalizado")
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`ch := make(chan int, 3)`** — cria um channel buffered com capacidade 3. Até 3 valores podem ser enviados sem bloquear. No quarto envio, o produtor bloqueia até um consumidor receber. Canal sem capacidade (`make(chan int)`) é **unbuffered** — cada envio bloqueia até ter um receptor pronto.

    **`chan<- int` e `<-chan int`** — tipos direcionais. `chan<- int` é send-only (produtor), `<-chan int` é receive-only (consumidor). O compilador impede operações inválidas. O channel bidirecional `chan int` converte implicitamente para ambos.

    **`for val := range ch`** — itera valores recebidos do channel até ele ser **fechado**. Após `close(ch)`, o range drena valores restantes no buffer e termina. Sem `close`, o `range` bloqueia para sempre (goroutine leak!).

    **`close(ch)`** — sinaliza que não há mais valores. Enviar para channel fechado causa **panic**. Receber de channel fechado retorna zero value + `ok=false`. Fechar channel `nil` ou já fechado causa **panic**.

    **Regra fundamental** — o runtime Go usa o modelo **M:N**. `GOMAXPROCS` threads OS multiplexam milhares de goroutines, cada uma com ~2KB de stack elástica. A troca de contexto é feita pelo scheduler Go (não pelo kernel), ordens de grandeza mais barata que threads OS.
socializacao:
  discussao: "Rob Pike: 'Concorrência não é paralelismo.' O que isso significa?"
  pontos:
    - "Concorrência: design (lidar com muitas coisas)"
    - "Paralelismo: execução (fazer muitas coisas ao mesmo tempo)"
    - GOMAXPROCS controla quantos OS threads usam goroutines
    - CSP (Communicating Sequential Processes) model
  diasDesafio: Dias 29–38
  sugestaoBlog: "Goroutines e Channels: concorrência em Go sem locks"
  hashtagsExtras: '#golang #goroutines #channels #concurrency'
aplicacao:
  projeto: Pipeline de processamento com 3 estágios - gerar, transformar e agregar, usando goroutines e channels.
  requisitos:
    - Cada estágio em goroutine separada
    - Channels conectando estágios
    - Graceful shutdown com close(ch)
  criterios:
    - Pipeline funcional
    - Goroutines finalizadas
    - Channels fechados
  starterCode: |
    package main

    import (
    	"fmt"
    	"math/rand"
    	"sync"
    	"time"
    )

    func gerador(n int) <-chan int {
    	ch := make(chan int)
    	go func() {
    		defer close(ch)
    		for i := 0; i < n; i++ {
    			ch <- rand.Intn(100)
    		}
    	}()
    	return ch
    }

    func dobrar(in <-chan int) <-chan int {
    	out := make(chan int)
    	go func() {
    		defer close(out)
    		for v := range in {
    			out <- v * 2
    		}
    	}()
    	return out
    }

    func filtrar(in <-chan int, min int) <-chan int {
    	out := make(chan int)
    	go func() {
    		defer close(out)
    		for v := range in {
    			if v >= min {
    				out <- v
    			}
    		}
    	}()
    	return out
    }

    func coletar(in <-chan int, wg *sync.WaitGroup, resultados *[]int) {
    	defer wg.Done()
    	for v := range in {
    		*resultados = append(*resultados, v)
    	}
    }

    func main() {
    	start := time.Now()

    	// Pipeline: gerar → dobrar → filtrar(>=50)
    	numeros := gerador(20)
    	dobrados := dobrar(numeros)
    	filtrados := filtrar(dobrados, 50)

    	var wg sync.WaitGroup
    	var resultados []int
    	wg.Add(1)
    	go coletar(filtrados, &wg, &resultados)
    	wg.Wait()

    	fmt.Println("Resultados:", resultados)
    	fmt.Println("Tempo:", time.Since(start))
    }

---

## O que é uma goroutine? — funções que rodam "ao mesmo tempo"

Imagine que você está cozinhando. Você pode:
- **Sequencial:** ferve a água, espera, cozinha o macarrão, espera, faz o molho → lento
- **Concorrente:** coloca a água pra ferver, **enquanto isso** faz o molho → rápido

Em Go, uma **goroutine** é uma tarefa que roda "ao mesmo tempo" que outras. Você cria uma com a palavra `go`:

```go
func dizerOi(nome string) {
    fmt.Println("Oi,", nome)
}

func main() {
    go dizerOi("Ana")     // lança goroutine — roda em "paralelo"
    go dizerOi("Bruno")   // outra goroutine
    dizerOi("Carlos")     // roda na goroutine principal (main)
    time.Sleep(time.Second) // espera as goroutines terminarem
}
```

Saída (a ordem pode variar!):
```
Oi, Carlos
Oi, Ana
Oi, Bruno
```

### Por que a ordem muda?

Goroutines são **concorrentes** — o runtime Go decide quem roda quando. Não tem garantia de ordem. Cada execução pode dar resultado diferente.

### Goroutines são absurdamente baratas

| | Thread OS (Java, C#) | Goroutine (Go) |
|---|---|---|
| Memória inicial | ~1MB de stack | **~2KB** de stack |
| Criar 10.000 | Trava o sistema | Tranquilo |
| Criar 100.000 | Impossível | **Ainda tranquilo** |
| Quem gerencia | Kernel do SO | Runtime do Go |
| Troca de contexto | Cara (kernel) | Barata (userspace) |

> **Analogia:** threads OS são como **caminhões** — pesados, caros, limitados. Goroutines são como **bicicletas** — leves, baratas, cabem milhares na mesma rua.

O runtime do Go usa um modelo chamado **M:N**: ele multiplexa **M** goroutines em **N** threads do sistema operacional (`GOMAXPROCS` = número de CPUs). O scheduler do Go faz toda a mágica.

---

## O problema: como goroutines se comunicam?

Goroutines rodam de forma independente. Como uma passa dados para a outra? Com **channels** (canais).

> **Frase famosa:** "Não comunique compartilhando memória; compartilhe memória comunicando." — Provérbio Go

### O que é um channel?

Um channel é um **tubo** que conecta goroutines. Uma goroutine coloca dados de um lado, outra goroutine pega do outro lado.

```mermaid
flowchart LR
  ga(["🔵 Goroutine A"])
  ch(["📦 canal"])
  gb(["🟢 Goroutine B"])

  ga -->|"enviar →"| ch
  ch -->|"→ receber"| gb

  style ga fill:#e0f7ff,stroke:#0090b8,color:#0c4a6e
  style ch fill:#fef9c3,stroke:#ca8a04,color:#713f12
  style gb fill:#dcfce7,stroke:#16a34a,color:#14532d
```

### Criando e usando channels

```go
ch := make(chan string)  // cria um canal de strings

// Goroutine que ENVIA
go func() {
    ch <- "Olá!"    // coloca "Olá!" no canal (← seta aponta PRO canal)
}()

// Main RECEBE
msg := <-ch          // pega do canal (← seta aponta PRA FORA do canal)
fmt.Println(msg)     // "Olá!"
```

### A direção da seta `<-` conta a história

| Código | Leia como | O que faz |
|---|---|---|
| `ch <- valor` | "valor **vai para** o canal" | **Envia** para o canal |
| `valor := <-ch` | "valor **vem do** canal" | **Recebe** do canal |
| `chan<- int` | "canal que só recebe" | Tipo **send-only** |
| `<-chan int` | "canal que só envia" | Tipo **receive-only** |

---

## Unbuffered vs Buffered — com ou sem espaço interno

### Unbuffered (sem buffer) — entrega na mão

```go
ch := make(chan int)  // sem buffer — capacidade 0
```

O envio **bloqueia** até alguém receber. O recebimento **bloqueia** até alguém enviar. É como uma **ligação telefônica**: os dois precisam estar na linha ao mesmo tempo.

```go
ch := make(chan int)

go func() {
    ch <- 42           // BLOQUEIA aqui até main receber
    fmt.Println("Enviado!")
}()

valor := <-ch          // BLOQUEIA aqui até a goroutine enviar
fmt.Println(valor)     // 42
```

### Buffered (com buffer) — caixa de correio

```go
ch := make(chan int, 3)  // buffer de 3 — cabe 3 valores sem bloquear
```

O envio só bloqueia quando o buffer está **cheio**. O recebimento só bloqueia quando está **vazio**. É como uma **caixa de correio**: o carteiro põe a carta sem esperar, mas se a caixa tiver cheia, ele espera.

```go
ch := make(chan int, 2)
ch <- 10    // buffer: [10]     — não bloqueia
ch <- 20    // buffer: [10, 20] — não bloqueia
// ch <- 30  // BLOQUEARIA! buffer cheio — precisaria alguém receber

fmt.Println(<-ch)  // 10 — buffer: [20]
fmt.Println(<-ch)  // 20 — buffer: []
```

### Quando usar cada um?

| Tipo | Quando usar |
|---|---|
| **Unbuffered** `make(chan T)` | Sincronização — quer garantir que o receptor pegou o valor |
| **Buffered** `make(chan T, N)` | Desacoplar velocidade — produtor e consumidor em ritmos diferentes |

---

## Fechando channels — "não tenho mais nada pra enviar"

Fechar um canal sinaliza: **acabou, não vai ter mais dados**. Quem está recebendo precisa saber quando parar.

```go
ch := make(chan int)

go func() {
    for i := 1; i <= 3; i++ {
        ch <- i
    }
    close(ch)  // "terminei de enviar"
}()

// for range lê até o canal fechar
for valor := range ch {
    fmt.Println(valor)  // 1, 2, 3 — depois para automaticamente
}
```

### As regras de close — decore esta tabela!

| Operação | Canal `nil` | Canal aberto | Canal **fechado** |
|---|---|---|---|
| **Enviar** `ch <- v` | Bloqueia pra sempre | Envia (bloqueia se cheio) | **PANIC!** 💥 |
| **Receber** `<-ch` | Bloqueia pra sempre | Recebe (bloqueia se vazio) | Retorna zero value |
| **Fechar** `close(ch)` | **PANIC!** 💥 | Fecha normalmente | **PANIC!** 💥 |

> **3 panics para memorizar:** enviar em canal fechado, fechar canal nil, fechar canal já fechado. Os três causam panic.

### Como saber se o canal fechou?

```go
valor, ok := <-ch
if ok {
    fmt.Println("Recebi:", valor)
} else {
    fmt.Println("Canal fechou!")  // ok == false
}
```

O `ok` é `false` quando o canal está fechado E não tem mais valores no buffer.

> **Regra prática:** quem **envia** fecha o canal. Quem **recebe** nunca fecha — só para de ler quando `range` termina ou `ok == false`.

---

## `select` — esperando vários canais ao mesmo tempo

E se você tem **dois canais** e quer receber do que chegar primeiro? Use `select`:

```go
select {
case msg := <-emailCh:
    fmt.Println("Email:", msg)
case msg := <-smsCh:
    fmt.Println("SMS:", msg)
case <-time.After(3 * time.Second):
    fmt.Println("Timeout! Ninguém respondeu em 3s")
}
```

### Como o `select` funciona, passo a passo:

1. Olha todos os `case` ao mesmo tempo
2. Se **um** está pronto → executa esse
3. Se **vários** estão prontos → escolhe um **aleatório** (evita favorecer sempre o mesmo)
4. Se **nenhum** está pronto → bloqueia até um ficar pronto
5. Se tem `default` → executa o `default` em vez de bloquear

### `select` com `default` — operação não-bloqueante

```go
select {
case msg := <-ch:
    fmt.Println("Recebi:", msg)
default:
    fmt.Println("Nada disponível agora — sigo em frente")
}
```

Isso é um **try-receive**: tenta receber, mas se não tem nada, não espera.

---

## Padrão produtor/consumidor — o mais importante

Este é o padrão mais comum com goroutines e channels:

```mermaid
flowchart LR
  p1(["🔵 Produtor 1"])
  p2(["🔵 Produtor 2"])
  ch(["📦 canal"])
  c(["🟢 Consumidor"])

  p1 --> ch
  p2 --> ch
  ch --> c

  style p1 fill:#e0f7ff,stroke:#0090b8,color:#0c4a6e
  style p2 fill:#e0f7ff,stroke:#0090b8,color:#0c4a6e
  style ch fill:#fef9c3,stroke:#ca8a04,color:#713f12
  style c  fill:#dcfce7,stroke:#16a34a,color:#14532d
```

```go
func produtor(ch chan<- int, id int) {
    for i := 0; i < 3; i++ {
        valor := id*100 + i
        ch <- valor
        fmt.Printf("Produtor %d enviou %d\n", id, valor)
    }
}

func consumidor(ch <-chan int) {
    for valor := range ch {
        fmt.Printf("  Consumidor recebeu: %d\n", valor)
    }
}

func main() {
    ch := make(chan int, 5)

    // 2 produtores enviando
    go produtor(ch, 1)
    go produtor(ch, 2)

    // Espera produtores e fecha o canal
    time.Sleep(time.Second)
    close(ch)

    // Consumidor lê até o canal fechar
    consumidor(ch)
}
```

Note os tipos direcionais: `chan<- int` (só envia) e `<-chan int` (só recebe). O compilador **impede** que o produtor tente receber ou que o consumidor tente enviar.

---

## Goroutine leak — o bug silencioso mais perigoso

Uma goroutine que nunca termina é um **vazamento**. Ela fica consumindo memória para sempre:

```go
// ❌ LEAK! Se ninguém ler de ch, a goroutine fica presa no envio para sempre
go func() {
    ch <- resultado  // bloqueia eternamente se ninguém recebe
}()
```

### Como evitar:

1. **Sempre feche channels** quando não vai mais enviar
2. **Use `context.WithCancel`** para sinalizar goroutines que devem parar
3. **Use `select` com canal de done** para dar uma saída de emergência:

```go
done := make(chan struct{})

go func() {
    select {
    case ch <- resultado:
        // enviou com sucesso
    case <-done:
        // alguém mandou parar — saio limpo
        return
    }
}()

// Quando quiser cancelar:
close(done)
```

---

## Resumo visual

```
go funcao()          → lança goroutine (2KB, baratíssima)
ch := make(chan T)   → canal unbuffered (entrega na mão)
ch := make(chan T,N) → canal buffered (caixa de correio com N espaços)
ch <- valor          → envia (← aponta pro canal)
valor := <-ch        → recebe (← aponta pra fora)
close(ch)            → "acabou" (quem envia fecha)
for v := range ch    → lê até fechar
select { case... }   → espera vários canais
```
