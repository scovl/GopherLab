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
    		fmt.Printf("%-15s %d
    ", p.palavra, p.contagem)
    	}
    }

---

## Arrays

Arrays têm tamanho fixo que é **parte do tipo**: `[3]int` e `[4]int` são tipos distintos e incompatíveis. Arrays são **value types** — atribuir copia todos os elementos. Use arrays quando o tamanho é fixo e conhecido (ex: buffers SHA256 `[32]byte`). Para a maioria dos casos, use slices.

## Slices

Slices são referências dinâmicas a arrays subjacentes com **três campos internos**: ponteiro para o array, `len` (elementos usados) e `cap` (capacidade do array a partir do ponteiro). Modificar `s[i]` modifica o array subjacente — sub-slices compartilham memória.

`append()` sempre retorna um novo slice; quando `len == cap`, aloca novo array e copia:
- Para slices com menos de 256 elementos: **dobra** a capacidade
- Para slices maiores: cresce **~25%**

Sempre reatribua: `s = append(s, item)`. Use `make([]T, len, cap)` para pré-alocar capacidade e evitar realocações.

## Maps

Maps são hash tables `key→value`. Chaves devem ser comparáveis com `==` (int, string, structs sem campos slice/map/função). Passar map para função passa a **referência** — modificações são visíveis no caller.

```go
val, ok := m[key]  // comma-ok: distingue "chave ausente" de "chave com valor zero"
delete(m, key)     // seguro mesmo se a chave não existir
```

A ordem de iteração em maps é **intencionalmente aleatória** a cada execução.

## nil vs zero value

| Tipo | nil válido? | Operações seguras em nil |
|---|---|---|
| slice | ✅ | `len`, `cap`, `append` |
| map | ✅ | leitura (retorna zero value) |
| map | ❌ | **escrita causa panic** |

`make()` cria slices, maps e channels com estado inicial válido.
