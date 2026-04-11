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

Packages organizam código — cada diretório é um package; minúscula é privado ao package. Módulos (`go.mod`) gerenciam dependências com semantic versioning.

## Comandos essenciais

```bash
go mod init github.com/user/repo  # cria módulo
go mod tidy                       # remove deps não usadas, adiciona faltantes
go get github.com/pkg@v1.2.3      # adiciona/atualiza dependência
```

## Visibilidade

- `internal/` cria packages visíveis **apenas ao módulo pai** — útil para código que não deve ser importado por outros módulos
- Go **proíbe imports circulares** — o compilador recusa dois packages que se importam mutuamente

## Organização típica

```
cmd/          # pontos de entrada (main packages)
internal/     # código privado ao módulo
pkg/          # código reutilizável (opcional)
```

Cada diretório tem um único package name (exceto arquivos `_test.go` que podem usar `package foo_test`).
