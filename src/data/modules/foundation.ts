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
          explicacao: 'Go é estaticamente tipado com 17 tipos básicos embutidos: 1 booleano (bool), 11 inteiros (int8, uint8/byte, int16, uint16, int32/rune, uint32, int64, uint64, int, uint, uintptr), 2 de ponto flutuante (float32, float64), 2 complexos (complex64, complex128) e 1 string. byte é alias de uint8 e rune é alias de int32. Os tipos int e uint têm tamanho dependente da arquitetura: 4 bytes em sistemas 32-bit e 8 bytes em sistemas 64-bit. uintptr deve ser grande o suficiente para armazenar qualquer endereço de memória.\n\nVariáveis são declaradas com var (qualquer escopo, zero value se não inicializada) ou := (inferência de tipo, apenas dentro de funções). O compilador recusa variáveis locais declaradas mas não usadas. Constantes usam const; ao contrário de variáveis, são substituídas pelo compilador em compiletime e não ocupam endereço de memória. Constantes tipadas (const X float32 = 3.14) e não-tipadas (const N = 123 -- N pode ser representado como qualquer tipo numérico compatível) têm semânticas diferentes: uma constante não-tipada pode overflow seu tipo padrão durante cálculos em compiletime, o que é permitido.\n\niota é um gerador predeclarado: começa em 0 na primeira especificação de cada bloco const e incrementa 1 a cada linha. O mecanismo de autocomplete replica automaticamente a expressão da linha anterior -- por isso Writable = 1 << iota em linhas subsequentes funciona sem repetir a expressão. Isso permite bit flags elegantes: Readable = 1 << iota (valores 1, 2, 4, 8...) ou status com offset: Failed = iota - 1 (valores -1, 0, 1...).\n\nTodo tipo tem zero value: 0 (numéricos), "" (string), false (bool), nil (ponteiros, slices, maps, channels, funções). Conversões são sempre explícitas entre tipos básicos: float64(i), int(f) (trunca a parte fracionária). Atenção: string(65) retorna "A" (code point Unicode 65), não "65" -- para converter inteiro em string decimal, use strconv.Itoa() ou fmt.Sprintf("%d", n). Variáveis de escopo interno podem sombrear variáveis externas com mesmo nome (shadowing) -- uma armadilha comum com := em blocos if/for.',
          codeExample: 'package main\n\nimport (\n\t"fmt"\n\t"strconv"\n)\n\n// iota com autocomplete e bit flags\ntype Permission uint\n\nconst (\n\tReadable   Permission = 1 << iota // 1\n\tWritable                          // 2\n\tExecutable                        // 4\n)\n\n// iota com offset\nconst (\n\tFailed  = iota - 1 // -1\n\tUnknown            // 0\n\tSucceeded          // 1\n)\n\n// MaxUint e MaxInt são idiomáticos em Go\nconst (\n\tMaxUint = ^uint(0)             // todos os bits 1\n\tMaxInt  = int(^uint(0) >> 1)   // maior int positivo\n)\n\nfunc main() {\n\t// var vs :=\n\tvar nome string = "Go" // var explícito\n\tidade := 15            // := inferência: int\n\n\t// Zero values\n\tvar x int      // x == 0\n\tvar s string   // s == ""\n\tvar b bool     // b == false\n\tvar p *int     // p == nil\n\n\t// Conversão explícita -- sempre obrigatória\n\tf := float64(idade)  // int → float64✓\n\tn := int(f)          // float64→int: trunca para 15\n\n\t// ATENÇÃO: string(65) é codepointUnicode, não decimal!\n\tfmt.Println(string(65))          // "A" (ponto Unicode 65)\n\tfmt.Println(strconv.Itoa(65))    // "65" (representação decimal)\n\n\t// Bit flags com iota\n\tperms := Readable | Writable\n\tfmt.Println(perms&Executable != 0) // false\n\n\tfmt.Println(nome, idade, x, s, b, p, f, n, MaxUint, MaxInt)\n\n\t// Shadowing: cuidado com := em bloco interno\n\tx = 10\n\tif v := x * 2; v > 15 {\n\t\tx := "sombra" // x local, diferente do x externo!\n\t\t_ = x\n\t}\n\tfmt.Println(x) // ainda 10\n}',
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
          explicacao: 'Strings em Go são sequências imutáveis de bytes codificadas em UTF-8. A operação len(s) retorna o número de bytes, não de caracteres -- um caractere ASCII ocupa 1 byte, mas caracteres Unicode como "ã" ou "世" ocupam 2–4 bytes. Indexar com s[i] retorna um byte (uint8), não um caractere -- isso silenciosamente corrompe texto multibyte. Para iterar por caracteres (Unicode code points), use for i, r := range s: o range decodifica cada rune (int32) e avança i pelo número correto de bytes. utf8.RuneCountInString(s) conta runes corretamente.\n\nHá dois tipos de literais string: interpretados (aspas duplas "") processam \\n, \\t, \\" e sequências \\uXXXX (Unicode) e \\xHH (byte hex). Raw strings (backticks `) preservam tudo literalmente, incluindo quebras de linha reais, sem nenhum processamento de escape -- ideais para regex, JSON template e queries SQL multilinha. Dentro de um interpreted literal, \\u4f17 representa o rune 0x4F17 (众), codificado como 3 bytes UTF-8: e4 bc 97.\n\nStrings são imutáveis: operadores de concatenação + e += criam novas alocações a cada uso. Em N concatenações em loop, isso gera O(N²) cópias. strings.Builder mantém um buffer crescente interno -- WriteString não aloca até o flush final com b.String(). Para conversões: strconv.Itoa/Atoi para int↔string decimal, strconv.ParseFloat/FormatFloat para floats. O pacote strings provê Contains, HasPrefix, HasSuffix, Index, Split, Join, Fields (split por whitespace), TrimSpace, ToLower, ToUpper, Replace e Repeat.',
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
          explicacao: 'Arrays têm tamanho fixo que é parte do tipo: [3]int e [4]int são tipos distintos e incompatíveis. Arrays são value types -- atribuir copia todos os elementos. A expressão len(arr) é constante em tempo de compilação. Use arrays quando o tamanho é fixo e conhecido -- ex: buffers SHA256 ([32]byte), hashing de mensagens. Para a maioria dos casos, use slices.\n\nSlices são referências dinâmicas a arrays subjacentes com três campos internos: ponteiro para o array, len (elementos usados) e cap (capacidade do array a partir do ponteiro). Modificar s[i] modifica o array subjacente -- sub-slices compartilham memória. append() sempre retorna um novo slice; quando len == cap, aloca novo array e copia: para slices < 256 elementos, dobra a capacidade; para maiores, cresce ~25%. Sempre reatribua: s = append(s, item). Use make([]T, len, cap) para pré-alocar capacidade e evitar realocações.\n\nMaps são hash tables key→value. Chaves devem ser comparáveis com == (int, string, structs sem campos slice/map/função). Passar map para função passa a referência -- modificações são visíveis no caller. Acesso a chave ausente retorna zero value sem pânico. O idiom comma-ok: val, ok := m[key] distingue "chave ausente" de "chave com valor zero". delete(m, key) é seguro mesmo se a chave não existir. A ordem de iteração em maps é intencionalmente aleatória a cada execução.\n\nmake() cria slices, maps e channels com estado inicial válido. nil é o zero value de slices, maps, ponteiros, channels e funções. Operações válidas em nil slice: len (0), cap (0), append (válido, aloca). Operações que panickam em nil map: escrita. Leituras em nil map são seguras (retornam zero value).',
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
          explicacao: 'Go tem apenas um construto de laço: for. Ele substitui for, while e do-while de outras linguagens. A forma for {} é um loop infinito. A forma for condition {} é equivalente ao while. A forma clássica for init; cond; post {} separa os três componentes com ponto-e-vírgula.\n\nfor-range itera sobre arrays, slices, maps, strings e channels. Para strings, range decodifica runes (não bytes) e retorna (byteIndex, rune) -- avança o índice pelo tamanho em bytes do rune, não por 1. Para maps, a ordem de iteração é indefinida e muda entre execuções. Para channels, range bloqueia até receber um valor e termina quando o channel é fechado.\n\nO if aceita uma declaração de inicialização separada por ponto-e-vírgula: if v := calcular(); v > 0 {}. A variável v existe apenas dentro do if e seus blocos else. Em switch, cada case não necessita de break -- o fall-through é opt-in com a keyword fallthrough. Cases podem agrupar múltiplos valores: case "sol", "lua":. Switch sem expressão equivale a switch true {} e é ideal para encadear condições. Type switch v := x.(type) {} permite despachar por tipo concreto de uma interface.\n\nlabels permitem break e continue saírem de loops aninhados: outer: for { ... break outer }. A keyword goto existe mas é desaconselhada. Não há do-while em Go -- use for { ...; if !cond { break } }.',
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
          explicacao: 'Funções em Go são first-class citizens: podem ser atribuídas a variáveis, passadas como argumentos e retornadas de outras funções. O tipo de uma função inclui os tipos dos parâmetros e dos retornos: func(int, string) (float64, error). Funções podem retornar múltiplos valores -- o padrão idiomático é (T, error). Named return values declaram variáveis no escopo da função; naked return usa seus valores correntes, mas prejudica legibilidade em funções longas.\n\nParâmetros variádicos (...T) recebem zero ou mais argumentos como um slice []T. Para passar um slice existente: f(s...). Funções anônimas (closures) capturam variáveis por referência, não por cópia. A armadilha clássica: em for i := range s { go func() { use(i) }() } todas as goroutines capturam a mesma variável i -- passe como argumento: go func(v int) { use(v) }(i).\n\ndefer empurha uma chamada de função em uma pilha LIFO local à função corrente. Deferridos executam quando a função retorna, seja por return normal ou por panic. Os argumentos de defer são avaliados imediatamente (no momento do defer), não no momento da execução. Ordem de execução: defer f(1); defer f(2); defer f(3) → f(3), f(2), f(1). Use defer para garantir cleanup: defer f.Close(), defer mu.Unlock().\n\npanic interrompe a execução normal e começa a desenrolar a call stack, executando funções deferridas. Se panic chegar ao topo da goroutine sem ser recuperado, o programa termina. recover() captura o valor passado ao panic -- mas apenas dentro de uma função deferrida diretamente. recover() fora de defer retorna nil. Re-panic: se a lógica de recover quiser propagar, chame panic(v) novamente.',
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
          explicacao: 'Go é inteiramente call-by-value: ao passar um argumento, o compilador copia o valor. Para int, bool, structs -- a cópia é do valor completo. Para slices, maps e channels -- a cópia é do descritor interno (ponteiro + len/cap), e o array/hash subjacente não é copiado. Por isso modificar elementos de um slice passado para uma função é visível no caller, mas append() no slice interno não é (precisaria retornar o novo slice ou passar *[]T).\n\nPonteiros armazenam endereços de memória. & obtém o endereço de uma variável (addressable value); * derreferencia, acessando o valor no endereço. Go não tem aritmética de ponteiro -- não é possível incrementar um ponteiro como em C. new(T) aloca memória com zero value e retorna um *T; equivale a var t T; return &t. O compilador decide se aloca na pilha ou heap (escape analysis) -- não há new vs malloc manual.\n\nValue receiver (func (p Ponto) Area()) recebe uma cópia de p. Pointer receiver (func (p *Ponto) Mover()) opera no original. Go auto-derreferencia: se p é do tipo Ponto, p.Mover() é sugar para (&p).Mover(). A regra: use pointer receiver quando o método precisa modificar o receiver, quando o receiver é grande (evita cópia cara), ou quando o receiver contém campos não-copiáveis (mutex, etc.). Todos os métodos de um tipo devem usar o mesmo kind de receiver (todos value ou todos pointer) para consistência.',
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
          explicacao: 'Structs agrupam campos nomeados de tipos possivelmente diferentes. São os building blocks de dados em Go -- análogos a classes, mas sem herança. Campos são acessados por ponto. Structs são value types: atribuição copia todos os campos. A comparação com == funciona se todos os campos forem comparáveis. Structs anônimos (var x struct{ N int }) são úteis para dados temporários sem precisar de nome global.\n\nStruct tags são literais de string entre backticks nos campos que fornecem metadados para bibliotecas via reflection: json:"nome,omitempty" renomeia o campo no JSON e omite se zero value; json:"-" exclui do JSON; validate:"required,min=1" para validadores como go-playground/validator. Tags são acessadas via reflect.TypeOf(s).Field(i).Tag.Get("json").\n\nEmbedding (incorporação) inclui um tipo dentro de outro sem nomeação -- seus campos e métodos são promovidos ao tipo externo. type Carro struct { Veiculo; Portas int } permite c.Motor (de Veiculo.Motor) e c.Ligar() (método de Veiculo). Não é herança -- não há relação is-a e o tipo embedded é acessível como campo normal: c.Veiculo. Se dois tipos embedded têm campos com o mesmo nome, o acesso ambíguo é um erro de compilação.\n\nGo favorece componencialidade (composição) sobre hierarquia (herança). Em vez de criar árvores de herança, combine comportamentos por embedding de interfaces e structs. Um struct pode implementar múltiplas interfaces implicitamente -- basta ter os métodos requeridos.',
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
          explicacao: 'Interfaces em Go definem conjuntos de métodos. Um tipo satisfaz uma interface automaticamente (implicit satisfaction) se implementar todos os métodos -- sem declaração explícita de implements. Isso é duck typing com verificação em compiletime: se o compilador não sabe que o tipo satisfaz a interface, ele nega a atribuição.\n\nUma interface tem valor não-nil somente se o tipo concreto e o valor concreto forem ambos não-nil. Uma interface com tipo concreto definido mas valor nil (var p *Pessoa; var i Stringer = p) é não-nil mas seu valor é nil -- a famosa armadilha de nil-interface. Para comparar com nil, compare o tipo concreto diretamente, ou use reflect.ValueOf(i).IsNil().\n\nType assertion val.(Type) extrai o tipo concreto -- panics se o tipo não bater. A forma segura: s, ok := val.(string) retorna ok=false sem pânico. Type switch switch v := x.(type) { case int: ... case string: ... } despacha por tipo. any é um alias de interface{} (Go 1.18+) e aceita qualquer valor.\n\nInterfaces são compostas por embedding: io.ReadWriter combina io.Reader e io.Writer. Siga o princípio de interfaces pequenas e focadas (ISP do SOLID): io.Reader tem apenas Read(), io.Writer tem apenas Write(). Uma função que aceita io.Reader puxa de arquivos, strings, HTTP bodies, sockets -- qualquer coisa. Use interfaces para desacoplar no ponto de uso, não no ponto de definição.',
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
