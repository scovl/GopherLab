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

`net/http` tem um cliente HTTP completo e configurável. `http.DefaultClient` tem **timeout zero (nunca expira!)** — em produção, sempre use um cliente customizado:

```go
client := &http.Client{Timeout: 30 * time.Second}
```

`http.Get`/`http.Post` são atalhos para o `DefaultClient` — evite-os em serviços de produção. Para controle total (headers, method, body), use `http.NewRequestWithContext(ctx, method, url, body)`.

## Responses e JSON

Responses HTTP retornam `resp.Body` como `io.ReadCloser` — deve ser fechado com `defer resp.Body.Close()` para liberar a conexão de volta ao pool.

Use `json.NewDecoder(resp.Body).Decode(&v)` para decodificar JSON **diretamente do stream**, sem carregar o body inteiro na memória.

> **Atenção:** um status 404 **não** retorna `err != nil` — o erro é `nil` porque a requisição HTTP foi bem-sucedida. Sempre verifique `resp.StatusCode`.

## Struct tags JSON

```go
type User struct {
    Name string `json:"name"`
    Age  int    `json:"age,omitempty"`  // omite se zero value
    Pass string `json:"-"`             // excluído do JSON
}
```

Tipos não exportados (letra minúscula) são ignorados pelo encoder JSON.

## Tipos especiais

- `json.RawMessage` — armazena JSON bruto sem decodificar; útil para nested JSON dinâmico
- `json.Number` — preserva números como string, evitando perda de precisão em números grandes
- Para tipos customizados, implemente `json.Marshaler` / `json.Unmarshaler`
