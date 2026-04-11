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

Funções em Go são **first-class citizens**: podem ser atribuídas a variáveis, passadas como argumentos e retornadas de outras funções. O tipo de uma função inclui os tipos dos parâmetros e dos retornos: `func(int, string) (float64, error)`. Funções podem retornar múltiplos valores — o padrão idiomático é `(T, error)`.

## Parâmetros variádicos e closures

Parâmetros variádicos (`...T`) recebem zero ou mais argumentos como um slice `[]T`. Para passar um slice existente: `f(s...)`.

Funções anônimas (**closures**) capturam variáveis por **referência**, não por cópia.

> **Armadilha clássica:** em `for i := range s { go func() { use(i) }() }` todas as goroutines capturam a mesma variável `i`. Passe como argumento: `go func(v int) { use(v) }(i)`.

> **Go 1.22+**: em módulos com `go 1.22+`, cada iteração de um `for` cria uma nova instância da variável de loop. O bug clássico foi corrigido. A forma explícita `go func(v int) { use(v) }(i)` ainda é a mais legível e recomendada por clareza.

## defer

`defer` empurha uma chamada de função em uma pilha **LIFO** local à função corrente. Deferridos executam quando a função retorna, seja por `return` normal ou por `panic`.

- Os **argumentos de `defer` são avaliados imediatamente** (no momento do `defer`), não no momento da execução
- Ordem: `defer f(1); defer f(2); defer f(3)` → executa `f(3)`, `f(2)`, `f(1)`
- Use para garantir cleanup: `defer f.Close()`, `defer mu.Unlock()`

## panic e recover

`panic` interrompe a execução normal e começa a desenrolar a call stack, executando funções deferridas. Se chegar ao topo da goroutine sem ser recuperado, o programa termina.

`recover()` captura o valor passado ao panic — mas **apenas dentro de uma função deferrida diretamente**. `recover()` fora de `defer` retorna `nil`. Para re-panic: se a lógica de recover quiser propagar, chame `panic(v)` novamente.
