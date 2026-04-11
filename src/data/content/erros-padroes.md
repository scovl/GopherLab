---
title: Padrões de Erro em Go
description: error interface, errors.New, fmt.Errorf, wrapping com %w, errors.Is e errors.As.
estimatedMinutes: 40
recursos:
  - https://go.dev/blog/error-handling-and-go
  - https://go.dev/blog/go1.13-errors
  - https://gobyexample.com/errors
experimentacao:
  desafio: "Crie 3 tipos de erro: sentinela, customizado com campos e wrapped. Teste errors.Is e errors.As em cada caso."
  dicas:
    - "Sentinela: var ErrNotFound = errors.New(...)"
    - "Wrapping: fmt.Errorf(\"contexto: %w\", err)"
    - "errors.As: extrai struct de erro customizado"
  codeTemplate: |
    package main

    import (
    	"errors"
    	"fmt"
    )

    // Erro sentinela — comparável com errors.Is
    var ErrNotFound = errors.New("não encontrado")

    // Erro customizado com campos de contexto
    type ValidationError struct {
    	Field   string
    	Message string
    }

    func (e *ValidationError) Error() string {
    	return fmt.Sprintf("validação: campo %s: %s", e.Field, e.Message)
    }

    // Wrapping — preserva causa raiz com %w
    func buscar(id int) error {
    	if id <= 0 {
    		return &ValidationError{Field: "id", Message: "deve ser positivo"}
    	}
    	return fmt.Errorf("buscar usuário %d: %w", id, ErrNotFound)
    }

    func processar(id int) error {
    	if err := buscar(id); err != nil {
    		return fmt.Errorf("processar: %w", err)
    	}
    	return nil
    }

    func main() {
    	err := processar(42)

    	// errors.Is percorre a cadeia de wrapping
    	if errors.Is(err, ErrNotFound) {
    		fmt.Println("✓ errors.Is encontrou ErrNotFound na cadeia")
    	}

    	err2 := processar(0)

    	// errors.As extrai o tipo concreto da cadeia
    	var ve *ValidationError
    	if errors.As(err2, &ve) {
    		fmt.Printf("✓ errors.As extraiu: campo=%s msg=%s\n", ve.Field, ve.Message)
    	}

    	// Go 1.20: multi-wrapping
    	multi := fmt.Errorf("ops: %w e %w", ErrNotFound, err2)
    	fmt.Println("multi-wrap Is ErrNotFound:", errors.Is(multi, ErrNotFound))
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`errors.New` retorna um ponteiro** — cada chamada cria um ponteiro distinto. `errors.New("x") == errors.New("x")` é `false`. Por isso, erros sentinela são variáveis: `var ErrNotFound = errors.New(...)` — comparação por identidade, não por texto.

    **`fmt.Errorf("contexto: %w", err)`** — o verbo `%w` cria um erro wrapped que encapsula o original. Usar `%v` em vez de `%w` **descarta a cadeia** — `errors.Is/As` não conseguem encontrar o erro original. Sempre use `%w` quando quiser preservar a causa raiz.

    **`errors.Is(err, target)`** — percorre a cadeia `Unwrap()` recursivamente até encontrar `err == target`. Funciona com sentinelas e com qualquer erro que implemente `Is(target error) bool`.

    **`errors.As(err, &target)`** — percorre a cadeia até encontrar um erro atribuível ao tipo `target`. O ponteiro `target` é preenchido com o valor encontrado. Útil para extrair campos de contexto de erros customizados.

    **`*ValidationError` (ponteiro como receiver)** — o tipo que implementa `error` é `*ValidationError`, não `ValidationError`. Por isso, `errors.As` recebe `&ve` onde `ve` é `*ValidationError` — dois níveis de indireção.

    **Go 1.20 multi-wrapping** — `fmt.Errorf("%w e %w", err1, err2)` cria um erro que aponta para ambos. `errors.Is/As` percorrem a **árvore completa**. Útil em validações paralelas.
socializacao:
  discussao: "Erros como valores vs exceções: qual abordagem preferem para projetos grandes?"
  pontos:
    - Erros explícitos forçam tratamento imediato
    - Exceptions podem ser esquecidas ou swallowed
    - "Go: happy path à esquerda, error handling à direita"
  diasDesafio: Dias 39–44
  sugestaoBlog: "Error handling em Go: wrapping, errors.Is, errors.As e boas práticas"
  hashtagsExtras: '#golang #errors #bestpractices'
aplicacao:
  projeto: Parser de configuração que retorna erros ricos - sentinela para tipo de falha, customizado para contexto, wrapping para causa raiz.
  requisitos:
    - Erros sentinela para tipos de falha
    - Erros customizados com campos de contexto
    - Testes cobrindo todos os caminhos de erro
  criterios:
    - errors.Is/As funcionando
    - Mensagens claras
    - Cobertura > 90%
  starterCode: |
    package main

    import (
    	"errors"
    	"fmt"
    	"strconv"
    	"strings"
    )

    // Erros sentinela
    var (
    	ErrCampoObrigatorio = errors.New("campo obrigatório")
    	ErrFormatoInvalido  = errors.New("formato inválido")
    )

    // Erro customizado
    type ConfigError struct {
    	Linha    int
    	Chave    string
    	Original error
    }

    func (e *ConfigError) Error() string {
    	return fmt.Sprintf("linha %d: chave %q: %v", e.Linha, e.Chave, e.Original)
    }

    func (e *ConfigError) Unwrap() error {
    	return e.Original
    }

    // TODO: implemente parsearLinha(num int, linha string) error
    //   Formato esperado: "chave=valor"
    //   - Retorne ErrCampoObrigatorio se chave ou valor vazio
    //   - Retorne ErrFormatoInvalido se não contém "="
    //   - Retorne &ConfigError wrapping o erro original

    // TODO: implemente parsearConfig(texto string) error
    //   - Processe todas as linhas, colete erros com errors.Join
    //   - Retorne nil se nenhum erro

    func main() {
    	config := `host=localhost
    port=8080
    =sem_chave
    formato_errado
    timeout=`

    	lines := strings.Split(config, "\n")
    	for i, l := range lines {
    		_ = strconv.Itoa(i)
    		_ = l
    	}
    	fmt.Println("Implemente parsearConfig e teste com errors.Is/As")
    }

---

Em Go, **erros são valores** — qualquer tipo que implemente a interface `error` (método `Error() string`). Essa escolha de design força o tratamento explícito: o compilador não deixa ignorar um valor de retorno. O padrão idiomático é retornar `(T, error)` e verificar `if err != nil` imediatamente.

## Criando e comparando erros

- `errors.New("mensagem")` — cria um valor de erro simples; cada chamada cria um **ponteiro distinto** (mesmo texto ≠ mesma referência)
- **Erros sentinela**: `var ErrNotFound = errors.New("not found")` — variáveis exportadas comparáveis com `errors.Is()`
- `fmt.Errorf("contexto: %w", err)` — cria um erro **wrapped** que encapsula o original e adiciona contexto

## Wrapping e cadeia de erros

```go
errors.Is(err, target)   // percorre a cadeia até encontrar erro igual a target
errors.As(err, &target)  // percorre a cadeia até encontrar tipo atribuível a target
```

Para participar da cadeia de wrapping, seu tipo de erro deve implementar `Unwrap() error`.

## Go 1.20: multi-wrapping

```go
fmt.Errorf("%w ... %w", err1, err2)  // cria erro que aponta para ambos
```

`errors.Is`/`errors.As` percorrem a **árvore completa** de erros.

> **Regra geral:** nunca perca um erro; adicione contexto mas preserve a causa raiz com wrapping.
