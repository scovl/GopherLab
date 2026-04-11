---
title: HTTP Client e JSON
description: Chamadas HTTP, encoding/json, struct tags e APIs externas.
estimatedMinutes: 45
recursos:
  - https://gobyexample.com/http-clients
  - https://gobyexample.com/json
  - https://pkg.go.dev/encoding/json
experimentacao:
  desafio: "Consuma a API ViaCEP (viacep.com.br/ws/{cep}/json/) — busque endereço por CEP informado pelo usuário e exiba formatado."
  dicas:
    - "ViaCEP: https://viacep.com.br/ws/01001000/json/"
    - Struct tags mapeiam campos JSON para Go
    - Verifique resp.StatusCode antes de decodificar
  codeTemplate: |
    package main

    import (
    	"encoding/json"
    	"fmt"
    	"net/http"
    )

    type Post struct {
    	ID    int    `json:"id"`
    	Title string `json:"title"`
    	Body  string `json:"body,omitempty"`
    }

    func main() {
    	resp, err := http.Get("https://jsonplaceholder.typicode.com/posts/1")
    	if err != nil {
    		fmt.Println("Erro:", err)
    		return
    	}
    	defer resp.Body.Close()
    	var post Post
    	if err := json.NewDecoder(resp.Body).Decode(&post); err != nil {
    		fmt.Println("Erro JSON:", err)
    		return
    	}
    	fmt.Printf("Título: %s\n", post.Title)
    	data, _ := json.MarshalIndent(post, "", "  ")
    	fmt.Println(string(data))
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`http.Get(url)`** — atalho para `http.DefaultClient.Get(url)`. O `DefaultClient` tem **timeout zero** (espera indefinidamente). Em produção, sempre crie `&http.Client{Timeout: 30 * time.Second}`.

    **`defer resp.Body.Close()`** — `resp.Body` é um `io.ReadCloser`. **Deve ser fechado** para devolver a conexão TCP ao pool do cliente HTTP. Sem o `Close`, conexões vazam e o programa eventualmente falha com "too many open files".

    **`json.NewDecoder(resp.Body).Decode(&post)`** — decodifica JSON **diretamente do stream** sem carregar o body inteiro na memória. Alternativa: `io.ReadAll(resp.Body)` + `json.Unmarshal(data, &post)` — mais simples, mas carrega tudo na memória.

    **Struct tags `json:"title"`** — mapeiam campos Go (PascalCase) para chaves JSON (camelCase/snake_case). `omitempty` omite o campo se estiver no zero value. `json:"-"` exclui o campo. Campos não-exportados (minúscula) são **ignorados** pelo encoder/decoder JSON.

    **Status HTTP vs `err`** — `http.Get` retorna `err != nil` apenas para erros de **rede/DNS**. Um 404 ou 500 retorna `err == nil` com `resp.StatusCode == 404`. Sempre verifique o status antes de decodificar.
socializacao:
  discussao: Como Go trata erros HTTP comparado com try-catch de outras linguagens?
  pontos:
    - err != nil vs exceptions — erro explícito
    - "StatusCode vs error — são coisas diferentes em Go"
    - Context para timeout em requests HTTP
  diasDesafio: Dias 19–28
  sugestaoBlog: "HTTP e JSON em Go: consumindo APIs sem exceções"
  hashtagsExtras: '#golang #http #json #api'
aplicacao:
  projeto: "Busca CEP: programa CLI que busca endereço por CEP via ViaCEP."
  requisitos:
    - Consumir API ViaCEP
    - Exibir resultado formatado
    - Tratar CEP inválido e erros de rede
  criterios:
    - Tratamento de erros HTTP
    - JSON parseado corretamente
    - Código idiomático
  starterCode: |
    package main

    import (
    	"encoding/json"
    	"fmt"
    	"net/http"
    	"time"
    )

    type Endereco struct {
    	CEP         string `json:"cep"`
    	Logradouro  string `json:"logradouro"`
    	Bairro      string `json:"bairro"`
    	Localidade  string `json:"localidade"`
    	UF          string `json:"uf"`
    }

    func buscarCEP(cep string) (*Endereco, error) {
    	client := &http.Client{Timeout: 5 * time.Second}
    	url := fmt.Sprintf("https://viacep.com.br/ws/%s/json/", cep)
    	resp, err := client.Get(url)
    	if err != nil {
    		return nil, fmt.Errorf("erro de rede: %w", err)
    	}
    	defer resp.Body.Close()
    	if resp.StatusCode != http.StatusOK {
    		return nil, fmt.Errorf("status: %d", resp.StatusCode)
    	}
    	var end Endereco
    	if err := json.NewDecoder(resp.Body).Decode(&end); err != nil {
    		return nil, fmt.Errorf("erro JSON: %w", err)
    	}
    	return &end, nil
    }

    func main() {
    	ceps := []string{"01001000", "20040020", "00000000"}
    	for _, cep := range ceps {
    		end, err := buscarCEP(cep)
    		if err != nil {
    			fmt.Printf("CEP %s: ERRO — %v\n", cep, err)
    			continue
    		}
    		data, _ := json.MarshalIndent(end, "", "  ")
    		fmt.Println(string(data))
    	}
    }

---

## Fazendo uma requisição HTTP — passo a passo

Vamos buscar dados de uma API. O fluxo básico em Go é:

1. Fazer a requisição
2. Verificar se deu erro de rede
3. **Fechar o body** (sempre!)
4. Verificar o status HTTP
5. Decodificar o JSON

```go
resp, err := http.Get("https://jsonplaceholder.typicode.com/posts/1")
if err != nil {
    fmt.Println("Erro de rede:", err)  // DNS falhou, servidor offline, etc.
    return
}
defer resp.Body.Close()  // SEMPRE fechar — libera a conexão

if resp.StatusCode != 200 {
    fmt.Println("Status inesperado:", resp.StatusCode)
    return
}

var post Post
json.NewDecoder(resp.Body).Decode(&post)
fmt.Println(post.Title)
```

### Por que `defer resp.Body.Close()` é obrigatório?

O corpo da resposta (`resp.Body`) é uma **conexão aberta** com o servidor. Se você não fechar, a conexão fica presa e não volta para o pool. Depois de muitas requests sem fechar, o programa trava com "too many open files".

> **Regra:** abriu `resp.Body`? Na linha seguinte, escreva `defer resp.Body.Close()`.

### A armadilha do status HTTP

Essa é uma confusão comum para iniciantes:

```go
resp, err := http.Get("https://api.exemplo.com/nao-existe")
// err é nil! ✅ A request HTTP funcionou...
// resp.StatusCode é 404 ❌ ...mas o recurso não existe
```

`err` só é diferente de `nil` quando a **requisição falha** (DNS, timeout, sem internet). Um 404 ou 500 é uma **resposta válida** — o servidor respondeu, só que com "não encontrei" ou "deu ruim".

| Situação | `err` | `resp.StatusCode` |
|---|---|---|
| Servidor offline / sem internet | `!= nil` | — (sem resp) |
| URL não encontrada (404) | `nil` | 404 |
| Erro interno do servidor (500) | `nil` | 500 |
| Tudo certo | `nil` | 200 |

**Sempre verifique os dois:** primeiro `err`, depois `resp.StatusCode`.

## Configurando o cliente HTTP — NUNCA use o padrão em produção

`http.Get()` usa o `http.DefaultClient`, que tem **timeout zero** — ele espera a resposta **para sempre**. Se o servidor travar, seu programa trava junto.

```go
// ❌ Em produção, NÃO faça isso
resp, err := http.Get(url)  // espera indefinidamente

// ✅ Crie um cliente com timeout
client := &http.Client{Timeout: 10 * time.Second}
resp, err := client.Get(url)  // desiste depois de 10s
```

Para controle total (headers customizados, método PUT/PATCH/DELETE, body, context):

```go
req, err := http.NewRequestWithContext(ctx, "POST", url, body)
req.Header.Set("Authorization", "Bearer meu-token")
req.Header.Set("Content-Type", "application/json")
resp, err := client.Do(req)
```

---

## JSON em Go — struct tags fazem a mágica

Go converte JSON para structs (e vice-versa) usando **struct tags**. São anotações entre crases que dizem ao encoder/decoder como mapear os campos:

```go
type User struct {
    Name  string `json:"name"`              // campo "name" no JSON
    Age   int    `json:"age,omitempty"`     // "age" no JSON; omite se for 0
    Email string `json:"email"`
    Senha string `json:"-"`                 // NUNCA aparece no JSON
}
```

### Tabela de struct tags JSON

| Tag | O que faz | Exemplo no JSON |
|---|---|---|
| `json:"name"` | Renomeia o campo | `{"name": "Ana"}` |
| `json:"age,omitempty"` | Omite se for zero value (0, "", false, nil) | Campo não aparece se age=0 |
| `json:"-"` | Exclui completamente | Nunca sai no JSON |
| *(sem tag)* | Usa o nome Go com maiúscula | `{"Name": "Ana"}` |

> **Campos com letra minúscula** (não exportados) são **invisíveis** para o JSON — nem `json.Marshal` nem `json.Unmarshal` os enxergam.

### JSON → struct (decodificar)

Duas formas:

```go
// Forma 1: do stream (melhor para HTTP — não carrega tudo na memória)
json.NewDecoder(resp.Body).Decode(&user)

// Forma 2: de um []byte (quando você já tem os dados em memória)
json.Unmarshal(data, &user)
```

### struct → JSON (codificar)

```go
// Compacto
data, err := json.Marshal(user)
// {"name":"Ana","age":28,"email":"ana@go.dev"}

// Formatado (bonito para debug)
data, err := json.MarshalIndent(user, "", "  ")
// {
//   "name": "Ana",
//   "age": 28,
//   "email": "ana@go.dev"
// }
```

### JSON dinâmico — quando você não sabe a estrutura

Às vezes o JSON tem campos que mudam. Para esses casos:

| Tipo | Quando usar |
|---|---|
| `map[string]any` | JSON completamente desconhecido |
| `json.RawMessage` | Um trecho do JSON que você quer decodificar depois |
| `json.Number` | Números muito grandes que perdem precisão com `float64` |

```go
// JSON desconhecido → map
var dados map[string]any
json.Unmarshal(data, &dados)
fmt.Println(dados["name"])  // "Ana" (é any, precisa cast)
```

> **Dica prática:** sempre que possível, use structs com tags. `map[string]any` funciona, mas perde type safety — você descobre erros só em runtime, não na compilação.
