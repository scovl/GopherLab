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

## Como outras linguagens lidam com erros

Em Java, Python e JavaScript, erros funcionam com **exceções** — o código "explode" e alguém lá em cima precisa pegar com `try/catch`:

```python
# Python — o erro "voa" até alguém pegar
try:
    resultado = dividir(10, 0)
except ZeroDivisionError:
    print("ops")
```

O problema? Se você **esquecer** o `try/catch`, o programa **crasha**. E é fácil esquecer, porque nada te obriga a tratar.

## Go fez diferente — erros são valores normais

Em Go, um erro é só um **valor de retorno**. Funções que podem falhar retornam **dois valores**: o resultado e o erro.

```go
arquivo, err := os.Open("dados.txt")
if err != nil {
    fmt.Println("não consegui abrir:", err)
    return
}
// se chegou aqui, arquivo está ok
```

> **Analogia:** em outras linguagens, erros são como uma **bomba** que pode explodir a qualquer momento. Em Go, erros são como um **bilhete** que a função te entrega: "deu ruim, aqui está o motivo". Você **decide** o que fazer.

### Por que isso é bom?

| Aspecto | Exceções (Java/Python) | Erros como valores (Go) |
|---|---|---|
| Obrigatório tratar? | Não (pode esquecer o try/catch) | **Sim** (o `err` está ali na sua cara) |
| Onde o erro é tratado? | Em qualquer lugar da stack | **Imediatamente**, na próxima linha |
| Fácil de ler? | Precisa procurar o catch | **Visível** no fluxo normal |
| Pode ignorar? | Sim (e crashar depois) | Sim, mas fica óbvio que ignorou |

---

## A interface `error` — simples assim

Qualquer tipo em Go é um "erro" se tiver **um método**:

```go
type error interface {
    Error() string
}
```

Só isso. Um método. Retorna uma string com a mensagem.

> **Traduzindo:** se o tipo sabe "se descrever como texto de erro", ele **é** um erro.

---

## 3 formas de criar erros — do simples ao avançado

### Forma 1: `errors.New` — erro simples com mensagem fixa

```go
import "errors"

err := errors.New("arquivo não encontrado")
fmt.Println(err)  // arquivo não encontrado
```

Quando usar: mensagens simples sem variáveis dinâmicas.

### Forma 2: `fmt.Errorf` — erro com valores dinâmicos

```go
nome := "dados.txt"
err := fmt.Errorf("arquivo %s não encontrado", nome)
fmt.Println(err)  // arquivo dados.txt não encontrado
```

Quando usar: quando a mensagem precisa de valores (nome de arquivo, ID, etc.).

### Forma 3: Tipo customizado — erro com dados extras

```go
type ValidationError struct {
    Campo    string
    Mensagem string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("campo %s: %s", e.Campo, e.Mensagem)
}

// Usando:
err := &ValidationError{Campo: "email", Mensagem: "formato inválido"}
fmt.Println(err)  // campo email: formato inválido
```

Quando usar: quando quem recebe o erro precisa de **informações extras** (qual campo falhou, código HTTP, etc.).

---

## Erros sentinela — erros "conhecidos"

Um **erro sentinela** é uma variável global que representa um erro específico:

```go
var ErrNotFound = errors.New("não encontrado")
var ErrPermissao = errors.New("sem permissão")
```

> **Analogia:** erros sentinela são como **placas de trânsito** — cada placa tem um significado fixo que todo mundo entende. `ErrNotFound` sempre significa "não achei".

### Por que não comparar com `==`?

```go
// ❌ Parece que funciona, mas é uma armadilha
if err.Error() == "não encontrado" {
    // E se alguém mudar o texto? Quebra!
}

// ✅ Compare pelo valor, não pelo texto
if err == ErrNotFound {
    // Funciona enquanto for o erro simples
}
```

Mas tem um problema maior. Continue lendo...

---

## Wrapping — adicionando contexto sem perder a causa

Imagine que `buscarUsuario` retorna `ErrNotFound`. Mas quem chamou quer saber **onde** o erro aconteceu:

```go
func buscarUsuario(id int) error {
    // Algo deu errado...
    return ErrNotFound
}

func processarPedido(id int) error {
    err := buscarUsuario(id)
    if err != nil {
        // Adiciona contexto: "processar pedido 42: não encontrado"
        return fmt.Errorf("processar pedido %d: %w", id, err)
        //                                      ^^
        //                          %w = "embrulha" o erro original
    }
    return nil
}
```

### O que `%w` faz?

| Verbo | O que faz | Resultado |
|---|---|---|
| `%v` | Converte para texto | **Perde** o erro original (só texto) |
| `%w` | **Embrulha** o erro | **Preserva** o erro original dentro |

> **Analogia:** `%w` é como colocar uma carta dentro de um **envelope**. O envelope tem uma mensagem nova ("processar pedido 42"), mas a carta original (`ErrNotFound`) continua lá dentro. `%v` é como **copiar** o texto da carta num papel novo — o original é perdido.

### A cadeia de wrapping

Cada `%w` cria uma **camada**:

```
processarPedido → "processar pedido 42: não encontrado"
    └── ErrNotFound → "não encontrado"
```

Se tiver mais camadas:

```
handler → "handler: processar pedido 42: não encontrado"
    └── processarPedido → "processar pedido 42: não encontrado"
        └── ErrNotFound → "não encontrado"
```

É como uma **boneca russa** (matrioshka) — cada camada embrulha a anterior.

---

## `errors.Is` — procurando um erro na cadeia

Agora que erros estão embrulhados, `==` não funciona mais:

