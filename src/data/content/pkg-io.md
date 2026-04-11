---
title: I/O e Manipulação de Arquivos
description: os, io, bufio — leitura, escrita, Scanner e o padrão Reader/Writer.
estimatedMinutes: 40
recursos:
  - https://gobyexample.com/reading-files
  - https://gobyexample.com/writing-files
  - https://pkg.go.dev/io
experimentacao:
  desafio: "Crie um programa que: (1) leia um CSV e imprima em tabela formatada; (2) copie um arquivo usando io.Copy; (3) leia da stdin linha a linha."
  dicas:
    - encoding/csv para CSV ou bufio.Scanner para simples
    - io.Copy(dst, src) copia entre Readers e Writers
    - os.Stdin é um io.Reader — use bufio.NewScanner(os.Stdin)
  codeTemplate: |
    package main

    import (
    	"bufio"
    	"fmt"
    	"io"
    	"os"
    	"strings"
    )

    func main() {
    	f, err := os.Create("teste.txt")
    	if err != nil {
    		fmt.Println("Erro:", err)
    		return
    	}
    	defer f.Close()
    	w := bufio.NewWriter(f)
    	w.WriteString("Linha 1\n")
    	w.Flush()
    	file, _ := os.Open("teste.txt")
    	defer file.Close()
    	scanner := bufio.NewScanner(file)
    	for scanner.Scan() {
    		fmt.Println(scanner.Text())
    	}
    	r := strings.NewReader("dados")
    	data, _ := io.ReadAll(r)
    	fmt.Println(string(data))
    }
  notaPos: |
    #### O que aconteceu nesse código?

    **`os.Create("teste.txt")`** — cria (ou trunca) o arquivo e retorna `*os.File`. `*os.File` implementa `io.Reader`, `io.Writer`, `io.Closer` e `io.Seeker`. **`defer f.Close()`** logo após a abertura é obrigatório para liberar o file descriptor.

    **`bufio.NewWriter(f)` + `w.Flush()`** — `bufio.Writer` acumula escritas num buffer interno (padrão 4096 bytes) e faz uma única syscall ao dar flush. **Sem `Flush()`**, dados no buffer **não chegam ao disco**. `f.Close()` força o flush, mas verificar o erro do `Flush()` separadamente é boa prática.

    **`bufio.NewScanner(file)`** — lê linha por linha. `scanner.Scan()` retorna `false` no EOF ou erro. `scanner.Text()` retorna a linha **sem `\n`**. `scanner.Err()` retorna erros (exceto `io.EOF`, que é condição normal de fim).

    **`strings.NewReader("dados")`** — cria um `io.Reader` a partir de uma string. A mesma lógica que lê de um arquivo funciona com uma string, um buffer de rede ou qualquer `io.Reader` — essa é a força das interfaces de I/O do Go.

    **`io.ReadAll(r)`** — lê **tudo** de um Reader até EOF. Conveniente, mas perigoso com dados de tamanho ilimitado (downloads, uploads). Prefira `io.Copy` ou `io.LimitReader` para streams de tamanho desconhecido.

    **`io.Copy(dst, src)`** — copia com buffer interno de 32KB sem carregar tudo na memória. É o padrão para copiar entre qualquer Reader e Writer.
socializacao:
  discussao: Por que tudo em Go implementa io.Reader/Writer? Qual a vantagem dessa abstração?
  pontos:
    - "Código genérico: mesma função lê arquivo, rede, string"
    - Composição com io.TeeReader, io.MultiWriter
    - Comparação com try-finally em Java vs defer em Go
  diasDesafio: Dias 19–28
  sugestaoBlog: "I/O em Go: Reader, Writer, bufio e o poder das interfaces"
  hashtagsExtras: '#golang #io #files'
aplicacao:
  projeto: "Tail -f em Go: monitore mudanças em um arquivo de log em tempo real."
  requisitos:
    - Ler arquivo continuamente
    - Detectar novas linhas adicionadas
    - Exibir em tempo real no terminal
  criterios:
    - Uso correto de defer
    - Detect de EOF e retry
    - Eficiente em memória
  starterCode: |
    package main

    import (
    	"bufio"
    	"fmt"
    	"io"
    	"os"
    	"strings"
    )

    func contarLinhas(r io.Reader) (int, error) {
    	scanner := bufio.NewScanner(r)
    	count := 0
    	for scanner.Scan() {
    		count++
    	}
    	return count, scanner.Err()
    }

    func copiarArquivo(dst, src string) (int64, error) {
    	in, err := os.Open(src)
    	if err != nil {
    		return 0, err
    	}
    	defer in.Close()
    	out, err := os.Create(dst)
    	if err != nil {
    		return 0, err
    	}
    	defer out.Close()
    	return io.Copy(out, in)
    }

    func main() {
    	// Escreve arquivo de teste
    	f, _ := os.Create("exemplo.txt")
    	w := bufio.NewWriter(f)
    	for i := 1; i <= 5; i++ {
    		fmt.Fprintf(w, "Linha %d: Olá, Go!\n", i)
    	}
    	w.Flush()
    	f.Close()

    	// Conta linhas (funciona com qualquer io.Reader!)
    	file, _ := os.Open("exemplo.txt")
    	n, _ := contarLinhas(file)
    	file.Close()
    	fmt.Println("Linhas no arquivo:", n)

    	// Mesmo contarLinhas funciona com string
    	n2, _ := contarLinhas(strings.NewReader("a\nb\nc"))
    	fmt.Println("Linhas na string:", n2)

    	// Copia arquivo
    	bytes, _ := copiarArquivo("copia.txt", "exemplo.txt")
    	fmt.Printf("Copiados %d bytes\n", bytes)
    }

