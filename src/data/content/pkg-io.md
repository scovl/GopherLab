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

Go usa **interfaces** para I/O: `io.Reader` (método `Read(p []byte) (n int, err error)`) e `io.Writer` (`Write(p []byte) (n int, err error)`) são a base de tudo — arquivos, conexões de rede, buffers de memória, tudo implementa essas interfaces. Lógica escrita para `io.Reader` funciona com qualquer fonte de dados.

`io.EOF` é o valor de erro especial retornado quando não há mais dados para ler — trate-o como **condição normal de fim de stream**, não como erro.

## os.File e defer

`os.File` implementa `io.Reader`, `io.Writer`, `io.Seeker` e `io.Closer`. `defer f.Close()` imediatamente após abrir/criar o arquivo é **obrigatório** para liberar o file descriptor.

Em operações de escrita com `bufio.Writer`, não esqueça de chamar `w.Flush()` — dados no buffer **não são escritos no disco** até o flush ou o close.

## bufio

`bufio` adiciona bufferização para reduzir syscalls:

- `bufio.NewReader`: envolve qualquer `io.Reader` com buffer interno (padrão 4096 bytes)
- `bufio.Scanner`: simplifica leitura linha a linha
  - `Scan()` retorna `false` no fim ou erro
  - `Text()` retorna a linha sem `\n`
  - `Err()` retorna qualquer erro (exceto `io.EOF`)

## Funções de conveniência

- `io.Copy(dst, src)` — usa buffer interno de 32KB, evita carregar tudo na memória
- `io.ReadAll` — lê tudo de um Reader; **use com cuidado** para dados de tamanho ilimitado