```go
err := processarPedido(42)

// ❌ NÃO funciona! err é "processar pedido 42: não encontrado", não ErrNotFound
if err == ErrNotFound {
    // Nunca entra aqui!
}

// ✅ Funciona! Abre todas as "bonecas russas" procurando ErrNotFound
if errors.Is(err, ErrNotFound) {
    fmt.Println("usuário não foi encontrado")
}
```

### Como `errors.Is` funciona internamente?

```
1. Compara err com ErrNotFound → "processar pedido 42:..." ≠ ErrNotFound
2. Desembrulha (Unwrap) → pega o erro de dentro
3. Compara de novo → ErrNotFound == ErrNotFound → ✅ ACHEI!
```

> **Regra de ouro:** SEMPRE use `errors.Is()` em vez de `==` para comparar erros. Funciona com erros simples E embrulhados.

---

## `errors.As` — extraindo dados de um erro customizado

`errors.Is` responde: "esse erro **é** ErrNotFound?" (sim/não)

`errors.As` responde: "esse erro **contém** um `*ValidationError`? Se sim, me dá ele!"

```go
err := processarFormulario()

var ve *ValidationError
if errors.As(err, &ve) {
    // Conseguiu! ve agora tem os dados
    fmt.Printf("Erro no campo: %s\n", ve.Campo)
    fmt.Printf("Mensagem: %s\n", ve.Mensagem)
}
```

### Passo a passo do `errors.As`:

```
1. Olha err → é *ValidationError? Se sim, preenche ve e retorna true
2. Se não, desembrulha (Unwrap) e tenta de novo
3. Repete até achar ou acabar a cadeia
```

### Detalhe importante: os dois `*` (ponteiros)

```go
var ve *ValidationError       // ve é um ponteiro para ValidationError
if errors.As(err, &ve) {      // &ve é ponteiro para ponteiro
//                  ^^
//     errors.As precisa de &ponteiro (dois níveis)
```

Por quê? Porque `errors.As` precisa **preencher** a variável `ve`. Para preencher algo de fora da função, precisa do endereço — por isso `&ve`.

---

## `errors.Is` vs `errors.As` — quando usar cada um

| Pergunta que quero responder | Use | Exemplo |
|---|---|---|
| "É o erro X específico?" | `errors.Is` | `errors.Is(err, ErrNotFound)` |
| "É um erro do **tipo** Y?" | `errors.As` | `errors.As(err, &ve)` |

```go
// errors.Is → "é essa placa de trânsito?"
if errors.Is(err, ErrNotFound) { ... }

// errors.As → "é algum tipo de erro de validação? me dá os detalhes"
var ve *ValidationError
if errors.As(err, &ve) { ... }
```

---

## Go 1.20+: Embrulhando DOIS erros ao mesmo tempo

Às vezes uma operação falha por **dois motivos** ao mesmo tempo:

```go
err1 := validarEmail(email)
err2 := validarSenha(senha)

// Embrulha os dois juntos
if err1 != nil && err2 != nil {
    return fmt.Errorf("validação falhou: %w e %w", err1, err2)
}
```

Agora `errors.Is` e `errors.As` procuram nos **dois ramos**:

```
erroMulti
├── err1 (ErrEmailInvalido)
└── err2 (ErrSenhaFraca)

errors.Is(erroMulti, ErrEmailInvalido) → true ✅
errors.Is(erroMulti, ErrSenhaFraca)    → true ✅
```

---

## Para seu erro customizado participar da cadeia

Se você criou um tipo de erro que **embrulha** outro, implemente `Unwrap`:

```go
type ConfigError struct {
    Linha    int
    Chave    string
    Original error   // o erro embrulhado
}

func (e *ConfigError) Error() string {
    return fmt.Sprintf("linha %d, chave %q: %v", e.Linha, e.Chave, e.Original)
}

func (e *ConfigError) Unwrap() error {
    return e.Original  // "abre" a boneca russa
}
```

Sem `Unwrap`, `errors.Is` e `errors.As` **não conseguem** olhar dentro do seu erro.

---

## Os 3 erros mais comuns de iniciantes

### 1. Usar `%v` em vez de `%w`

```go
// ❌ Perde o erro original — errors.Is não funciona
return fmt.Errorf("falhou: %v", err)

// ✅ Preserva o erro original
return fmt.Errorf("falhou: %w", err)
```

### 2. Ignorar o erro com `_`

```go
// ❌ Se der erro, arquivo é nil → panic na próxima linha
arquivo, _ := os.Open("config.txt")

// ✅ Sempre trate
arquivo, err := os.Open("config.txt")
if err != nil {
    return err
}
```

### 3. Comparar com `==` em vez de `errors.Is`

```go
// ❌ Só funciona se err NÃO estiver embrulhado
if err == ErrNotFound { ... }

// ✅ Funciona sempre
if errors.Is(err, ErrNotFound) { ... }
```

---

## Resumo — o sistema de erros do Go

```
errors.New("msg")          → cria erro simples
fmt.Errorf("ctx: %w", err) → embrulha erro com contexto
errors.Is(err, alvo)       → "é esse erro?" (percorre a cadeia)
errors.As(err, &ptr)       → "é esse tipo? me dá os dados" (percorre a cadeia)
```

| Preciso de... | Use |
|---|---|
| Erro simples com mensagem fixa | `errors.New("msg")` |
| Erro com valores dinâmicos | `fmt.Errorf("arquivo %s: ...", nome)` |
| Embrulhar preservando a causa | `fmt.Errorf("contexto: %w", err)` |
| Erro com dados extras (campo, código) | Tipo customizado com `Error() string` |
| Verificar se é um erro específico | `errors.Is(err, ErrXxx)` |
| Extrair dados de um tipo de erro | `errors.As(err, &ptr)` |
| Embrulhar dois erros | `fmt.Errorf("%w e %w", err1, err2)` |