---

## O grande segredo do I/O em Go: duas interfaces dominam tudo

Em Go, **ler** e **escrever** dados — seja de um arquivo, da rede, de uma string ou da memória — tudo funciona do mesmo jeito, graças a duas interfaces:

| Interface | Método | Analogia |
|---|---|---|
| `io.Reader` | `Read(p []byte) (n int, err error)` | **Torneira** — você abre e saem dados |
| `io.Writer` | `Write(p []byte) (n int, err error)` | **Ralo** — você joga dados nele |

Por que isso importa? Porque uma função que aceita `io.Reader` funciona com **qualquer coisa** que tenha o método `Read`:

```go
// Essa mesma função lê de arquivo, string, rede, qualquer coisa!
func contarLinhas(r io.Reader) int {
    scanner := bufio.NewScanner(r)
    count := 0
    for scanner.Scan() {
        count++
    }
    return count
}

// Funciona com arquivo:
file, _ := os.Open("dados.txt")
fmt.Println(contarLinhas(file))

// Funciona com string (sem mudar nada!):
fmt.Println(contarLinhas(strings.NewReader("a\nb\nc")))
```

> **Analogia:** pense em `io.Reader` como uma **tomada elétrica padrão**. Não importa se a energia vem de hidrelétrica, solar ou eólica — o plugue é o mesmo. Não importa se os dados vêm de arquivo, rede ou memória — o `Read` é o mesmo.

### `io.EOF` — não é erro, é "acabou"

Quando você lê até o final dos dados, Go retorna `io.EOF`. Isso **não é um erro** — é um sinal de "não tem mais nada para ler". É como chegar na última página de um livro.

```go
// Leitura manual (raramente você faz isso diretamente)
buf := make([]byte, 1024)
n, err := reader.Read(buf)
if err == io.EOF {
    // Acabou — normal, não é erro
}
if err != nil && err != io.EOF {
    // Isso sim é erro de verdade
}
```

Na prática, você quase nunca lida com `io.EOF` diretamente — `bufio.Scanner`, `json.Decoder` e `io.Copy` cuidam disso por você.

---

## Trabalhando com arquivos — abrir, ler, escrever, fechar

### Abrindo arquivos

| Função | O que faz | Quando usar |
|---|---|---|
| `os.Open("arquivo.txt")` | Abre **só para leitura** | Quando quer ler |
| `os.Create("arquivo.txt")` | Cria (ou **apaga e recria**!) para escrita | Quando quer escrever do zero |
| `os.OpenFile(nome, flags, perm)` | Controle total (append, leitura+escrita) | Quando precisa de mais controle |

### A regra de ouro: `defer f.Close()` na linha seguinte

Sempre que abrir um arquivo, **imediatamente** escreva `defer f.Close()`:

```go
f, err := os.Open("dados.txt")
if err != nil {
    fmt.Println("Erro:", err)
    return
}
defer f.Close()  // ← SEMPRE aqui, logo depois do if err

// ... use f à vontade, o Close roda no final da função
```

Por quê? Cada arquivo aberto usa um **file descriptor** do sistema operacional. Se você abre muitos arquivos sem fechar, o sistema recusa abrir mais — erro "too many open files". O `defer` garante que o arquivo fecha **mesmo se der panic**.

### Leitura simples — arquivo inteiro de uma vez

```go
data, err := os.ReadFile("config.json")  // retorna []byte
if err != nil {
    fmt.Println("Erro:", err)
    return
}
fmt.Println(string(data))
```

> **Cuidado:** `os.ReadFile` carrega o arquivo **inteiro na memória**. Ótimo para arquivos pequenos (configs, JSONs). Péssimo para arquivos de 2GB.

### Escrita simples — gravar tudo de uma vez

```go
conteudo := []byte("Olá, arquivo!\nSegunda linha\n")
err := os.WriteFile("saida.txt", conteudo, 0644)
```

