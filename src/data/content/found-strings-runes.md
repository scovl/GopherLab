---
title: Strings e Runes
description: Strings imutáveis, runes Unicode, raw strings, strings.Builder e o pacote strings.
estimatedMinutes: 35
recursos:
  - https://go.dev/blog/strings
  - https://gobyexample.com/strings-and-runes
  - https://pkg.go.dev/strings
experimentacao:
  desafio: Crie um programa que conta quantos caracteres Unicode (runes), bytes e palavras existem em um texto informado pelo usuário. Teste com texto em português (acentos) e japonês/emoji.
  dicas:
    - len(s) conta bytes, utf8.RuneCountInString(s) conta runes
    - strings.Fields separa por whitespace
    - for _, r := range s itera por rune
  codeTemplate: |
    package main

    import (
    	"fmt"
    	"strings"
    	"unicode/utf8"
    )

    func main() {
    	s := "Olá 世界"
    	fmt.Println(len(s))
    	fmt.Println(utf8.RuneCountInString(s))
    	for i, r := range s {
    		fmt.Printf("pos %d: %c (U+%04X)\n", i, r, r)
    	}
    	query := `SELECT * FROM users WHERE active = true`
    	fmt.Println(query)
    	var b strings.Builder
    	for i := 0; i < 100; i++ {
    		b.WriteString("Go ")
    	}
    	fmt.Println(b.Len())
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`len(s)` vs `utf8.RuneCountInString(s)`** — `len` conta **bytes**; `RuneCountInString` conta **runes** (code points Unicode). Para "Olá 世界" (7 caracteres visíveis): `len` retorna 14 bytes, `RuneCountInString` retorna 7 runes.

    **`for i, r := range s`** — `range` sobre string decodifica runes UTF-8 automaticamente. O índice `i` avança pelos **bytes** do rune, não por 1. O `r` é um `rune` (int32), não um byte.

    **`s[i]` retorna `byte`** — indexar posição `i` de uma string retorna `uint8`. Em texto multibyte, isso pode cortar um rune no meio. Sempre use `for range` para iterar por caracteres.

    **Raw string (backtick)** — preserva tudo literalmente: quebras de linha, barras invertidas, aspas. Ideal para SQL, regex e JSON templates. Impossível incluir `` ` `` dentro de uma raw string.

    **`strings.Builder`** — concatenação eficiente. O operador `+` cria nova alocação a cada uso: N concatenações = O(N²) cópias de memória. `Builder.WriteString` acumula num buffer; `b.String()` faz uma única cópia no final.
socializacao:
  discussao: Por que Go diferencia bytes de runes? Como isso afeta aplicações internacionais?
  pontos:
    - UTF-8 foi co-criado por Ken Thompson (criador do Go)
    - Indexar string por byte pode quebrar caracteres multibyte
    - "Comparação: strings em Python (Unicode) vs Go (bytes)"
  diasDesafio: Dias 8–18
  sugestaoBlog: "Strings e Runes em Go: UTF-8, Unicode e armadilhas comuns"
  hashtagsExtras: '#golang #strings #unicode'
aplicacao:
  projeto: Implemente um analisador de texto que recebe texto via stdin e retorna contagem de caracteres, palavras, linhas, frequência de letras e as 5 palavras mais comuns.
  requisitos:
    - Contar runes (não bytes)
    - Usar strings.Fields e strings.ToLower
    - Map para frequência de palavras
  criterios:
    - Contagem Unicode correta
    - Tratamento de acentos
    - Código idiomático
  starterCode: |
    package main

    import (
    	"fmt"
    	"sort"
    	"strings"
    	"unicode/utf8"
    )

    func analisar(texto string) {
    	fmt.Println("=== Análise de Texto ===")
    	fmt.Println("Bytes:", len(texto))
    	fmt.Println("Runes (caracteres):", utf8.RuneCountInString(texto))
    	palavras := strings.Fields(texto)
    	fmt.Println("Palavras:", len(palavras))

    	// Frequência de palavras
    	freq := make(map[string]int)
    	for _, p := range palavras {
    		freq[strings.ToLower(p)]++
    	}

    	// Top 3 palavras
    	type par struct{ w string; n int }
    	var pares []par
    	for w, n := range freq {
    		pares = append(pares, par{w, n})
    	}
    	sort.Slice(pares, func(i, j int) bool { return pares[i].n > pares[j].n })
    	fmt.Println("Top 3:")
    	for i := 0; i < 3 && i < len(pares); i++ {
    		fmt.Printf("  %s: %d\n", pares[i].w, pares[i].n)
    	}
    }

    func main() {
    	analisar("Go é simples Go é rápido e Go é idiomático")
    }

---

Strings em Go são sequências **imutáveis de bytes** codificadas em UTF-8. A operação `len(s)` retorna o número de bytes, não de caracteres — um caractere ASCII ocupa 1 byte, mas caracteres Unicode como `"ã"` ou `"世"` ocupam 2–4 bytes. Indexar com `s[i]` retorna um `byte` (uint8), não um caractere — isso silenciosamente corrompe texto multibyte.

Para iterar por caracteres (Unicode code points), use `for i, r := range s`: o `range` decodifica cada `rune` (int32) e avança `i` pelo número correto de bytes. `utf8.RuneCountInString(s)` conta runes corretamente.

## Tipos de literais string

| Tipo | Delimitador | Processa escapes? |
|---|---|---|
| Interpretado | `"..."` | Sim (`\n`, `\t`, `\uXXXX`) |
| Raw | `` `...` `` | Não — preserva tudo, incluindo quebras de linha reais |

Raw strings são ideais para regex, JSON templates e queries SQL multilinha.

## Concatenação eficiente

Strings são imutáveis: o operador `+` cria uma nova alocação a cada uso. Em N concatenações em loop, isso gera **O(N²) cópias**.

`strings.Builder` mantém um buffer crescente interno — `WriteString` não aloca até o flush final com `b.String()`. Use-o sempre que concatenar em loop.

## Pacotes úteis

- `strconv.Itoa` / `Atoi` — conversão int↔string decimal
- `strconv.ParseFloat` / `FormatFloat` — conversão de floats
- `strings.Contains`, `HasPrefix`, `HasSuffix`, `Index`, `Split`, `Join`, `Fields`, `TrimSpace`, `ToLower`, `ToUpper`, `Replace`, `Repeat`
