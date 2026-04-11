---
title: Packages, Módulos e Dependências
description: Organização em packages, go mod, exportação por maiúscula, internal/ e dependências.
estimatedMinutes: 40
recursos:
  - https://go.dev/ref/mod
  - https://go.dev/doc/modules/layout
experimentacao:
  desafio: Crie um projeto com 3 packages - cmd/main, internal/service e pkg/utils. Exporte e importe funções. Depois adicione uma dependência externa com go get.
  dicas:
    - Cada pasta = um package, mesmo nome do diretório
    - Apenas nomes com letra maiúscula são exportados
    - Use go mod init para inicializar
    - internal/ impede acesso de fora do módulo
  codeTemplate: |
    package main

    import (
    	"fmt"
    	"strings"
    )

    // Saudar é exportada — começa com maiúscula, visível a outros packages
    func Saudar(nome string) string {
    	return "Olá, " + nome + "!"
    }

    // normalizar não é exportada — começa com minúscula, privada ao package
    func normalizar(s string) string {
    	return strings.TrimSpace(strings.ToLower(s))
    }

    func main() {
    	fmt.Println(Saudar("Gopher"))
    	fmt.Println(normalizar("  Go Lang  "))
    	palavras := strings.Fields("  foo   bar  baz  ")
    	fmt.Println(palavras, len(palavras))
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`strings.Fields`** — do pacote `strings` da biblioteca padrão. Divide uma string por whitespace e retorna `[]string`. Importamos o pacote e usamos na forma `strings.NomeDaFunção`.

    **`Saudar` vs `normalizar`** — `Saudar` começa com maiúscula: **exportada**, visível a outros packages. `normalizar` começa com minúscula: **não-exportada**, privada ao package. Não existe `public`/`private` em Go — a capitalização faz essa distinção.

    **`import "strings"`** — Go não permite imports não usados. Se você importar e não usar nenhuma função do pacote, **não compila**. Isso elimina código morto e dependências desnecessárias.

    **Organização real de projetos**:
    - `cmd/` — pontos de entrada (`package main`)
    - `internal/` — código privado ao módulo (outros módulos externos não podem importar)
    - `pkg/` — bibliotecas reutilizáveis exportadas

    **`go mod init github.com/user/repo`** — cria o `go.mod`, que define o module path e lista dependências. `go mod tidy` sincroniza o `go.sum` adicionando o que falta e removendo o que não é usado.
socializacao:
  discussao: Como a convenção de exportação por maiúscula afeta o design de APIs em Go?
  pontos:
    - "Simplicidade: sem public/private/protected keywords"
    - Encapsulamento visual — visivelmente claro
    - internal/ para código que não é API pública
  diasDesafio: Dias 8–18
  sugestaoBlog: "Packages e módulos em Go: organizando projetos profissionais"
  hashtagsExtras: '#golang #modules #packages'
aplicacao:
  projeto: Crie um projeto Go com cmd/, internal/, pkg/ e publique como módulo em um repositório.
  requisitos:
    - Estrutura cmd/ + internal/ + pkg/
    - go.mod e go.sum configurados
    - README com instruções de uso e importação
  criterios:
    - Estrutura correta
    - Imports funcionais
    - Compilação sem erros
  starterCode: |
    package main

    import (
    	"fmt"
    	"strings"
    )

    // Exportado: disponível para outros packages
    func ValidarEmail(email string) bool {
    	return strings.Contains(email, "@") && strings.Contains(email, ".")
    }

    // Não-exportado: privado ao package
    func normalizar(s string) string {
    	return strings.TrimSpace(strings.ToLower(s))
    }

    func main() {
    	emails := []string{
    		"  USUARIO@EXEMPLO.COM  ",
    		"invalido-sem-arroba",
    		"outro@teste.org",
    	}
    	for _, e := range emails {
    		norm := normalizar(e)
    		valido := ValidarEmail(norm)
    		fmt.Printf("%-28s → válido: %v\n", norm, valido)
    	}
    }

---

## O que é um package?

Um **package** é simplesmente uma pasta com arquivos `.go`. Todos os arquivos da mesma pasta pertencem ao mesmo package. É a forma do Go de organizar código em peças separadas — como gavetas de um armário.

```
meu-projeto/
├── main.go          ← package main (programa começa aqui)
├── utils/
│   └── texto.go     ← package utils
└── models/
    └── usuario.go   ← package models
```

Para usar algo de outro package, você **importa** ele:

```go
import "meu-projeto/utils"

fmt.Println(utils.Formatar("olá"))
```

## A regra mais importante: maiúscula = público

Go não tem `public`, `private` ou `protected`. A visibilidade é decidida pela **primeira letra** do nome:

| Primeira letra | Visibilidade | Exemplo |
|---|---|---|
| **Maiúscula** | Exportado — qualquer package pode usar | `Saudar()`, `Nome` |
| **minúscula** | Privado — só dentro do próprio package | `normalizar()`, `idade` |

```go
func Saudar(nome string) string {  // ✅ outros packages conseguem chamar
    return "Olá, " + nome
}

func normalizar(s string) string { // 🔒 só o próprio package usa
    return strings.ToLower(s)
}
```

> **Dica:** se você tenta usar `utils.normalizar()` de fora, o compilador dá erro. Simples assim.

## O que é um módulo?

Um **módulo** é o "projeto inteiro" — pode conter vários packages. Ele é definido pelo arquivo `go.mod` na raiz:

```bash
go mod init github.com/seu-usuario/meu-projeto
```

Isso cria o `go.mod`, que:
- Dá um **nome** ao seu módulo (o caminho de importação)
- Lista as **dependências externas** (bibliotecas de terceiros)
- Define a **versão do Go** usada

## Três comandos que você vai usar sempre

```bash
# 1. Criar um módulo novo
go mod init github.com/user/repo

# 2. Limpar dependências (adiciona faltantes, remove não usadas)
go mod tidy

# 3. Adicionar uma biblioteca externa
go get github.com/alguma/lib@v1.2.3
```

> **Regra do Go:** se você importar um package e **não usar nenhuma função dele**, o código **não compila**. Da mesma forma, variáveis declaradas e não usadas dão erro. Go não tolera lixo.

## `internal/` — a pasta "só minha"

Se você colocar código dentro de uma pasta chamada `internal/`, apenas o **seu próprio módulo** pode importar esse package. Outros projetos que dependem do seu módulo são bloqueados pelo compilador:

```
meu-projeto/
├── internal/
│   └── db/          ← 🔒 SÓ meu-projeto pode importar isso
│       └── conn.go
├── pkg/
│   └── utils/       ← ✅ qualquer um pode importar
│       └── texto.go
└── cmd/
    └── server/      ← ponto de entrada (package main)
        └── main.go
```

Isso é ótimo para esconder detalhes internos que podem mudar sem aviso.

## Imports circulares — proibidos

Se o package `A` importa o package `B`, o package `B` **não pode importar** `A`. O compilador recusa. Isso obriga você a pensar na organização e evita dependências espagete.

Se dois packages precisam se comunicar, a solução é criar um **terceiro package** ou usar **interfaces**.

## Estrutura típica de um projeto Go

```
meu-projeto/
├── go.mod              ← define o módulo e dependências
├── go.sum              ← checksums das dependências (gerado automaticamente)
├── cmd/
│   └── server/
│       └── main.go     ← ponto de entrada: package main, func main()
├── internal/
│   ├── service/        ← lógica de negócio (privada)
│   └── repository/     ← acesso a dados (privado)
└── pkg/
    └── utils/          ← utilitários reutilizáveis (público)
```

- **`cmd/`** — onde ficam os `main.go` (pode ter vários programas)
- **`internal/`** — código que só o seu projeto usa
- **`pkg/`** — código que outros projetos podem importar (opcional)

> **Pra quem vem de outras linguagens:** package em Go ≈ módulo em Python, namespace em C#. A diferença é que Go **obriga** organização por pastas e proíbe imports cíclicos — sem atalhos.
