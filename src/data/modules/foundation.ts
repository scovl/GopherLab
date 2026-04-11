import { Module } from '../../types';

export const foundationModule: Module = {
  id: 'foundation',
  title: 'Fundamentos',
  description: 'Domine os conceitos básicos: tipos, variáveis, controle de fluxo, funções, structs, interfaces e mais.',
  icon: 'Blocks',
  color: '#5DC9E2',
  lessons: [
    {
      id: 'found-tipos',
      title: 'Sistema de Tipos e Variáveis',
      description: 'Tipos primitivos, var, :=, constantes, iota, zero values, conversão e escopo.',
      estimatedMinutes: 45,
      vesa: {
        visaoGeral: {
          explicacao: 'Go é estaticamente tipado. Tipos primitivos: inteiros (int, int8–64, uint, uint8–64), floats (float32, float64), complex (complex64, complex128), bool, string, byte (alias de uint8) e rune (alias de int32 para Unicode). Variáveis podem ser declaradas com `var` (explícito, funciona em qualquer escopo) ou `:=` (inferência, apenas dentro de funções). Constantes usam `const`; `iota` cria enumerações incrementais. Todo tipo tem um "zero value" (0, "", false, nil). Conversão é sempre explícita: `float64(intVar)`. Variáveis em escopo interno podem "sombrear" variáveis externas (shadowing).',
          codeExample: 'package main\n\nimport "fmt"\n\n// Constantes com iota\ntype Dia int\nconst (\n\tDomingo Dia = iota // 0\n\tSegunda            // 1\n\tTerca              // 2\n)\n\nfunc main() {\n\t// var vs :=\n\tvar nome string = "Go"\n\tidade := 15           // inferência: int\n\tpi := 3.14159         // inferência: float64\n\tativo := true\n\tletra := \'A\'          // rune (int32)\n\n\t// Zero values\n\tvar x int      // 0\n\tvar s string   // ""\n\tvar b bool     // false\n\tvar p *int     // nil\n\n\t// Conversão explícita\n\tvar f float64 = float64(idade)\n\tvar n int = int(f)\n\n\tfmt.Println(nome, idade, pi, ativo, letra, x, s, b, p, f, n)\n}',
          recursos: [
            'https://go.dev/tour/basics/8',
            'https://gobyexample.com/variables',
            'https://gobyexample.com/constants',
          ],
        },
        experimentacao: {
          desafio: 'Crie variáveis de todos os tipos básicos do Go, imprima seus zero values. Crie uma enumeração com iota para estados de um pedido (Pendente, Pago, Enviado, Entregue). Teste conversões entre int, float64 e string.',
          dicas: [
            'Use %T em fmt.Printf para ver o tipo de uma variável',
            'Conversão string ↔ int: strconv.Itoa(), strconv.Atoi()',
            'string(65) retorna "A" (converte rune), não "65"',
            'Escopo: variável declarada em if {} não existe fora dele',
          ],
        },
        socializacao: {
          discussao: 'Quais são as vantagens e desvantagens da tipagem forte do Go comparada com linguagens dinâmicas?',
          pontos: [
            'Segurança em tempo de compilação vs flexibilidade',
            'var vs := — quando usar cada um?',
            'Por que Go não tem conversão implícita como C?',
          ],
          diasDesafio: 'Dias 8–18',
          sugestaoBlog: 'Sistema de tipos em Go: tipagem forte, zero values, iota e conversões',
          hashtagsExtras: '#golang #types #gobasics',
        },
        aplicacao: {
          projeto: 'Crie uma calculadora de conversão de temperaturas (Celsius ↔ Fahrenheit ↔ Kelvin) com enum de unidade via iota.',
          requisitos: [
            'Enum de unidades com iota',
            'Variáveis tipadas corretamente',
            'Conversão com funções e fmt.Scan para entrada',
          ],
          criterios: ['Tipos corretos', 'Conversões precisas', 'Código limpo'],
        },
      },
    },
    {
      id: 'found-strings-runes',
      title: 'Strings e Runes',
      description: 'Strings imutáveis, runes Unicode, raw strings, strings.Builder e o pacote strings.',
      estimatedMinutes: 35,
      vesa: {
        visaoGeral: {
          explicacao: 'Strings em Go são sequências imutáveis de bytes codificados em UTF-8. Operações criam novas strings em vez de modificar. `rune` (int32) representa um code point Unicode — essencial para caracteres internacionais e emojis. Raw strings (backticks `) preservam formatação sem escape sequences. String literals (aspas duplas "") processam `\\n`, `\\t`, etc. Use `strings.Builder` para concatenação eficiente e o pacote `strings` para manipulação.',
          codeExample: 'package main\n\nimport (\n\t"fmt"\n\t"strings"\n\t"unicode/utf8"\n)\n\nfunc main() {\n\t// String vs bytes vs runes\n\ts := "Olá 世界"\n\tfmt.Println(len(s))                    // 11 bytes\n\tfmt.Println(utf8.RuneCountInString(s)) // 7 runes\n\n\t// Iterar por runes (não bytes)\n\tfor i, r := range s {\n\t\tfmt.Printf("pos %d: %c (U+%04X)\\n", i, r, r)\n\t}\n\n\t// Raw string — sem escape\n\tquery := `SELECT * FROM users\n\t\tWHERE active = true`\n\tfmt.Println(query)\n\n\t// Builder eficiente\n\tvar b strings.Builder\n\tfor i := 0; i < 100; i++ {\n\t\tb.WriteString("Go ")\n\t}\n\tfmt.Println(b.Len())\n\n\t// Pacote strings\n\tfmt.Println(strings.Contains("GoLang", "Go"))   // true\n\tfmt.Println(strings.Split("a,b,c", ","))         // [a b c]\n\tfmt.Println(strings.ToUpper("olá"))               // OLÁ\n}',
          recursos: [
            'https://go.dev/blog/strings',
            'https://gobyexample.com/strings-and-runes',
            'https://pkg.go.dev/strings',
          ],
        },
        experimentacao: {
          desafio: 'Crie um programa que conta quantos caracteres Unicode (runes), bytes e palavras existem em um texto informado pelo usuário. Teste com texto em português (acentos) e japonês/emoji.',
          dicas: [
            'len(s) conta bytes, utf8.RuneCountInString(s) conta runes',
            'strings.Fields separa por whitespace',
            'for _, r := range s itera por rune',
          ],
        },
        socializacao: {
          discussao: 'Por que Go diferencia bytes de runes? Como isso afeta aplicações internacionais?',
          pontos: [
            'UTF-8 foi co-criado por Ken Thompson (criador do Go)',
            'Indexar string por byte pode quebrar caracteres multibyte',
            'Comparação: strings em Python (Unicode) vs Go (bytes)',
          ],
          diasDesafio: 'Dias 8–18',
          sugestaoBlog: 'Strings e Runes em Go: UTF-8, Unicode e armadilhas comuns',
          hashtagsExtras: '#golang #strings #unicode',
        },
        aplicacao: {
          projeto: 'Implemente um analisador de texto que recebe texto via stdin e retorna: contagem de caracteres, palavras, linhas, frequência de letras e as 5 palavras mais comuns.',
          requisitos: [
            'Contar runes (não bytes)',
            'Usar strings.Fields e strings.ToLower',
            'Map para frequência de palavras',
          ],
          criterios: ['Contagem Unicode correta', 'Tratamento de acentos', 'Código idiomático'],
        },
      },
    },
    {
      id: 'found-colecoes',
      title: 'Arrays, Slices e Maps',
      description: 'Estruturas de dados: arrays (fixos), slices (dinâmicos), maps (chave-valor) e make().',
      estimatedMinutes: 50,
      vesa: {
        visaoGeral: {
          explicacao: 'Arrays têm tamanho fixo e são value types (copiados ao atribuir). Slices são referências flexíveis a arrays subjacentes com len e cap; `append` cresce automaticamente (dobrando capacity para slices pequenos). Maps são hash tables de chave-valor; chaves devem ser comparable. Use `make()` para criar slices, maps e channels pré-alocados. O idioma comma-ok (`val, ok := m[key]`) testa existência em maps e type assertions.',
          codeExample: 'package main\n\nimport "fmt"\n\nfunc main() {\n\t// Array — tamanho fixo, value type\n\tvar nums [3]int = [3]int{1, 2, 3}\n\n\t// Slice — dinâmico, reference type\n\tfrutas := []string{"maçã", "banana", "uva"}\n\tfrutas = append(frutas, "manga")\n\tfmt.Println(len(frutas), cap(frutas)) // 4, ?\n\n\t// Slice com make — pré-alocar capacidade\n\tbuf := make([]byte, 0, 1024)\n\n\t// Slice de array\n\tarr := [5]int{10, 20, 30, 40, 50}\n\tsub := arr[1:4] // [20 30 40] — referência!\n\n\t// Map\n\tidades := map[string]int{\n\t\t"Alice": 30,\n\t\t"Bob":   25,\n\t}\n\tidades["Carol"] = 28\n\tdelete(idades, "Bob")\n\n\t// Comma-ok idiom\n\tidade, ok := idades["Dave"]\n\tif !ok {\n\t\tfmt.Println("Dave não encontrado")\n\t}\n\n\t// Iterar com range\n\tfor i, f := range frutas {\n\t\tfmt.Printf("%d: %s\\n", i, f)\n\t}\n\tfor nome, idade := range idades {\n\t\tfmt.Printf("%s: %d\\n", nome, idade)\n\t}\n\n\tfmt.Println(nums, buf, sub, idade)\n}',
          recursos: [
            'https://go.dev/tour/moretypes/6',
            'https://gobyexample.com/slices',
            'https://gobyexample.com/maps',
          ],
        },
        experimentacao: {
          desafio: 'Crie um todo list em memória: use um slice de structs para tarefas e um map para categorias. Implemente adicionar, listar, marcar como feita e filtrar por categoria.',
          dicas: [
            'append retorna novo slice — reatribua: s = append(s, item)',
            'delete(map, key) remove entrada; não dá erro se key não existir',
            'Iteração de map não tem ordem garantida',
            'Teste len() e cap() antes e depois de append',
          ],
          codeTemplate: 'package main\n\nimport "fmt"\n\ntype Tarefa struct {\n\tNome      string\n\tCategoria string\n\tFeita     bool\n}\n\nfunc main() {\n\ttarefas := []Tarefa{}\n\tpor_categoria := map[string][]Tarefa{}\n\t// Implemente: adicionar, listar, completar, filtrar\n\tfmt.Println(tarefas, por_categoria)\n}',
        },
        socializacao: {
          discussao: 'Quando usar array vs slice vs map? Como o Go gerencia a memória de slices?',
          pontos: [
            'Arrays: tamanho parte do tipo — [3]int ≠ [4]int',
            'Slices: grow strategy — dobra para < 256, cresce ~25% depois',
            'Maps: referência interna — passar para função modifica original',
          ],
          diasDesafio: 'Dias 8–18',
          sugestaoBlog: 'Arrays, Slices e Maps em Go: o que o Go 101 não te conta',
          hashtagsExtras: '#golang #slices #maps',
        },
        aplicacao: {
          projeto: 'Implemente um contador de palavras: leia texto, retorne frequência de cada palavra ordenada por contagem.',
          requisitos: [
            'Usar map[string]int para frequências',
            'Usar strings.Fields para separar palavras',
            'Ordenar resultado por frequência (sort.Slice)',
          ],
          criterios: ['Contagem correta', 'Tratamento de maiúsculas/minúsculas', 'Código idiomático'],
        },
      },
    },
    {
      id: 'found-controle',
      title: 'Controle de Fluxo',
      description: 'if, switch, type switch, for, for-range, break, continue e labels.',
      estimatedMinutes: 40,
      vesa: {
        visaoGeral: {
          explicacao: 'Go tem apenas `for` como laço — mas ele substitui while e do-while. `for range` itera arrays, slices, maps, strings (por rune) e channels. O `if` suporta declaração de inicialização. O `switch` não precisa de break (sem fall-through), aceita expressões e pode ter cases múltiplos. `type switch` opera sobre tipos de interfaces. `break` e `continue` aceitam labels para controlar loops aninhados.',
          codeExample: 'package main\n\nimport "fmt"\n\nfunc main() {\n\t// For clássico\n\tfor i := 0; i < 5; i++ {\n\t\tfmt.Println(i)\n\t}\n\n\t// For como while\n\tn := 10\n\tfor n > 0 {\n\t\tn--\n\t}\n\n\t// For range (string → runes)\n\tfor i, r := range "Olá" {\n\t\tfmt.Printf("%d: %c\\n", i, r)\n\t}\n\n\t// If com inicialização\n\tif v := calcular(); v > 40 {\n\t\tfmt.Println("Maior que 40")\n\t}\n\n\t// Switch sem fall-through\n\tdia := "segunda"\n\tswitch dia {\n\tcase "segunda", "terça", "quarta", "quinta", "sexta":\n\t\tfmt.Println("Dia útil")\n\tdefault:\n\t\tfmt.Println("Fim de semana")\n\t}\n\n\t// Type switch\n\tvar val interface{} = 42\n\tswitch v := val.(type) {\n\tcase int:\n\t\tfmt.Println("int:", v)\n\tcase string:\n\t\tfmt.Println("string:", v)\n\t}\n\n\t// Label + break em loop aninhado\nouter:\n\tfor i := 0; i < 3; i++ {\n\t\tfor j := 0; j < 3; j++ {\n\t\t\tif i == 1 && j == 1 {\n\t\t\t\tbreak outer\n\t\t\t}\n\t\t}\n\t}\n}\n\nfunc calcular() int { return 42 }',
          recursos: [
            'https://go.dev/tour/flowcontrol/1',
            'https://gobyexample.com/for',
            'https://gobyexample.com/switch',
          ],
        },
        experimentacao: {
          desafio: 'Implemente FizzBuzz (1–100) usando switch sem expressão. Depois, crie um programa que busca um valor em matriz 2D usando labeled break.',
          dicas: [
            'Switch sem expressão: switch { case x%3==0: ... }',
            'O operador módulo é %',
            'Labels: outer: for → break outer',
            'Type switch é útil com interface{}/any',
          ],
        },
        socializacao: {
          discussao: 'Por que Go tem apenas o for como laço? Isso é uma limitação ou vantagem?',
          pontos: [
            'Simplicidade: um construto, muitas formas',
            'for range unifica iteração sobre todas as coleções',
            'Type switch: essencial para interfaces polimórficas',
          ],
          diasDesafio: 'Dias 8–18',
          sugestaoBlog: 'Controle de fluxo em Go: o único for, switch sem break e type switch',
          hashtagsExtras: '#golang #controlflow',
        },
        aplicacao: {
          projeto: 'Jogo de adivinhação: o programa escolhe um número aleatório e o jogador tenta adivinhar, com dicas "maior/menor" e contagem de tentativas.',
          requisitos: [
            'math/rand para gerar número aleatório',
            'Loop principal com for',
            'Dar dicas "maior" ou "menor"',
            'Contar tentativas e apresentar resultado',
          ],
          criterios: ['Jogo funcional', 'Tratamento de entrada inválida', 'Boa experiência do usuário'],
        },
      },
    },
    {
      id: 'found-funcoes',
      title: 'Funções',
      description: 'Múltiplos retornos, named returns, variadic, funções anônimas, closures e defer.',
      estimatedMinutes: 45,
      vesa: {
        visaoGeral: {
          explicacao: 'Funções em Go são first-class citizens: podem ser atribuídas a variáveis, passadas como argumentos e retornadas. Suportam múltiplos retornos (padrão `(T, error)`), named return values e parâmetros variádicos (`...T`). Funções anônimas (lambdas) e closures capturam variáveis do escopo externo. `defer` adia execução para o final da função (ordem LIFO) — essencial para cleanup. `panic` interrompe execução; `recover` captura panics em funções deferridas.',
          codeExample: 'package main\n\nimport "fmt"\n\n// Múltiplos retornos\nfunc dividir(a, b float64) (float64, error) {\n\tif b == 0 {\n\t\treturn 0, fmt.Errorf("divisão por zero")\n\t}\n\treturn a / b, nil\n}\n\n// Named returns\nfunc retangulo(l, a float64) (area, perimetro float64) {\n\tarea = l * a\n\tperimetro = 2 * (l + a)\n\treturn // naked return\n}\n\n// Variadic\nfunc soma(nums ...int) int {\n\ttotal := 0\n\tfor _, n := range nums {\n\t\ttotal += n\n\t}\n\treturn total\n}\n\nfunc main() {\n\t// Closure\n\tcontador := func() func() int {\n\t\tn := 0\n\t\treturn func() int {\n\t\t\tn++\n\t\t\treturn n\n\t\t}\n\t}()\n\tfmt.Println(contador(), contador()) // 1, 2\n\n\t// Defer — LIFO\n\tfmt.Println("início")\n\tdefer fmt.Println("defer 1")\n\tdefer fmt.Println("defer 2")\n\tfmt.Println("fim")\n\t// Saída: início, fim, defer 2, defer 1\n\n\t// Panic/Recover\n\tdefer func() {\n\t\tif r := recover(); r != nil {\n\t\t\tfmt.Println("recuperei:", r)\n\t\t}\n\t}()\n\n\tfmt.Println(soma(1, 2, 3, 4, 5)) // 15\n}',
          recursos: [
            'https://go.dev/tour/moretypes/24',
            'https://gobyexample.com/closures',
            'https://gobyexample.com/defer',
            'https://go.dev/blog/defer-panic-and-recover',
          ],
        },
        experimentacao: {
          desafio: 'Crie: (1) uma função variádica que calcule média; (2) um "acumulador" com closure que mantém estado; (3) um leitor de arquivo que use defer para garantir Close().',
          dicas: [
            'Variadic: func media(nums ...float64) float64',
            'Closure captura a variável, não o valor',
            'defer f.Close() logo após abrir o arquivo',
            'Cuidado: defer em loop pode acumular — use função interna',
          ],
        },
        socializacao: {
          discussao: 'Closures são poderosas mas podem causar bugs sutis. Quais armadilhas você encontrou?',
          pontos: [
            'Closure capturando variável de loop (clássico bug com goroutines)',
            'Defer em loop: arquivos abertos não fecham até fim da função',
            'Named returns: clareza vs confusão em funções longas',
          ],
          diasDesafio: 'Dias 8–18',
          sugestaoBlog: 'Funções em Go: closures, defer e o padrão (T, error)',
          hashtagsExtras: '#golang #functions #defer #closures',
        },
        aplicacao: {
          projeto: 'Implemente um mini-logger que usa closures para manter estado (nível, prefixo) e defer para flush no final.',
          requisitos: [
            'Closure para factory de logger com nível',
            'Funções variádicas para mensagens',
            'Defer para flush/close',
          ],
          criterios: ['Closures corretas', 'Defer no lugar certo', 'Estado encapsulado'],
        },
      },
    },
    {
      id: 'found-ponteiros',
      title: 'Ponteiros e Call by Value',
      description: 'Ponteiros, &, *, new(), call by value vs referência e nil safety.',
      estimatedMinutes: 40,
      vesa: {
        visaoGeral: {
          explicacao: 'Ponteiros armazenam endereços de memória. `&` obtém endereço, `*` dereferencia. Go é inteiramente call by value — até structs são copiados. Ponteiros permitem modificar dados em funções e evitar cópias de structs grandes. Go não tem aritmética de ponteiros (segurança). `new(T)` aloca e retorna `*T` com zero value. Referência: slices, maps e channels são internamente referências — não precisam de ponteiro explícito para modificar.',
          codeExample: 'package main\n\nimport "fmt"\n\ntype Ponto struct {\n\tX, Y float64\n}\n\n// Value receiver — trabalha com cópia\nfunc (p Ponto) Distancia() float64 {\n\treturn p.X*p.X + p.Y*p.Y\n}\n\n// Pointer receiver — modifica o original\nfunc (p *Ponto) Mover(dx, dy float64) {\n\tp.X += dx\n\tp.Y += dy\n}\n\nfunc duplicar(n *int) {\n\t*n = *n * 2\n}\n\nfunc main() {\n\tx := 10\n\tduplicar(&x)\n\tfmt.Println(x) // 20\n\n\tp := Ponto{3, 4}\n\tp.Mover(1, 1) // Go auto-referencia: (&p).Mover\n\tfmt.Println(p) // {4 5}\n\n\t// new() retorna ponteiro com zero value\n\ty := new(int)\n\t*y = 42\n\n\t// nil safety\n\tvar ptr *int // nil\n\tif ptr != nil {\n\t\tfmt.Println(*ptr)\n\t}\n}',
          recursos: [
            'https://go.dev/tour/moretypes/1',
            'https://gobyexample.com/pointers',
          ],
        },
        experimentacao: {
          desafio: 'Crie uma struct Config e funções com value receiver (leitura) e pointer receiver (modificação). Compare tamanho em memória com unsafe.Sizeof. Monte uma linked list com ponteiros.',
          dicas: [
            'Structs grandes (>64 bytes): use ponteiro',
            'Slices já são referências — ponteiro para slice é raro',
            'unsafe.Sizeof mostra tamanho do tipo, não do conteúdo',
          ],
        },
        socializacao: {
          discussao: 'Quando usar ponteiro vs valor em Go? Qual a regra de ouro?',
          pontos: [
            'Se o método modifica → pointer receiver',
            'Se struct é grande (>64 bytes) → ponteiro para evitar cópia',
            'Consistência: se um método é pointer, todos devem ser',
          ],
          diasDesafio: 'Dias 8–18',
          sugestaoBlog: 'Ponteiros em Go: value vs pointer receiver e when to use each',
          hashtagsExtras: '#golang #pointers #memory',
        },
        aplicacao: {
          projeto: 'Implemente uma linked list com ponteiros: inserir, buscar, remover e imprimir.',
          requisitos: [
            'Struct Node com valor e ponteiro para próximo',
            'Funções: InsertEnd, Find, Remove, Print',
            'Tratamento de lista vazia e elemento não encontrado',
          ],
          criterios: ['Ponteiros corretos', 'Sem nil dereference', 'Testes básicos'],
        },
      },
    },
    {
      id: 'found-structs',
      title: 'Structs, Métodos e Composição',
      description: 'Structs, struct tags, métodos com receivers, embedding e composição.',
      estimatedMinutes: 45,
      vesa: {
        visaoGeral: {
          explicacao: 'Structs agrupam campos relacionados — são os "objetos" do Go. Métodos são funções com receiver: value receiver (cópia) ou pointer receiver (modifica). Struct tags fornecem metadados para JSON, validação, etc. Embedding (composição) inclui um struct dentro de outro, promovendo seus campos e métodos — Go favorece composição sobre herança.',
          codeExample: 'package main\n\nimport (\n\t"encoding/json"\n\t"fmt"\n)\n\n// Struct com tags JSON\ntype Endereco struct {\n\tRua    string `json:"rua"`\n\tCidade string `json:"cidade"`\n}\n\ntype Pessoa struct {\n\tNome     string   `json:"nome"`\n\tIdade    int      `json:"idade"`\n\tEndereco          // embedding — promove campos\n\tSenha    string   `json:"-"` // omitido no JSON\n}\n\nfunc (p Pessoa) Saudacao() string {\n\treturn fmt.Sprintf("Olá, sou %s de %s!", p.Nome, p.Cidade)\n}\n\nfunc main() {\n\tp := Pessoa{\n\t\tNome:     "Gopher",\n\t\tIdade:    15,\n\t\tEndereco: Endereco{Rua: "Av Go", Cidade: "São Paulo"},\n\t\tSenha:    "secreta",\n\t}\n\n\t// Acesso direto ao campo promovido\n\tfmt.Println(p.Cidade) // "São Paulo"\n\tfmt.Println(p.Saudacao())\n\n\t// JSON com struct tags\n\tdata, _ := json.MarshalIndent(p, "", "  ")\n\tfmt.Println(string(data)) // Senha não aparece\n}',
          recursos: [
            'https://go.dev/tour/moretypes/2',
            'https://gobyexample.com/structs',
            'https://gobyexample.com/struct-embedding',
          ],
        },
        experimentacao: {
          desafio: 'Modele um sistema de veículos com composição: struct base Veiculo, structs Carro e Moto que embeddam Veiculo. Adicione struct tags JSON e serialize/deserialize.',
          dicas: [
            'Embedding: Carro struct { Veiculo; Portas int }',
            'Tags: `json:"nome,omitempty"` omite se vazio',
            'json.Marshal/Unmarshal para serialização',
          ],
        },
        socializacao: {
          discussao: 'Composição vs herança: Go escolheu o caminho certo?',
          pontos: [
            'Embedding não é herança — não há "is-a", é "has-a"',
            'Struct tags: metadados sem reflection pesada',
            'Comparação: classes Java vs structs+embedding Go',
          ],
          diasDesafio: 'Dias 8–18',
          sugestaoBlog: 'Structs em Go: composição, embedding e struct tags',
          hashtagsExtras: '#golang #structs #composition',
        },
        aplicacao: {
          projeto: 'API de dados com structs: modele Produto com categorias usando embedding e serialize para JSON.',
          requisitos: [
            'Struct tags JSON com omitempty e rename',
            'Embedding para campos comuns (timestamps, metadata)',
            'Funções de serialização/deserialização',
          ],
          criterios: ['Composição correta', 'JSON correto', 'Testes com edge cases'],
        },
      },
    },
    {
      id: 'found-interfaces',
      title: 'Interfaces e Polimorfismo',
      description: 'Interfaces implícitas, empty interface, type assertions, embedding de interfaces e polimorfismo.',
      estimatedMinutes: 45,
      vesa: {
        visaoGeral: {
          explicacao: 'Interfaces definem contratos por assinatura de métodos — tipos satisfazem implicitamente (duck typing compilado). `any` (alias de `interface{}`) aceita qualquer tipo. Type assertions extraem o tipo concreto: `val.(Type)` ou `val, ok := val.(Type)` (forma segura). Interfaces podem ser embedadas para composição (ex: `io.ReadWriter` combina `Reader` + `Writer`). Interfaces pequenas e focadas são idiomáticas em Go.',
          codeExample: 'package main\n\nimport (\n\t"fmt"\n\t"math"\n)\n\n// Interfaces pequenas\ntype Area interface {\n\tArea() float64\n}\n\ntype Perimetro interface {\n\tPerimetro() float64\n}\n\n// Composição de interfaces\ntype Forma interface {\n\tArea\n\tPerimetro\n}\n\n// Implementação implícita\ntype Circulo struct{ Raio float64 }\n\nfunc (c Circulo) Area() float64      { return math.Pi * c.Raio * c.Raio }\nfunc (c Circulo) Perimetro() float64  { return 2 * math.Pi * c.Raio }\n\ntype Retangulo struct{ L, A float64 }\n\nfunc (r Retangulo) Area() float64     { return r.L * r.A }\nfunc (r Retangulo) Perimetro() float64 { return 2 * (r.L + r.A) }\n\n// Polimorfismo\nfunc descrever(f Forma) {\n\tfmt.Printf("Área: %.2f, Perímetro: %.2f\\n", f.Area(), f.Perimetro())\n}\n\nfunc main() {\n\tformas := []Forma{\n\t\tCirculo{Raio: 5},\n\t\tRetangulo{L: 3, A: 4},\n\t}\n\tfor _, f := range formas {\n\t\tdescrever(f)\n\t}\n\n\t// Type assertion segura\n\tvar val any = "hello"\n\tif s, ok := val.(string); ok {\n\t\tfmt.Println("String:", s)\n\t}\n}',
          recursos: [
            'https://go.dev/tour/methods/9',
            'https://gobyexample.com/interfaces',
            'https://jordanorelli.com/post/32665860244/how-to-use-interfaces-in-go',
          ],
        },
        experimentacao: {
          desafio: 'Crie uma interface Stringer com String() string e implemente para 3 tipos diferentes. Depois, crie uma interface Writer e use type assertion para verificar se um valor também implementa Stringer.',
          dicas: [
            'Interfaces são satisfeitas implicitamente — sem "implements"',
            'Comma-ok para type assertion segura: val, ok := x.(MinhaInterface)',
            'Interface embedding: type ReadWriter interface { Reader; Writer }',
          ],
        },
        socializacao: {
          discussao: 'Interfaces implícitas vs explícitas (como em Java): qual abordagem prefere e por quê?',
          pontos: [
            'Go: duck typing compilado — mais flexível',
            'Java: implements — mais explícito, autodocumentado',
            'Princípio ISP do SOLID: interfaces pequenas',
          ],
          diasDesafio: 'Dias 8–18',
          sugestaoBlog: 'Interfaces em Go: polimorfismo sem herança e o poder do duck typing compilado',
          hashtagsExtras: '#golang #interfaces #polymorphism',
        },
        aplicacao: {
          projeto: 'Mini-framework de formas geométricas com área e perímetro — use interfaces para polimorfismo e type assertions para formatação especial.',
          requisitos: [
            'Interface Forma com Area() e Perimetro()',
            'Pelo menos 3 formas implementadas',
            'Função que recebe []Forma e calcula soma de áreas',
            'Type assertion para tratar formas com atributos extras',
          ],
          criterios: ['Interfaces corretas', 'Polimorfismo funcional', 'Testes unitários'],
        },
      },
    },
    {
      id: 'found-packages',
      title: 'Packages, Módulos e Dependências',
      description: 'Organização em packages, go mod, exportação por maiúscula, internal/ e dependências.',
      estimatedMinutes: 40,
      vesa: {
        visaoGeral: {
          explicacao: 'Packages organizam código — cada diretório é um package. Nomes exportados começam com maiúscula; minúscula é privado ao package. Módulos (go.mod) gerenciam dependências com semantic versioning. `go mod init` cria módulo, `go mod tidy` limpa, `go get` adiciona dependências. `internal/` cria packages visíveis apenas ao módulo pai. Go proíbe imports circulares.',
          codeExample: '# Estrutura de projeto\nmyapp/\n├── go.mod                    # go mod init github.com/user/myapp\n├── cmd/\n│   └── server/main.go        # package main — entry point\n├── internal/                 # privado ao módulo\n│   ├── handler/handler.go    # package handler\n│   └── service/service.go    # package service\n├── pkg/                      # público — pode ser importado\n│   └── validator/validator.go\n└── go.sum                    # checksums\n\n# Comandos essenciais\ngo mod init github.com/user/myapp\ngo get github.com/gin-gonic/gin@latest\ngo mod tidy\ngo mod vendor  # opcional — copia deps localmente',
          recursos: [
            'https://go.dev/ref/mod',
            'https://go.dev/doc/modules/layout',
          ],
        },
        experimentacao: {
          desafio: 'Crie um projeto com 3 packages: cmd/main, internal/service e pkg/utils. Exporte e importe funções. Depois adicione uma dependência externa com go get.',
          dicas: [
            'Cada pasta = um package, mesmo nome do diretório',
            'Apenas nomes com letra maiúscula são exportados',
            'Use go mod init para inicializar',
            'internal/ impede acesso de fora do módulo',
          ],
        },
        socializacao: {
          discussao: 'Como a convenção de exportação por maiúscula afeta o design de APIs em Go?',
          pontos: [
            'Simplicidade: sem public/private/protected keywords',
            'Encapsulamento visual — visivelmente claro',
            'internal/ para código que não é API pública',
          ],
          diasDesafio: 'Dias 8–18',
          sugestaoBlog: 'Packages e módulos em Go: organizando projetos profissionais',
          hashtagsExtras: '#golang #modules #packages',
        },
        aplicacao: {
          projeto: 'Crie um projeto Go com cmd/, internal/, pkg/ e publique como módulo em um repositório.',
          requisitos: [
            'Estrutura cmd/ + internal/ + pkg/',
            'go.mod e go.sum configurados',
            'README com instruções de uso e importação',
          ],
          criterios: ['Estrutura correta', 'Imports funcionais', 'Compilação sem erros'],
        },
      },
    },
  ],
};
