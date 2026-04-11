---
title: Structs, Métodos e Composição
description: Structs, struct tags, métodos com receivers, embedding e composição.
estimatedMinutes: 45
recursos:
  - https://go.dev/tour/moretypes/2
  - https://gobyexample.com/structs
  - https://gobyexample.com/struct-embedding
experimentacao:
  desafio: Modele um sistema de veículos com composição - struct base Veiculo, structs Carro e Moto que embeddam Veiculo. Adicione struct tags JSON e serialize/deserialize.
  dicas:
    - "Embedding: Carro struct { Veiculo; Portas int }"
    - "`json:\"nome,omitempty\"` omite se vazio"
    - json.Marshal/Unmarshal para serialização
  codeTemplate: |
    package main

    import (
    	"encoding/json"
    	"fmt"
    )

    type Endereco struct {
    	Rua    string `json:"rua"`
    	Cidade string `json:"cidade"`
    }

    type Pessoa struct {
    	Nome     string   `json:"nome"`
    	Idade    int      `json:"idade"`
    	Endereco
    	Senha    string   `json:"-"`
    }

    func (p Pessoa) Saudacao() string {
    	return fmt.Sprintf("Olá, sou %s de %s!", p.Nome, p.Cidade)
    }

    func main() {
    	p := Pessoa{
    		Nome:     "Gopher",
    		Idade:    15,
    		Endereco: Endereco{Rua: "Av Go", Cidade: "São Paulo"},
    		Senha:    "secreta",
    	}
    	fmt.Println(p.Cidade)
    	fmt.Println(p.Saudacao())
    	data, _ := json.MarshalIndent(p, "", "  ")
    	fmt.Println(string(data))
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **Embedding** — `Pessoa` embeds `Endereco` sem nomeação. Os campos de `Endereco` são **promovidos**: `p.Cidade` ao invés de `p.Endereco.Cidade`. O tipo embedded também é acessível como campo: `p.Endereco`.

    **`json:"-"`** — a tag `json:"-"` exclui o campo `Senha` da serialização JSON. `json:"nome,omitempty"` omite o campo se estiver no zero value. Tags são metadados lidos via `reflect`.

    **`json.MarshalIndent`** — serializa para JSON formatado com indentação. Usa as struct tags para definir os nomes dos campos no JSON. Campos não-exportados (minúscula) são ignorados.

    **Value receiver `Saudacao()`** — opera numa **cópia** da struct. Ideal para métodos de leitura. Use pointer receiver quando o método precisar modificar a struct ou quando ela for grande (>64 bytes).

    **Structs são value types** — atribuição copia todos os campos. Duas structs com os mesmos campos são comparáveis com `==` (se todos os campos forem tipos comparáveis).
socializacao:
  discussao: Composição vs herança - Go escolheu o caminho certo?
  pontos:
    - "Embedding não é herança — não há is-a, é has-a"
    - "Struct tags: metadados sem reflection pesada"
    - "Comparação: classes Java vs structs+embedding Go"
  diasDesafio: Dias 8–18
  sugestaoBlog: "Structs em Go: composição, embedding e struct tags"
  hashtagsExtras: '#golang #structs #composition'
aplicacao:
  projeto: API de dados com structs - modele Produto com categorias usando embedding e serialize para JSON.
  requisitos:
    - Struct tags JSON com omitempty e rename
    - Embedding para campos comuns (timestamps, metadata)
    - Funções de serialização/deserialização
  criterios:
    - Composição correta
    - JSON correto
    - Testes com edge cases
  starterCode: |
    package main

    import (
    	"encoding/json"
    	"fmt"
    	"time"
    )

    type Timestamps struct {
    	CriadoEm    time.Time `json:"criadoEm"`
    	AtualizadoEm time.Time `json:"atualizadoEm,omitempty"`
    }

    type Produto struct {
    	ID    int     `json:"id"`
    	Nome  string  `json:"nome"`
    	Preco float64 `json:"preco"`
    	Ativo bool    `json:"ativo,omitempty"`
    	Timestamps
    	SenhaInterna string `json:"-"`
    }

    func (p Produto) String() string {
    	return fmt.Sprintf("%s (R$ %.2f)", p.Nome, p.Preco)
    }

    func main() {
    	p := Produto{
    		ID:    1,
    		Nome:  "Curso Go",
    		Preco: 99.90,
    		Ativo: true,
    		Timestamps: Timestamps{CriadoEm: time.Now()},
    	}
    	fmt.Println(p)
    	fmt.Println("Criado em:", p.CriadoEm.Format("2006-01-02")) // campo promovido
    	data, _ := json.MarshalIndent(p, "", "  ")
    	fmt.Println(string(data))
    }

---

## O que é uma struct?

Uma **struct** é a forma do Go de agrupar dados relacionados numa coisa só — como uma ficha cadastral. Em vez de ter variáveis soltas para nome, idade e email, você junta tudo num único tipo:

```go
type Pessoa struct {
    Nome  string
    Idade int
    Email string
}
```

Para criar uma `Pessoa`:

```go
p := Pessoa{Nome: "Ana", Idade: 28, Email: "ana@go.dev"}
fmt.Println(p.Nome)  // Ana
```

> **Regra de ouro:** campos que começam com **maiúscula** são públicos (visíveis fora do pacote). Com minúscula, são privados.

## Structs são "value types" — cópia, não referência

Quando você atribui uma struct a outra variável, Go **copia todos os campos**. A cópia é independente do original:

```go
p2 := p          // cópia completa
p2.Nome = "Bob"  // não altera p!
fmt.Println(p.Nome)  // "Ana" — intacta
```

Isso é diferente de slices e maps, que compartilham dados. Se quiser compartilhar uma struct, use um **ponteiro** (`*Pessoa`).

## Métodos — dando comportamento à struct

Você pode criar funções "amarradas" a uma struct. Isso se chama **método**:

```go
func (p Pessoa) Saudacao() string {
    return fmt.Sprintf("Olá, sou %s!", p.Nome)
}

fmt.Println(p.Saudacao())  // Olá, sou Ana!
```

O `(p Pessoa)` antes do nome é o **receiver**. Existem dois tipos:

| Receiver | Sintaxe | Quando usar |
|---|---|---|
| **Value** | `func (p Pessoa)` | Só lê os dados (não modifica) |
| **Pointer** | `func (p *Pessoa)` | Precisa modificar a struct |

```go
func (p *Pessoa) Aniversario() {
    p.Idade++  // modifica a struct original!
}
```

## Struct tags — etiquetas nos campos

Struct tags são **anotações** entre crases que dizem a bibliotecas como tratar cada campo. A mais comum é para JSON:

```go
type User struct {
    Name  string `json:"name"`              // no JSON vira "name"
    Email string `json:"email,omitempty"`   // omite se estiver vazio
    Senha string `json:"-"`                 // nunca aparece no JSON
}
```

| Tag | O que faz |
|---|---|
| `json:"nome"` | Renomeia o campo no JSON |
| `json:"nome,omitempty"` | Renomeia e omite se for zero value |
| `json:"-"` | Exclui o campo completamente |

Na prática, quase toda API em Go usa struct tags para controlar a serialização JSON.

## Embedding — composição sem herança

Go **não tem herança** (nada de `class Carro extends Veiculo`). Em vez disso, usa **embedding**: você coloca um tipo dentro de outro **sem dar nome**, e os campos e métodos dele são "promovidos":

```go
type Endereco struct {
    Rua    string
    Cidade string
}

type Pessoa struct {
    Nome string
    Endereco        // embedding — sem nome!
}

p := Pessoa{Nome: "Ana", Endereco: Endereco{Rua: "Av Go", Cidade: "SP"}}
fmt.Println(p.Cidade)  // acessa direto, sem p.Endereco.Cidade!
```

O que está acontecendo:
- `Pessoa` **não é** um tipo de `Endereco` (não é is-a)
- `Pessoa` **contém** um `Endereco` (é has-a)
- Os campos `Rua` e `Cidade` ficam acessíveis diretamente em `Pessoa`
- Mas `p.Endereco` também funciona se você quiser acessar o tipo embedded inteiro

> **Cuidado:** se você embeddar dois tipos que têm um campo com o **mesmo nome**, o compilador dá erro. Nesse caso, você precisa acessar especificando o tipo: `p.Tipo1.Campo`.

## Por que composição em vez de herança?

Em linguagens como Java/C#, criamos árvores de herança profundas (`Animal → Mamifero → Cachorro → Labrador`). Em Go, você **combina peças menores**:

```go
type Motor struct { Potencia int }
type GPS   struct { Lat, Lon float64 }

type Carro struct {
    Motor   // tem motor
    GPS     // tem GPS
    Portas int
}
```

`Carro` não "é" um `Motor` — `Carro` **tem** um motor e **tem** um GPS. Essa abordagem é mais flexível e evita os problemas clássicos de hierarquias rígidas.

> **Resumo:** struct = ficha de dados, métodos = comportamento, embedding = composição, struct tags = metadados para bibliotecas. Go troca herança por combinação de peças simples.