`0644` são as permissões do arquivo (o dono lê e escreve, outros só leem).

---

## `bufio` — leitura e escrita eficientes

### O problema: syscalls são caras

Cada vez que você chama `Read` ou `Write` em um arquivo, Go faz uma **syscall** (chamada ao sistema operacional). Syscalls são lentas comparadas a operações em memória.

`bufio` resolve isso com um **buffer**: acumula dados em memória e faz uma syscall só quando o buffer enche.

```
Sem bufio:   Read → syscall → Read → syscall → Read → syscall  (3 syscalls)
Com bufio:   Read → buffer → Read → buffer → Read → syscall    (1 syscall!)
```

### Lendo linha por linha com `bufio.Scanner`

Esse é o padrão mais comum para ler texto:

```go
file, _ := os.Open("log.txt")
defer file.Close()

scanner := bufio.NewScanner(file)
for scanner.Scan() {          // Scan() retorna true enquanto tiver linhas
    linha := scanner.Text()    // Text() retorna a linha SEM o \n
    fmt.Println(linha)
}
if err := scanner.Err(); err != nil {
    fmt.Println("Erro:", err)  // Err() retorna erros (exceto EOF)
}
```

| Método | O que faz |
|---|---|
| `scanner.Scan()` | Avança para a próxima linha. Retorna `false` no fim ou erro |
| `scanner.Text()` | Retorna a linha atual **sem** o `\n` |
| `scanner.Bytes()` | Retorna a linha atual como `[]byte` (evita alocação) |
| `scanner.Err()` | Retorna o erro, se houver (EOF não conta como erro) |

### Lendo do teclado (stdin)

`os.Stdin` é um `io.Reader` — o Scanner funciona igualzinho:

```go
fmt.Print("Digite algo: ")
scanner := bufio.NewScanner(os.Stdin)
scanner.Scan()
fmt.Println("Você digitou:", scanner.Text())
```

### Escrita bufferizada

```go
f, _ := os.Create("saida.txt")
defer f.Close()

w := bufio.NewWriter(f)
w.WriteString("Primeira linha\n")
w.WriteString("Segunda linha\n")
w.Flush()  // ⚠️ OBRIGATÓRIO! Sem Flush, nada vai pro disco!
```

> **Armadilha clássica:** você escreve com `bufio.Writer`, o programa roda sem erro, mas o arquivo fica vazio ou incompleto. O motivo? **Esqueceu do `Flush()`**. Os dados ficaram no buffer e nunca chegaram ao disco.

---

## Funções de conveniência do pacote `io`

| Função | O que faz | Quando usar |
|---|---|---|
| `io.Copy(dst, src)` | Copia de Reader para Writer com buffer de 32KB | Copiar arquivo, proxy de rede |
| `io.ReadAll(r)` | Lê **tudo** de um Reader até EOF | Arquivos pequenos, respostas HTTP curtas |
| `io.LimitReader(r, n)` | Limita a leitura a `n` bytes | Proteger contra uploads gigantes |
| `io.TeeReader(r, w)` | Lê de `r` e **copia** para `w` ao mesmo tempo | Log de dados enquanto processa |

### Copiar arquivo sem carregar na memória

```go
src, _ := os.Open("video.mp4")       // 2GB? Sem problema
defer src.Close()
dst, _ := os.Create("copia.mp4")
defer dst.Close()

bytes, _ := io.Copy(dst, src)         // copia em blocos de 32KB
fmt.Printf("Copiados %d bytes\n", bytes)
```

`io.Copy` **nunca** carrega o arquivo inteiro — usa um buffer interno de 32KB. Pode copiar arquivos de qualquer tamanho.

### `io.ReadAll` — conveniente, mas perigoso

```go
// ✅ Bom para dados pequenos
data, _ := io.ReadAll(resp.Body)

// ❌ Perigoso! Se resp.Body for 10GB, seu programa come 10GB de RAM
data, _ := io.ReadAll(downloadGigante)

// ✅ Proteja-se com LimitReader
limitado := io.LimitReader(resp.Body, 10*1024*1024)  // máximo 10MB
data, _ := io.ReadAll(limitado)
```

---

## Resumo visual — quando usar o quê

| Preciso de... | Use |
|---|---|
| Ler arquivo inteiro (pequeno) | `os.ReadFile` |
| Escrever arquivo inteiro | `os.WriteFile` |
| Ler linha por linha | `bufio.Scanner` |
| Escrever várias vezes (eficiente) | `bufio.NewWriter` + `Flush()` |
| Copiar arquivo grande | `io.Copy` |
| Ler do teclado | `bufio.NewScanner(os.Stdin)` |
| Limitar tamanho de leitura | `io.LimitReader` |
