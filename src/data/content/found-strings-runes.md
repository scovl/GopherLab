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

## Strings são bytes, não letras

A primeira surpresa de strings em Go: uma string é uma **sequência de bytes**, não de caracteres. Parece a mesma coisa, mas não é.

Letras ASCII (a-z, 0-9) cabem em **1 byte** cada. Mas letras acentuadas como `ã`, emojis como `🎉` e ideogramas como `世` precisam de **2, 3 ou até 4 bytes**:

```go
s := "Olá"
fmt.Println(len(s))  // 4 (não 3!) — o "á" ocupa 2 bytes
```

Por isso, `len(s)` **conta bytes**, não letras. Se você precisa contar caracteres de verdade, use `utf8.RuneCountInString(s)`.

## O que é uma rune?

Uma **rune** é um caractere Unicode — representada internamente como um `int32`. Pense assim:

| Conceito | Tipo em Go | O que representa |
|---|---|---|
| Byte | `byte` (`uint8`) | 1 pedaço de 8 bits |
| Rune | `rune` (`int32`) | 1 caractere Unicode completo |

A letra `A` é uma rune que cabe em 1 byte. O caractere `世` é uma rune que precisa de 3 bytes em UTF-8.

## Como iterar por caracteres corretamente

**Errado** — indexar por posição devolve um byte, que pode ser só um pedaço de um caractere:

```go
s := "Olá"
fmt.Println(s[2])  // 195 — um byte solto do "á", não a letra!
```

**Certo** — usar `for range`, que decodifica cada rune automaticamente:

```go
for i, r := range "Olá 世界" {
    fmt.Printf("posição %d: %c\n", i, r)
}
// posição 0: O
// posição 1: l
// posição 2: á     ← pulou para posição 4 porque "á" usa 2 bytes
// posição 4:       ← espaço
// posição 5: 世    ← pulou para posição 8 porque "世" usa 3 bytes
// posição 8: 界
```

Note que `i` avança por **bytes**, não por 1. O `range` cuida de tudo — você só precisa usar `r`.

## Strings são imutáveis

Você **não pode alterar** um caractere de uma string existente:

```go
s := "Olá"
s[0] = 'X'  // ❌ erro de compilação!
```

Para "modificar" uma string, você cria uma nova. Se precisa manipular caractere a caractere, converta para `[]rune` (slice de runes), altere, e converta de volta:

```go
r := []rune("Olá")
r[0] = 'X'
fmt.Println(string(r))  // "Xlá"
```

## Dois tipos de string literal

| Tipo | Como escrever | O que faz |
|---|---|---|
| **Interpretado** | `"texto\n"` | Processa escapes: `\n` vira quebra de linha |
| **Raw** | `` `texto\n` `` | Preserva tudo literal: `\n` fica como `\n` |

Raw strings (com crases) são perfeitas para SQL, regex e JSON:

```go
query := `SELECT * FROM users
          WHERE active = true`  // quebra de linha real, sem \n
```

## Concatenação — cuidado com o `+` em loops

Strings são imutáveis, então cada `+` cria uma **cópia nova na memória**. Num loop de 1000 repetições, isso gera 1000 cópias — muito lento.

A solução: **`strings.Builder`**, que acumula texto num buffer e só faz uma cópia no final:

```go
var b strings.Builder
for i := 0; i < 1000; i++ {
    b.WriteString("Go ")
}
resultado := b.String()  // uma única alocação aqui
```

> **Regra prática:** 2-3 concatenações com `+`? Sem problema. Loop? Use `strings.Builder`.

## Pacote `strings` — canivete suíço

Não reinvente a roda — o pacote `strings` tem tudo que você precisa:

| Função | O que faz | Exemplo |
|---|---|---|
| `strings.Contains(s, "Go")` | Contém substring? | `true` |
| `strings.HasPrefix(s, "Ol")` | Começa com? | `true` |
| `strings.HasSuffix(s, "do")` | Termina com? | `true` |
| `strings.ToLower(s)` | Tudo minúsculo | `"olá"` |
| `strings.Split(s, " ")` | Divide por separador | `["Olá", "mundo"]` |
| `strings.Join(slice, ", ")` | Junta com separador | `"a, b, c"` |
| `strings.TrimSpace(s)` | Remove espaços das pontas | `"Olá"` |
| `strings.Fields(s)` | Divide por espaços em branco | `["Olá", "mundo"]` |

## Conversões com `strconv`

Para converter entre números e strings, use o pacote `strconv`:

```go
strconv.Itoa(42)           // int → string: "42"
strconv.Atoi("42")         // string → int: 42, error
strconv.FormatFloat(3.14, 'f', 2, 64)  // float → string: "3.14"
```

> **Lembre-se:** `string(65)` retorna `"A"` (o caractere Unicode 65), **não** `"65"`. Para converter número em texto, sempre use `strconv`.
