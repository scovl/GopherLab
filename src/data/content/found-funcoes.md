---
title: Funções
description: Múltiplos retornos, named returns, variadic, funções anônimas, closures e defer.
estimatedMinutes: 45
recursos:
  - https://go.dev/tour/moretypes/24
  - https://gobyexample.com/closures
  - https://gobyexample.com/defer
  - https://go.dev/blog/defer-panic-and-recover
experimentacao:
  desafio: "Crie: (1) uma função variádica que calcule média; (2) um acumulador com closure que mantém estado; (3) um leitor de arquivo que use defer para garantir Close()."
  dicas:
    - "Variadic: func media(nums ...float64) float64"
    - Closure captura a variável, não o valor
    - defer f.Close() logo após abrir o arquivo
    - "Cuidado: defer em loop pode acumular — use função interna"
  codeTemplate: |
    package main

    import "fmt"

    func dividir(a, b float64) (float64, error) {
    	if b == 0 {
    		return 0, fmt.Errorf("divisão por zero")
    	}
    	return a / b, nil
    }

    func retangulo(l, a float64) (area, perimetro float64) {
    	area = l * a
    	perimetro = 2 * (l + a)
    	return
    }

    func soma(nums ...int) int {
    	total := 0
    	for _, n := range nums {
    		total += n
    	}
    	return total
    }

    func main() {
    	contador := func() func() int {
    		n := 0
    		return func() int { n++; return n }
    	}()
    	fmt.Println(contador(), contador())
    	fmt.Println("início")
    	defer fmt.Println("defer 1")
    	defer fmt.Println("defer 2")
    	fmt.Println("fim")
    	fmt.Println(soma(1, 2, 3, 4, 5))
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **Closure `contador`** — a função interna captura `n` por **referência**, não por cópia. Cada chamada de `contador()` incrementa o mesmo `n`. A função externa é chamada imediatamente com `()` no final (IIFE).

    **`defer fmt.Println("defer 2")`** — deferridos executam em ordem **LIFO** quando a função retorna. Saída: "início", "fim", "defer 2", "defer 1". Os **argumentos são avaliados no momento do `defer`**, não na execução.

    **Parâmetro variádico `soma(nums ...int)`** — `nums` é `[]int` dentro da função. Para passar slice existente: `soma(meusNums...)`. Cada chamada `soma(1, 2, 3)` aloca um novo slice.

    **`dividir(a, b float64) (float64, error)`** — padrão Go: múltiplos retornos com `error` no final. `nil` significa sucesso. Sempre verifique o erro antes de usar o resultado.

    **Named returns** — `(area, perimetro float64)` declara variáveis de resultado nomeadas. `return` sem argumentos (naked return) retorna os valores atuais dessas variáveis. Use com moderação — em funções longas, naked returns prejudicam a legibilidade.

    **Go 1.22+**: o bug clássico de closures capturando variável de loop foi corrigido — cada iteração cria uma nova instância da variável. `go func(v int) { use(v) }(i)` ainda é a forma mais explícita e legível.
socializacao:
  discussao: Closures são poderosas mas podem causar bugs sutis. Quais armadilhas você encontrou?
  pontos:
    - Closure capturando variável de loop (clássico bug com goroutines)
    - "Defer em loop: arquivos abertos não fecham até fim da função"
    - "Named returns: clareza vs confusão em funções longas"
  diasDesafio: Dias 8–18
  sugestaoBlog: "Funções em Go: closures, defer e o padrão (T, error)"
  hashtagsExtras: '#golang #functions #defer #closures'
aplicacao:
  projeto: Implemente um mini-logger que usa closures para manter estado (nível, prefixo) e defer para flush no final.
  requisitos:
    - Closure para factory de logger com nível
    - Funções variádicas para mensagens
    - Defer para flush/close
  criterios:
    - Closures corretas
    - Defer no lugar certo
    - Estado encapsulado
  starterCode: |
    package main

    import "fmt"

    // loggerFactory retorna uma função de log com prefixo e nível
    func loggerFactory(nivel, prefixo string) func(...any) {
    	return func(args ...any) {
    		fmt.Printf("[%s] %s: ", nivel, prefixo)
    		fmt.Println(args...)
    	}
    }

    // processar retorna (resultado, erro) — padrão Go
    func processar(nome string) (resultado string, err error) {
    	defer func() {
    		if r := recover(); r != nil {
    			err = fmt.Errorf("panic recuperado: %v", r)
    		}
    	}()
    	if nome == "" {
    		return "", fmt.Errorf("nome não pode ser vazio")
    	}
    	return "Processado: " + nome, nil
    }

    func main() {
    	info := loggerFactory("INFO", "app")
    	warn := loggerFactory("WARN", "app")

    	info("Iniciando aplicação")
    	warn("Sem autenticação configurada")

    	res, err := processar("Go")
    	if err != nil {
    		fmt.Println("Erro:", err)
    		return
    	}
    	fmt.Println(res)
    }

---

## Funções são "cidadãs de primeira classe"

Em Go, funções são como qualquer outro valor — você pode guardá-las em variáveis, passá-las como argumento e retorná-las de outras funções:

```go
// Guardar numa variável
dobro := func(n int) int { return n * 2 }
fmt.Println(dobro(5))  // 10

// Passar como argumento
func aplicar(f func(int) int, valor int) int {
    return f(valor)
}
fmt.Println(aplicar(dobro, 3))  // 6
```

## Múltiplos retornos — o jeito Go de lidar com erros

Em Go, funções podem retornar **mais de um valor**. O padrão mais comum é retornar o resultado **e** um erro:

```go
func dividir(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("divisão por zero")
    }
    return a / b, nil  // nil = sem erro
}

resultado, err := dividir(10, 3)
if err != nil {
    fmt.Println("Deu ruim:", err)
    return
}
fmt.Println(resultado)  // 3.333...
```

> **Regra de ouro do Go:** sempre verifique o `err` antes de usar o resultado. Ignorar erros é a causa número 1 de bugs.

## Parâmetros variádicos — aceitar qualquer quantidade

Às vezes você quer uma função que aceite 1, 5 ou 100 argumentos. Use `...` antes do tipo:

```go
func soma(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

soma(1, 2, 3)       // 6
soma(10, 20)         // 30
soma()               // 0 — zero argumentos também funciona
```

Dentro da função, `nums` é um `[]int` (slice) normal. Se você já tem um slice e quer passá-lo, use `...` no final:

```go
numeros := []int{1, 2, 3, 4, 5}
soma(numeros...)  // 15
```

## Closures — funções que "lembram" do ambiente

Uma **closure** é uma função que captura variáveis do ambiente onde foi criada. Mesmo depois que o ambiente "acabou", a closure continua acessando aquelas variáveis:

```go
func criarContador() func() int {
    n := 0                    // variável "presa" na closure
    return func() int {
        n++                   // incrementa o n de cima
        return n
    }
}

contador := criarContador()
fmt.Println(contador())  // 1
fmt.Println(contador())  // 2
fmt.Println(contador())  // 3 — o n persiste entre chamadas!
```

A closure captura a **variável em si** (por referência), não uma cópia do valor. Por isso `n` continua existindo e sendo incrementado.

### A armadilha clássica das closures em loops

```go
// ❌ Bug (em Go antes de 1.22)
for i := 0; i < 3; i++ {
    go func() {
        fmt.Println(i)  // todas imprimem 3! (capturam a mesma variável i)
    }()
}

// ✅ Solução: passar como argumento (cria cópia)
for i := 0; i < 3; i++ {
    go func(v int) {
        fmt.Println(v)  // imprime 0, 1, 2 corretamente
    }(i)
}
```

> **Go 1.22+:** esse bug foi corrigido — cada iteração cria uma nova variável. Mas a forma com argumento explícito ainda é mais clara e recomendada.

## `defer` — "faça isso quando eu sair"

`defer` agenda uma função para executar **quando a função atual terminar**. É perfeito para limpeza: fechar arquivos, liberar locks, etc.

```go
func lerArquivo() {
    f, err := os.Open("dados.txt")
    if err != nil { return }
    defer f.Close()  // ← vai executar quando lerArquivo() retornar

    // ... usa o arquivo tranquilamente
    // não importa como a função termine, f.Close() será chamado
}
```

Três coisas para lembrar sobre `defer`:

**1. Os argumentos são avaliados na hora, não depois:**

```go
x := 10
defer fmt.Println(x)  // registra o valor 10 agora
x = 20
// quando a função retornar, imprime 10 (não 20)
```

**2. Múltiplos defers executam em ordem inversa (LIFO — último primeiro):**

```go
defer fmt.Println("primeiro")
defer fmt.Println("segundo")
defer fmt.Println("terceiro")
// saída: terceiro, segundo, primeiro
```

**3. Cuidado com defer dentro de loop:**

```go
// ❌ Perigoso — acumula arquivos abertos até o fim da função!
for _, nome := range arquivos {
    f, _ := os.Open(nome)
    defer f.Close()  // só fecha quando a função INTEIRA retornar
}

// ✅ Solução: colocar numa função separada
for _, nome := range arquivos {
    processarArquivo(nome)  // defer dentro dessa função fecha imediatamente
}
```

## `panic` e `recover` — para emergências

`panic` é como puxar o freio de emergência — interrompe tudo e começa a "desenrolar" a pilha de chamadas:

```go
panic("algo terrível aconteceu!")
// programa para aqui e mostra stack trace
```

`recover` captura o panic e permite que o programa continue — mas **só funciona dentro de um `defer`**:

```go
func operacaoSegura() (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recuperado: %v", r)
        }
    }()

    // se algo causar panic aqui, o defer captura
    panic("ops!")
}

err := operacaoSegura()
fmt.Println(err)  // "recuperado: ops!" — programa continua rodando
```

> **Regra prática:** use `panic` quase nunca. Use `error` para erros esperados (arquivo não encontrado, input inválido). Reserve `panic` para situações realmente impossíveis (bug no código, estado corrompido). Se você está em dúvida, retorne `error`.
