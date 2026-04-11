---
title: Arrays, Slices e Maps
description: Estruturas de dados - arrays (fixos), slices (dinâmicos), maps (chave-valor) e make().
estimatedMinutes: 50
recursos:
  - https://go.dev/tour/moretypes/6
  - https://gobyexample.com/slices
  - https://gobyexample.com/maps
experimentacao:
  desafio: Crie um todo list em memória com um slice de structs para tarefas e um map para categorias. Implemente adicionar, listar, marcar como feita e filtrar por categoria.
  dicas:
    - append retorna novo slice — reatribua s = append(s, item)
    - delete(map, key) remove entrada; não dá erro se key não existir
    - Iteração de map não tem ordem garantida
    - Teste len() e cap() antes e depois de append
  codeTemplate: |
    package main

    import "fmt"

    func main() {
    	var nums [3]int = [3]int{1, 2, 3}
    	frutas := []string{"maçã", "banana", "uva"}
    	frutas = append(frutas, "manga")
    	fmt.Println(len(frutas), cap(frutas))
    	buf := make([]byte, 0, 1024)
    	arr := [5]int{10, 20, 30, 40, 50}
    	sub := arr[1:4]
    	idades := map[string]int{"Alice": 30, "Bob": 25}
    	idades["Carol"] = 28
    	delete(idades, "Bob")
    	idade, ok := idades["Dave"]
    	if !ok {
    		fmt.Println("Dave não encontrado")
    	}
    	for i, f := range frutas {
    		fmt.Printf("%d: %s\n", i, f)
    	}
    	fmt.Println(nums, buf, sub, idade)
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **Array `[3]int`** — tamanho fixo e parte do tipo: `[3]int` e `[4]int` são tipos incompatíveis. Arrays são copiados inteiros na atribuição (value type).

    **`append(frutas, "manga")`** — `append` retorna um **novo slice**. Se não houver capacidade, aloca novo array subjacente. Sempre reatribua: `frutas = append(frutas, "manga")`. Esquecer de reatribuir é o bug mais comum com slices.

    **`make([]byte, 0, 1024)`** — cria slice com `len=0` e `cap=1024` pré-alocada. Evita realocações ao crescer. Use quando você conhece o tamanho máximo antecipadamente.

    **`arr[1:4]`** — sub-slice: compartilha o array subjacente. Modificar `sub[0]` modifica `arr[1]`. Tome cuidado com vazamentos de memória em sub-slices de arrays grandes.

    **Comma-ok** — `idade, ok := idades["Dave"]`: se a chave não existir, `ok = false` e `idade = 0` (zero value). Sempre use `ok` para distinguir "chave ausente" de "chave com valor zero".

    **`delete(idades, "Bob")`** — seguro mesmo se a chave não existir. Leitura em mapa `nil` retorna zero value, mas **escrita em mapa `nil` causa panic**.
socializacao:
  discussao: Quando usar array vs slice vs map? Como o Go gerencia a memória de slices?
  pontos:
    - "Arrays: tamanho parte do tipo — [3]int ≠ [4]int"
    - "Slices: grow strategy — ao menos dobra para slices pequenos (detalhe de implementação, não garantido pela spec)"
    - "Maps: referência interna — passar para função modifica original"
  diasDesafio: Dias 8–18
  sugestaoBlog: "Arrays, Slices e Maps em Go: o que o Go 101 não te conta"
  hashtagsExtras: '#golang #slices #maps'
aplicacao:
  projeto: Implemente um contador de palavras que leia texto e retorne frequência de cada palavra ordenada por contagem.
  requisitos:
    - Usar map[string]int para frequências
    - Usar strings.Fields para separar palavras
    - Ordenar resultado por frequência (sort.Slice)
  criterios:
    - Contagem correta
    - Tratamento de maiúsculas/minúsculas
    - Código idiomático
  starterCode: |
    package main

    import (
    	"fmt"
    	"sort"
    	"strings"
    )

    func contarPalavras(texto string) map[string]int {
    	freq := make(map[string]int)
    	for _, palavra := range strings.Fields(strings.ToLower(texto)) {
    		freq[palavra]++
    	}
    	return freq
    }

    func main() {
    	texto := "go é simples go é rápido go é eficiente e go é divertido"
    	freq := contarPalavras(texto)

    	// Ordena as palavras por frequência
    	type par struct {
    		palavra string
    		contagem int
    	}
    	var pares []par
    	for p, c := range freq {
    		pares = append(pares, par{p, c})
    	}
    	sort.Slice(pares, func(i, j int) bool {
    		return pares[i].contagem > pares[j].contagem
    	})
    	for _, p := range pares {
    	fmt.Printf("%-15s %d\n", p.palavra, p.contagem)
    	}
    }

---

Go tem três estruturas principais para guardar coleções de dados. Vamos do mais simples ao mais poderoso.

## Arrays — tamanho fixo, quase nunca usado

Um array é uma lista com **tamanho fixo decidido na hora da criação**. O tamanho faz parte do tipo — `[3]int` e `[4]int` são tipos **completamente diferentes**:

```go
var notas [3]int = [3]int{10, 8, 9}
fmt.Println(notas[0])  // 10
fmt.Println(len(notas)) // 3
```

Arrays são copiados inteiros quando você atribui ou passa para funções:

```go
a := [3]int{1, 2, 3}
b := a        // cópia completa — b é independente
b[0] = 999
fmt.Println(a[0])  // 1 — não mudou!
```

> **Na prática:** arrays são raros no código Go do dia-a-dia. Para quase tudo, use **slices**.

## Slices — a lista dinâmica do Go

Um **slice** é como um array que pode crescer. É a estrutura de dados mais usada em Go:

```go
frutas := []string{"maçã", "banana", "uva"}  // note: sem número nos colchetes
frutas = append(frutas, "manga")              // cresceu!
fmt.Println(frutas)  // [maçã banana uva manga]
```

### Como um slice funciona por dentro

Um slice é na verdade uma "janela" sobre um array escondido. Ele guarda 3 informações:

| Campo | O que é | Exemplo |
|---|---|---|
| **Ponteiro** | Onde o array começa na memória | → `[maçã, banana, uva, manga, _, _]` |
| **len** | Quantos elementos estão em uso | 4 |
| **cap** | Quantos cabem antes de precisar crescer | 6 |

```go
s := make([]int, 3, 10)  // len=3, cap=10
fmt.Println(len(s))       // 3
fmt.Println(cap(s))       // 10
```

### O bug número 1 com slices: esquecer de reatribuir

`append` devolve um **novo slice**. Se você não guardar o resultado, perde o elemento adicionado:

```go
// ❌ Errado — element perdido!
frutas := []string{"maçã"}
append(frutas, "banana")    // resultado jogado fora

// ✅ Correto
frutas = append(frutas, "banana")
```

### Sub-slices compartilham memória

Quando você fatia um slice, o resultado aponta para o **mesmo array**:

```go
nums := []int{10, 20, 30, 40, 50}
pedaco := nums[1:3]      // [20, 30]
pedaco[0] = 999
fmt.Println(nums[1])     // 999 — o original mudou!
```

Se isso te assusta, use `copy` para criar uma cópia independente:

```go
copia := make([]int, len(pedaco))
copy(copia, pedaco)  // copia é independente agora
```

## Maps — dicionário chave→valor

Um **map** é como um dicionário: você busca um **valor** usando uma **chave**:

```go
idades := map[string]int{
    "Alice": 30,
    "Bob":   25,
}
fmt.Println(idades["Alice"])  // 30
```

### Operações básicas

```go
// Adicionar ou atualizar
idades["Carol"] = 28

// Remover (seguro mesmo se a chave não existir)
delete(idades, "Bob")

// Verificar se uma chave existe
idade, existe := idades["Dave"]
if !existe {
    fmt.Println("Dave não encontrado")
}
```

O padrão `valor, ok := mapa[chave]` se chama **comma-ok**. É essencial para distinguir "chave não existe" de "chave existe com valor zero":

```go
notas := map[string]int{"Ana": 0, "Bia": 8}

nota := notas["Ana"]           // 0 — mas ela existe ou não?
nota, ok := notas["Ana"]       // ok=true → existe, nota é 0 de verdade
nota, ok = notas["Carlos"]     // ok=false → não existe, nota é 0 por padrão
```

### Cuidados com maps

**A ordem é aleatória.** Se você percorrer um map com `for range`, a ordem muda a cada execução do programa. Isso é intencional.

**Maps são "referências" por natureza.** Passar um map para uma função permite que ela modifique o original:

```go
func dobrarIdades(m map[string]int) {
    for k := range m {
        m[k] *= 2  // modifica o map original!
    }
}
```

## `nil` — quando a coleção não existe

Uma variável slice ou map sem inicializar vale `nil`. Algumas operações são seguras, outras causam panic:

| Operação | Slice nil | Map nil |
|---|---|---|
| `len(x)` | ✅ retorna 0 | ✅ retorna 0 |
| Ler: `x[key]` | ❌ panic | ✅ retorna zero value |
| `append(x, item)` | ✅ funciona | — (maps não têm append) |
| Escrever: `x[key] = val` | ❌ panic | ❌ **panic!** |

> **Regra prática:** para slices, `append` num slice nil funciona — ele cria o array para você. Para maps, **sempre inicialize** com `make(map[string]int{})` ou literal antes de escrever.

```go
// ✅ Seguro
var s []int
s = append(s, 1)  // cria o array automaticamente

// ❌ Panic!
var m map[string]int
m["chave"] = 1  // 💥 panic: assignment to entry in nil map

// ✅ Seguro
m = make(map[string]int)
m["chave"] = 1  // agora sim
```
