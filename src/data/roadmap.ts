import { Module } from '../types';

export const roadmapModules: Module[] = [
  {
    id: 'intro',
    title: 'Introdução à Linguagem',
    description: 'Conheça Go, sua história, motivações e configure seu ambiente de desenvolvimento.',
    icon: 'Rocket',
    color: '#00ADD8',
    lessons: [
      {
        id: 'intro-historia',
        title: 'Sobre a Linguagem e seu Histórico',
        description: 'A história do Go, criadores e filosofia da linguagem.',
        estimatedMinutes: 30,
        mesa: {
          modelagem: {
            explicacao: 'Go (ou Golang) foi criado em 2007 por Robert Griesemer, Rob Pike e Ken Thompson no Google. A linguagem foi lançada publicamente em 2009. Go nasceu da frustração com linguagens existentes para programação de sistemas distribuídos — a compilação lenta do C++, a complexidade do Java e a necessidade de uma linguagem que fosse simples, rápida e segura para concorrência.',
            recursos: [
              'https://go.dev/doc/',
              'https://go.dev/blog/go-brand',
              'https://www.youtube.com/watch?v=rKnDgT73v8s',
            ],
          },
          experimentacao: {
            desafio: 'Pesquise e liste 5 empresas que utilizam Go em produção e qual problema cada uma resolve com a linguagem.',
            dicas: [
              'Procure no site oficial go.dev/solutions',
              'Pense em empresas como Google, Uber, Twitch, Docker, Kubernetes',
              'Anote qual tipo de sistema cada empresa desenvolve com Go',
            ],
          },
          socializacao: {
            discussao: 'Por que Go se tornou tão popular para microsserviços e sistemas distribuídos?',
            pontos: [
              'Compare com sua experiência em outras linguagens',
              'Discuta as vantagens da compilação estática',
              'Pense no modelo de concorrência com goroutines',
            ],
            diasDesafio: 'Dias 1–7',
            sugestaoBlog: 'Por que escolhi Go: história, motivações e meu setup inicial',
            hashtagsExtras: '#golang #beginner',

          },
          aplicacao: {
            projeto: 'Crie um documento resumindo a história do Go e suas principais características.',
            requisitos: [
              'Incluir linha do tempo das versões principais',
              'Listar pelo menos 3 características únicas do Go',
              'Mencionar casos de uso reais',
            ],
            criterios: ['Clareza na escrita', 'Informações corretas e atualizadas', 'Organização lógica'],
          },
        },
      },
      {
        id: 'intro-motivacoes',
        title: 'Motivações para Aprender Go',
        description: 'Entenda por que Go é relevante e quando escolhê-lo.',
        estimatedMinutes: 20,
        mesa: {
          modelagem: {
            explicacao: 'Go foi projetado para resolver problemas reais de engenharia de software em larga escala: compilação rápida, execução eficiente, facilidade de manutenção, suporte nativo à concorrência e um ecossistema de ferramentas robusto. A linguagem prioriza simplicidade — tem apenas 25 palavras reservadas.',
            recursos: [
              'https://go.dev/solutions/',
              'https://go.dev/doc/faq',
            ],
          },
          experimentacao: {
            desafio: 'Compare Go com uma linguagem que você já conhece. Liste prós e contras de cada uma para: APIs web, CLIs, e processamento concorrente.',
            dicas: [
              'Use uma tabela comparativa',
              'Considere: performance, facilidade, ecossistema e comunidade',
            ],
          },
          socializacao: {
            discussao: 'Em quais cenários Go NÃO seria a melhor escolha?',
            pontos: [
              'Aplicações mobile nativas',
              'Machine Learning (comparado com Python)',
              'Frontend web',
            ],
            diasDesafio: 'Dias 1–7',
            sugestaoBlog: 'Go vs outras linguagens: quando escolher e quando não escolher',
            hashtagsExtras: '#golang #beginner',

          },
          aplicacao: {
            projeto: 'Escreva um "pitch" de 1 parágrafo explicando para um colega por que ele deveria aprender Go.',
            requisitos: ['Ser convincente', 'Usar dados reais', 'Mencionar mercado de trabalho'],
            criterios: ['Argumentação clara', 'Informações verificáveis'],
          },
        },
      },
      {
        id: 'intro-instalacao',
        title: 'Instalação do Go',
        description: 'Instale o Go no seu sistema operacional.',
        estimatedMinutes: 25,
        mesa: {
          modelagem: {
            explicacao: 'A instalação do Go é simples. Acesse go.dev/dl e baixe o instalador para seu SO. Após instalar, o comando `go version` deve retornar a versão instalada. O Go utiliza a variável GOPATH para gerenciar workspaces e GOROOT para o diretório de instalação.',
            codeExample: '# Verificar instalação\ngo version\n\n# Ver variáveis de ambiente\ngo env\n\n# GOPATH padrão: ~/go\n# GOROOT: diretório de instalação',
            recursos: [
              'https://go.dev/dl/',
              'https://go.dev/doc/install',
            ],
          },
          experimentacao: {
            desafio: 'Instale Go no seu computador e verifique que tudo está funcionando executando os comandos de verificação.',
            dicas: [
              'No Windows, use o instalador .msi',
              'No Linux, extraia o tarball em /usr/local',
              'No macOS, use o .pkg ou brew install go',
              'Verifique com: go version && go env',
            ],
          },
          socializacao: {
            discussao: 'Compartilhe dificuldades encontradas na instalação e como as resolveu.',
            pontos: [
              'Problemas com PATH',
              'Diferença entre GOPATH e GOROOT',
              'Versões do Go e compatibilidade',
            ],
            diasDesafio: 'Dias 1–7',
            sugestaoBlog: 'Configurando Go no Windows/Linux/macOS: guia passo a passo',
            hashtagsExtras: '#golang #setup',

          },
          aplicacao: {
            projeto: 'Configure o Go e crie seu primeiro programa: um Hello World.',
            requisitos: [
              'Go instalado e funcionando',
              'Executar `go run main.go` com sucesso',
              'Arquivo em um módulo Go válido (go mod init)',
            ],
            criterios: ['Go instalado corretamente', 'Hello World executando'],
          },
        },
      },
      {
        id: 'intro-vscode',
        title: 'Configuração do Ambiente no VSCode',
        description: 'Configure o Visual Studio Code para desenvolvimento em Go.',
        estimatedMinutes: 20,
        mesa: {
          modelagem: {
            explicacao: 'O VS Code com a extensão oficial "Go" da Google é o editor mais popular para Go. A extensão oferece: autocompletar (gopls), formatação automática, debugging, testes integrados, e análise estática. Instale a extensão e use Ctrl+Shift+P > "Go: Install/Update Tools" para instalar as ferramentas auxiliares.',
            recursos: [
              'https://marketplace.visualstudio.com/items?itemName=golang.Go',
              'https://github.com/golang/vscode-go',
            ],
          },
          experimentacao: {
            desafio: 'Instale a extensão Go no VS Code e configure as ferramentas. Teste criando um arquivo .go e verificando que o autocompletar funciona.',
            dicas: [
              'Instale a extensão "Go" (publisher: golang.go)',
              'Execute "Go: Install/Update Tools" no Command Palette',
              'Selecione todas as ferramentas sugeridas',
              'Teste o debug com F5 em um programa simples',
            ],
          },
          socializacao: {
            discussao: 'Quais extensões adicionais do VS Code ajudam no desenvolvimento Go?',
            pontos: [
              'Error Lens para erros inline',
              'GitLens para controle de versão',
              'Thunder Client para testar APIs',
            ],
            diasDesafio: 'Dias 1–7',
            sugestaoBlog: 'Meu ambiente Go no VS Code: extensões e configurações essenciais',
            hashtagsExtras: '#vscode #golang #devtools',

          },
          aplicacao: {
            projeto: 'Configure seu ambiente completo: VS Code + extensões + ferramentas Go.',
            requisitos: [
              'Extensão Go instalada',
              'Todas as ferramentas Go atualizadas',
              'Debugger funcionando',
            ],
            criterios: ['AutoComplete funcionando', 'Formatação ao salvar', 'Debugger operacional'],
          },
        },
      },
    ],
  },
  {
    id: 'foundation',
    title: 'Fundamentos',
    description: 'Domine os conceitos básicos: tipos, controle de fluxo, funções, structs, interfaces e mais.',
    icon: 'Blocks',
    color: '#5DC9E2',
    lessons: [
      {
        id: 'found-primeiros-passos',
        title: 'Primeiros Passos',
        description: 'Estrutura de um programa Go, packages, imports e a função main.',
        estimatedMinutes: 35,
        mesa: {
          modelagem: {
            explicacao: 'Todo programa Go começa com uma declaração de package. O package `main` com a função `main()` é o ponto de entrada. Imports organizam dependências.',
            codeExample: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Olá, Go!")\n}',
            recursos: ['https://go.dev/tour/basics/1', 'https://gobyexample.com/hello-world'],
          },
          experimentacao: {
            desafio: 'Crie um programa que imprima seu nome, idade e linguagens que conhece. Use fmt.Printf com verbos de formatação.',
            dicas: [
              'Use %s para strings, %d para inteiros',
              'fmt.Printf não adiciona \\n automaticamente',
              'Teste fmt.Println vs fmt.Printf vs fmt.Sprintf',
            ],
            codeTemplate: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tnome := "Seu Nome"\n\t// Complete: imprima nome, idade e linguagens\n}',
          },
          socializacao: {
            discussao: 'Como a abordagem do Go para packages e imports se compara com outras linguagens?',
            pontos: [
              'Go não permite imports não utilizados',
              'Convenção de nomes de packages',
              'Organização de código em packages',
            ],
            diasDesafio: 'Dias 8–18',
            sugestaoBlog: 'Primeiros passos em Go: estrutura de programas e o pacote fmt',
            hashtagsExtras: '#golang #gobasics',

          },
          aplicacao: {
            projeto: 'Crie um programa que exiba um cartão de apresentação pessoal formatado no terminal.',
            requisitos: [
              'Usar pelo menos 3 funções do package fmt',
              'Organizar a saída de forma visual',
              'Incluir variáveis de diferentes tipos',
            ],
            criterios: ['Código compila sem erros', 'Saída formatada e legível', 'Uso correto de tipos'],
          },
        },
      },
      {
        id: 'found-tipos',
        title: 'Trabalhando com Tipagem Forte',
        description: 'Sistema de tipos do Go: var, :=, constantes, zero values e conversão.',
        estimatedMinutes: 40,
        mesa: {
          modelagem: {
            explicacao: 'Go é estaticamente tipado. Variáveis podem ser declaradas com `var` (explícito) ou `:=` (inferência). Constantes usam `const`. Todo tipo tem um "zero value" (0 para números, "" para strings, false para bool, nil para ponteiros).',
            codeExample: 'package main\n\nimport "fmt"\n\nfunc main() {\n\t// Declaração explícita\n\tvar nome string = "Go"\n\tvar idade int = 15\n\n\t// Inferência de tipo\n\tversao := 1.22\n\tativo := true\n\n\t// Constantes\n\tconst pi = 3.14159\n\n\t// Zero values\n\tvar x int      // 0\n\tvar s string   // ""\n\tvar b bool     // false\n\n\tfmt.Println(nome, idade, versao, ativo, pi, x, s, b)\n}',
            recursos: ['https://go.dev/tour/basics/8', 'https://gobyexample.com/variables'],
          },
          experimentacao: {
            desafio: 'Crie variáveis de todos os tipos básicos do Go e imprima seus zero values. Depois, experimente conversões de tipo.',
            dicas: [
              'Tipos: int, int8, int16, int32, int64, uint, float32, float64, string, bool, byte, rune',
              'Conversão: float64(intVar), int(floatVar), string(runeVar)',
              'Use iota para criar enumerações com const',
            ],
          },
          socializacao: {
            discussao: 'Quais são as vantagens e desvantagens da tipagem forte do Go?',
            pontos: [
              'Segurança em tempo de compilação',
              'var vs := — quando usar cada um?',
              'Por que Go não tem conversão implícita?',
            ],
            diasDesafio: 'Dias 8–18',
            sugestaoBlog: 'Go Type System: tipagem forte, zero values e conversões explícitas',
            hashtagsExtras: '#golang #types #gobasics',

          },
          aplicacao: {
            projeto: 'Crie uma calculadora simples de conversão de temperaturas (Celsius ↔ Fahrenheit ↔ Kelvin).',
            requisitos: [
              'Usar variáveis tipadas corretamente',
              'Implementar conversão com funções',
              'Tratar entrada do usuário com fmt.Scan',
            ],
            criterios: ['Tipos corretos', 'Conversões precisas', 'Código limpo'],
          },
        },
      },
      {
        id: 'found-colecoes',
        title: 'Arrays, Slices e Maps',
        description: 'Estruturas de dados fundamentais do Go.',
        estimatedMinutes: 50,
        mesa: {
          modelagem: {
            explicacao: 'Arrays têm tamanho fixo. Slices são referências flexíveis a arrays com tamanho dinâmico. Maps são pares chave-valor (hash maps). Slices são muito mais usados que arrays em Go.',
            codeExample: 'package main\n\nimport "fmt"\n\nfunc main() {\n\t// Array (tamanho fixo)\n\tvar nums [3]int = [3]int{1, 2, 3}\n\n\t// Slice (dinâmico)\n\tfrutas := []string{"maçã", "banana", "uva"}\n\tfrutas = append(frutas, "manga")\n\n\t// Slice com make\n\tbuffer := make([]byte, 0, 1024)\n\n\t// Map\n\tidades := map[string]int{\n\t\t"Alice": 30,\n\t\t"Bob":   25,\n\t}\n\tidades["Carol"] = 28\n\n\t// Comma-ok idiom\n\tidade, ok := idades["Dave"]\n\tif !ok {\n\t\tfmt.Println("Dave não encontrado")\n\t}\n\n\tfmt.Println(nums, frutas, buffer, idade)\n}',
            recursos: ['https://go.dev/tour/moretypes/6', 'https://gobyexample.com/slices'],
          },
          experimentacao: {
            desafio: 'Crie um programa que gerencie uma lista de tarefas (todo list) usando slices e um mapa para categorias.',
            dicas: [
              'Use append para adicionar itens ao slice',
              'Use delete(map, key) para remover do map',
              'Teste len() e cap() nos slices',
              'Use range para iterar',
            ],
            codeTemplate: 'package main\n\nimport "fmt"\n\nfunc main() {\n\ttarefas := []string{}\n\tcategorias := map[string][]string{}\n\t// Implemente: adicionar, listar e categorizar tarefas\n}',
          },
          socializacao: {
            discussao: 'Quando usar array vs slice vs map? Como o Go gerencia a memória de slices?',
            pontos: [
              'Arrays são value types, slices são reference types',
              'Capacity growth strategy de slices',
              'Maps não têm ordem garantida',
            ],
            diasDesafio: 'Dias 8–18',
            sugestaoBlog: 'Arrays, Slices e Maps em Go: o que o Go 101 não te conta',
            hashtagsExtras: '#golang #slices #maps',

          },
          aplicacao: {
            projeto: 'Implemente um sistema de contagem de palavras que leia texto e retorne a frequência de cada palavra.',
            requisitos: [
              'Usar map[string]int para frequências',
              'Usar strings.Fields para separar palavras',
              'Ordenar resultado por frequência',
            ],
            criterios: ['Contagem correta', 'Tratamento de maiúsculas/minúsculas', 'Código idiomático'],
          },
        },
      },
      {
        id: 'found-controle',
        title: 'Laços de Repetição e Condicionais',
        description: 'if, else, switch, for — o único laço do Go.',
        estimatedMinutes: 35,
        mesa: {
          modelagem: {
            explicacao: 'Go tem apenas `for` como laço de repetição — mas ele substitui while e do-while. O `if` pode ter uma declaração de inicialização. O `switch` não precisa de break e aceita expressões.',
            codeExample: 'package main\n\nimport "fmt"\n\nfunc main() {\n\t// For clássico\n\tfor i := 0; i < 5; i++ {\n\t\tfmt.Println(i)\n\t}\n\n\t// For como while\n\tn := 10\n\tfor n > 0 {\n\t\tn--\n\t}\n\n\t// For range\n\tnomes := []string{"Ana", "Bia"}\n\tfor i, nome := range nomes {\n\t\tfmt.Printf("%d: %s\\n", i, nome)\n\t}\n\n\t// If com inicialização\n\tif v := 42; v > 40 {\n\t\tfmt.Println("Maior que 40")\n\t}\n\n\t// Switch\n\tdia := "segunda"\n\tswitch dia {\n\tcase "segunda", "terça", "quarta", "quinta", "sexta":\n\t\tfmt.Println("Dia útil")\n\tdefault:\n\t\tfmt.Println("Fim de semana")\n\t}\n}',
            recursos: ['https://go.dev/tour/flowcontrol/1', 'https://gobyexample.com/for'],
          },
          experimentacao: {
            desafio: 'Implemente FizzBuzz em Go: para números de 1 a 100, imprima "Fizz" se divisível por 3, "Buzz" se por 5, "FizzBuzz" se por ambos.',
            dicas: [
              'Use switch com condições (switch { case ... })',
              'O operador módulo é %',
              'Teste a ordem das condições',
            ],
          },
          socializacao: {
            discussao: 'Por que Go tem apenas o for como laço? Isso é uma limitação ou vantagem?',
            pontos: [
              'Simplicidade da linguagem',
              'for range unifica iteração',
              'Comparação com while/do-while de outras linguagens',
            ],
            diasDesafio: 'Dias 8–18',
            sugestaoBlog: 'Controle de fluxo em Go: o único for que você vai precisar',
            hashtagsExtras: '#golang #controlflow',

          },
          aplicacao: {
            projeto: 'Crie um jogo de adivinhação: o programa escolhe um número aleatório e o jogador tenta adivinhar.',
            requisitos: [
              'Usar math/rand para gerar número aleatório',
              'Loop principal com for',
              'Dar dicas "maior" ou "menor"',
              'Contar tentativas',
            ],
            criterios: ['Jogo funcional', 'Tratamento de entrada inválida', 'Boa experiência do usuário'],
          },
        },
      },
      {
        id: 'found-ponteiros',
        title: 'Ponteiros',
        description: 'Entenda ponteiros e referências em Go.',
        estimatedMinutes: 40,
        mesa: {
          modelagem: {
            explicacao: 'Ponteiros armazenam endereços de memória. Use `&` para obter o endereço e `*` para acessar o valor. Go não tem aritmética de ponteiros (ao contrário de C). Ponteiros são essenciais para modificar valores em funções e evitar cópias de structs grandes.',
            codeExample: 'package main\n\nimport "fmt"\n\nfunc duplicar(n *int) {\n\t*n = *n * 2\n}\n\nfunc main() {\n\tx := 10\n\tfmt.Println("Antes:", x)   // 10\n\n\tduplicar(&x)\n\tfmt.Println("Depois:", x)  // 20\n\n\t// Ponteiro nil\n\tvar p *int\n\tfmt.Println(p) // <nil>\n\n\t// new() aloca e retorna ponteiro\n\ty := new(int)\n\t*y = 42\n\tfmt.Println(*y) // 42\n}',
            recursos: ['https://go.dev/tour/moretypes/1', 'https://gobyexample.com/pointers'],
          },
          experimentacao: {
            desafio: 'Crie funções que modifiquem slices e structs via ponteiros. Compare o comportamento de passar por valor vs ponteiro.',
            dicas: [
              'Slices já são referências internamente',
              'Structs são copiados por valor — use ponteiro para modificar',
              'Compare tamanho em memória: struct grande vs ponteiro',
            ],
          },
          socializacao: {
            discussao: 'Quando usar ponteiro vs valor em Go?',
            pontos: [
              'Structs grandes devem ser passados por ponteiro',
              'Tipos pequenos (int, bool) geralmente por valor',
              'Nil safety e zero values',
            ],
            diasDesafio: 'Dias 8–18',
            sugestaoBlog: 'Ponteiros em Go: quando e como usar sem se perder',
            hashtagsExtras: '#golang #pointers #memory',

          },
          aplicacao: {
            projeto: 'Implemente uma linked list simples usando ponteiros.',
            requisitos: [
              'Struct Node com valor e ponteiro para próximo',
              'Funções: inserir, buscar, remover, imprimir',
              'Tratamento de lista vazia',
            ],
            criterios: ['Ponteiros usados corretamente', 'Sem memory leaks (Go tem GC)', 'Testes básicos'],
          },
        },
      },
      {
        id: 'found-funcoes-structs',
        title: 'Funções, Structs, Métodos, Interfaces e Generics',
        description: 'Os blocos fundamentais da programação em Go.',
        estimatedMinutes: 60,
        mesa: {
          modelagem: {
            explicacao: 'Go suporta múltiplos retornos, funções anônimas, closures. Structs são os "objetos" do Go. Métodos são funções com receiver. Interfaces são contratos implícitos. Generics (Go 1.18+) permitem código paramétrico.',
            codeExample: 'package main\n\nimport "fmt"\n\n// Struct\ntype Pessoa struct {\n\tNome  string\n\tIdade int\n}\n\n// Método\nfunc (p Pessoa) Saudacao() string {\n\treturn fmt.Sprintf("Olá, sou %s!", p.Nome)\n}\n\n// Interface\ntype Apresentavel interface {\n\tSaudacao() string\n}\n\n// Generics\nfunc Map[T any, U any](slice []T, fn func(T) U) []U {\n\tresult := make([]U, len(slice))\n\tfor i, v := range slice {\n\t\tresult[i] = fn(v)\n\t}\n\treturn result\n}\n\nfunc main() {\n\tp := Pessoa{Nome: "Gopher", Idade: 15}\n\tfmt.Println(p.Saudacao())\n\n\tnums := []int{1, 2, 3}\n\tdobros := Map(nums, func(n int) int { return n * 2 })\n\tfmt.Println(dobros)\n}',
            recursos: [
              'https://go.dev/tour/methods/1',
              'https://gobyexample.com/interfaces',
              'https://go.dev/doc/tutorial/generics',
            ],
          },
          experimentacao: {
            desafio: 'Crie uma interface Shape com método Area() e implemente para Circle e Rectangle. Depois, crie uma função genérica que filtre slices.',
            dicas: [
              'Interfaces são satisfeitas implicitamente',
              'Use math.Pi para cálculos',
              'Generics usam [T any] ou constraints específicas',
            ],
          },
          socializacao: {
            discussao: 'Como interfaces implícitas do Go se comparam com Java/TypeScript? Generics chegou tarde no Go — valeu a pena esperar?',
            pontos: [
              'Duck typing compilado',
              'Interface vazia (any) vs interface específica',
              'Limites das generics no Go vs templates C++',
            ],
            diasDesafio: 'Dias 8–18',
            sugestaoBlog: 'Interfaces implícitas e Generics em Go: duck typing compilado e type safety',
            hashtagsExtras: '#golang #interfaces #generics',

          },
          aplicacao: {
            projeto: 'Crie um mini-framework de formas geométricas com cálculo de área e perímetro.',
            requisitos: [
              'Interface Shape com Area() e Perimeter()',
              'Pelo menos 3 formas implementadas',
              'Função genérica para somar áreas de qualquer slice de Shapes',
            ],
            criterios: ['Interfaces usadas corretamente', 'Código reutilizável', 'Testes unitários'],
          },
        },
      },
      {
        id: 'found-packages',
        title: 'Packages, Módulos e Workspaces',
        description: 'Organização de código, go mod, e go work.',
        estimatedMinutes: 40,
        mesa: {
          modelagem: {
            explicacao: 'Packages organizam código. Módulos (go.mod) gerenciam dependências. Cada diretório é um package. Nomes exportados começam com maiúscula. `go mod init`, `go mod tidy`, `go get` são comandos essenciais. Workspaces (go.work) permitem trabalhar com múltiplos módulos locais.',
            codeExample: '# Criar módulo\ngo mod init github.com/usuario/projeto\n\n# Adicionar dependência\ngo get github.com/gin-gonic/gin\n\n# Limpar dependências\ngo mod tidy\n\n# Workspace (multi-módulo)\ngo work init ./modulo1 ./modulo2',
            recursos: ['https://go.dev/ref/mod', 'https://go.dev/doc/tutorial/workspaces'],
          },
          experimentacao: {
            desafio: 'Crie um projeto com múltiplos packages: main, models, utils. Exporte e importe funções entre eles.',
            dicas: [
              'Cada pasta = um package',
              'Apenas nomes com letra maiúscula são exportados',
              'Use go mod init para inicializar',
              'internal/ cria packages privados',
            ],
          },
          socializacao: {
            discussao: 'Como a convenção de exportação por maiúscula afeta o design de APIs em Go?',
            pontos: [
              'Simplicidade vs flexibilidade',
              'Encapsulamento sem palavras-chave',
              'Package internal/ para código privado',
            ],
            diasDesafio: 'Dias 8–18',
            sugestaoBlog: 'Packages e módulos em Go: organizando projetos do jeito certo',
            hashtagsExtras: '#golang #modules #packages',

          },
          aplicacao: {
            projeto: 'Crie um projeto Go com 3+ packages e publique como módulo.',
            requisitos: [
              'Package main, internal e pelo menos 1 público',
              'go.mod configurado corretamente',
              'README com instruções de uso',
            ],
            criterios: ['Estrutura de packages correta', 'Imports funcionais', 'Compilação sem erros'],
          },
        },
      },
    ],
  },
  {
    id: 'pacotes-importantes',
    title: 'Pacotes Importantes',
    description: 'Domine os pacotes essenciais da standard library do Go.',
    icon: 'Package',
    color: '#CE3262',
    lessons: [
      {
        id: 'pkg-arquivos',
        title: 'Manipulação de Arquivos',
        description: 'Leitura, escrita e manipulação de arquivos com os, io e bufio.',
        estimatedMinutes: 40,
        mesa: {
          modelagem: {
            explicacao: 'Go usa os pacotes `os`, `io` e `bufio` para I/O. `os.Open` abre arquivos, `os.Create` cria. Sempre feche arquivos com `defer file.Close()`. `bufio.Scanner` é ideal para leitura linha a linha.',
            codeExample: 'package main\n\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\n\nfunc main() {\n\t// Escrever\n\tf, _ := os.Create("teste.txt")\n\tdefer f.Close()\n\tf.WriteString("Olá, arquivo!\\n")\n\n\t// Ler\n\tfile, _ := os.Open("teste.txt")\n\tdefer file.Close()\n\tscanner := bufio.NewScanner(file)\n\tfor scanner.Scan() {\n\t\tfmt.Println(scanner.Text())\n\t}\n}',
            recursos: ['https://gobyexample.com/reading-files', 'https://gobyexample.com/writing-files'],
          },
          experimentacao: {
            desafio: 'Crie um programa que leia um arquivo CSV e imprima os dados formatados em tabela.',
            dicas: ['Use encoding/csv ou bufio.Scanner', 'Trate erros de arquivo não encontrado', 'Use fmt.Printf para alinhar colunas'],
          },
          socializacao: {
            discussao: 'Por que defer é tão importante ao trabalhar com arquivos?',
            pontos: ['Garantia de cleanup', 'Ordem LIFO do defer', 'Comparação com try-finally'],
            diasDesafio: 'Dias 19–24',
            sugestaoBlog: 'Manipulação de arquivos em Go: os, io, bufio e o poder do defer',
            hashtagsExtras: '#golang #io #files',

          },
          aplicacao: {
            projeto: 'Implemente um programa que monitora mudanças em um arquivo de log.',
            requisitos: ['Ler arquivo continuamente', 'Detectar novas linhas', 'Exibir em tempo real'],
            criterios: ['Tratamento de erros robusto', 'Uso correto de defer', 'Eficiência de memória'],
          },
        },
      },
      {
        id: 'pkg-http-json',
        title: 'HTTP e JSON',
        description: 'Chamadas HTTP e manipulação de JSON.',
        estimatedMinutes: 45,
        mesa: {
          modelagem: {
            explicacao: 'O pacote `net/http` faz chamadas HTTP. `encoding/json` serializa/deserializa JSON. Use struct tags para mapear campos JSON.',
            codeExample: 'package main\n\nimport (\n\t"encoding/json"\n\t"fmt"\n\t"net/http"\n\t"io"\n)\n\ntype Post struct {\n\tID    int    `json:"id"`\n\tTitle string `json:"title"`\n\tBody  string `json:"body"`\n}\n\nfunc main() {\n\tresp, _ := http.Get("https://jsonplaceholder.typicode.com/posts/1")\n\tdefer resp.Body.Close()\n\n\tbody, _ := io.ReadAll(resp.Body)\n\n\tvar post Post\n\tjson.Unmarshal(body, &post)\n\n\tfmt.Printf("Título: %s\\n", post.Title)\n}',
            recursos: ['https://gobyexample.com/http-clients', 'https://gobyexample.com/json'],
          },
          experimentacao: {
            desafio: 'Consuma uma API pública (ex: ViaCEP) e exiba os dados de um CEP informado pelo usuário.',
            dicas: ['ViaCEP: https://viacep.com.br/ws/{cep}/json/', 'Use struct tags para mapear JSON', 'Trate status codes HTTP'],
          },
          socializacao: {
            discussao: 'Como Go trata erros HTTP comparado com try-catch de outras linguagens?',
            pontos: ['Erro explícito vs exceção', 'Status codes vs err != nil', 'Context para timeout'],
            diasDesafio: 'Dias 19–24',
            sugestaoBlog: 'HTTP e JSON em Go: consumindo APIs e tratando erros sem exceções',
            hashtagsExtras: '#golang #http #json #api',

          },
          aplicacao: {
            projeto: 'Crie o sistema "Busca CEP" que busca endereço por CEP.',
            requisitos: ['Consumir API ViaCEP', 'Exibir resultado formatado', 'Tratar CEP inválido'],
            criterios: ['Tratamento de erros HTTP', 'JSON parseado corretamente', 'Código limpo e idiomatic'],
          },
        },
      },
      {
        id: 'pkg-http-server',
        title: 'Servidores HTTP e Templates',
        description: 'Criando servidores HTTP, multiplexers e templates dinâmicos.',
        estimatedMinutes: 50,
        mesa: {
          modelagem: {
            explicacao: 'Go tem um servidor HTTP robusto na standard library. `http.HandleFunc` registra rotas. `http.ListenAndServe` inicia o servidor. Templates com `html/template` renderizam HTML seguro.',
            codeExample: 'package main\n\nimport (\n\t"html/template"\n\t"net/http"\n)\n\nfunc main() {\n\thttp.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {\n\t\ttmpl := template.Must(template.New("index").Parse(`\n\t\t\t<h1>Olá, {{.Nome}}!</h1>\n\t\t`))\n\t\ttmpl.Execute(w, map[string]string{"Nome": "Gopher"})\n\t})\n\n\thttp.ListenAndServe(":8080", nil)\n}',
            recursos: ['https://gobyexample.com/http-servers', 'https://pkg.go.dev/html/template'],
          },
          experimentacao: {
            desafio: 'Crie um servidor HTTP com 3 rotas diferentes e use templates para renderizar HTML.',
            dicas: ['Use http.NewServeMux() para multiplexer', 'Templates: ParseFiles para arquivos .html', 'Sirva arquivos estáticos com http.FileServer'],
          },
          socializacao: {
            discussao: 'Quando usar a standard library vs frameworks como Gin ou Chi?',
            pontos: ['Standard library é suficiente para muitos casos', 'Frameworks adicionam roteamento, middleware', 'Performance: Go já é rápido por padrão'],
            diasDesafio: 'Dias 19–24',
            sugestaoBlog: 'Servidores HTTP em Go: net/http, templates e quando usar frameworks',
            hashtagsExtras: '#golang #http #server #webdev',

          },
          aplicacao: {
            projeto: 'Crie um servidor de arquivos com upload, download e listagem.',
            requisitos: ['Servir arquivos estáticos', 'Endpoint de upload', 'Template com listagem'],
            criterios: ['Multiplexer configurado', 'Templates funcionais', 'Segurança básica'],
          },
        },
      },
      {
        id: 'pkg-context',
        title: 'Pacote Context',
        description: 'Context para cancelamento, timeouts, deadlines e propagação de valores.',
        estimatedMinutes: 45,
        mesa: {
          modelagem: {
            explicacao: 'O pacote context gerencia ciclo de vida de operações: cancelamento, timeouts e deadlines. É fundamental em servidores HTTP e chamadas entre serviços. context.Background() é a raiz, context.WithTimeout/WithCancel criam derivados.',
            codeExample: 'package main\n\nimport (\n\t"context"\n\t"fmt"\n\t"time"\n)\n\nfunc operacaoLenta(ctx context.Context) error {\n\tselect {\n\tcase <-time.After(5 * time.Second):\n\t\tfmt.Println("Operação concluída")\n\t\treturn nil\n\tcase <-ctx.Done():\n\t\treturn ctx.Err()\n\t}\n}\n\nfunc main() {\n\tctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)\n\tdefer cancel()\n\n\tif err := operacaoLenta(ctx); err != nil {\n\t\tfmt.Println("Timeout:", err)\n\t}\n}',
            recursos: ['https://pkg.go.dev/context', 'https://gobyexample.com/context'],
          },
          experimentacao: {
            desafio: 'Crie um servidor HTTP onde cada request tem um timeout de 3 segundos usando context.',
            dicas: ['r.Context() retorna o context da request', 'WithTimeout para limitar operações', 'Sempre chame cancel() com defer'],
          },
          socializacao: {
            discussao: 'Por que context é tão importante em microsserviços Go?',
            pontos: ['Propagação de cancelamento entre serviços', 'Request-scoped values', 'Avoid goroutine leaks'],
            diasDesafio: 'Dias 19–24',
            sugestaoBlog: 'O pacote context em Go: timeout, cancelamento e propagação em microsserviços',
            hashtagsExtras: '#golang #context #microservices',

          },
          aplicacao: {
            projeto: 'Implemente um cliente HTTP com retry, timeout e cancelamento usando context.',
            requisitos: ['Context com timeout configurável', 'Retry com backoff', 'Cancelamento propagado'],
            criterios: ['Context usado corretamente', 'Sem goroutine leaks', 'Tratamento de erros robusto'],
          },
        },
      },
    ],
  },
  {
    id: 'concorrencia',
    title: 'Concorrência e Multithreading',
    description: 'Goroutines, channels, select, mutex e padrões de concorrência.',
    icon: 'GitBranch',
    color: '#F6A623',
    lessons: [
      {
        id: 'conc-conceitos',
        title: 'Conceitos de Concorrência e Paralelismo',
        description: 'Entenda a diferença entre concorrência e paralelismo e como Go aborda cada um.',
        estimatedMinutes: 35,
        mesa: {
          modelagem: {
            explicacao: 'Concorrência é sobre lidar com muitas coisas ao mesmo tempo (estrutura). Paralelismo é sobre fazer muitas coisas ao mesmo tempo (execução). Go favorece concorrência com goroutines e channels. O Go scheduler multiplica M goroutines em N threads do OS.',
            recursos: ['https://go.dev/blog/waza-talk', 'https://gobyexample.com/goroutines'],
          },
          experimentacao: {
            desafio: 'Crie um programa que demonstre a diferença entre execução sequencial e concorrente de 5 tarefas.',
            dicas: ['Use time.Now() para medir tempo', 'go func() para goroutines', 'sync.WaitGroup para esperar conclusão'],
          },
          socializacao: {
            discussao: 'Rob Pike disse "Concorrência não é paralelismo". O que isso significa na prática?',
            pontos: ['Design de software vs execução de hardware', 'GOMAXPROCS e threads', 'CSP model do Go'],
            diasDesafio: 'Dias 25–34',
            sugestaoBlog: 'Concorrência vs Paralelismo em Go: entendendo o CSP model',
            hashtagsExtras: '#golang #concurrency #goroutines',

          },
          aplicacao: {
            projeto: 'Crie um benchmark comparando execução sequencial vs concorrente para processamento de N tarefas.',
            requisitos: ['Medir tempo de ambas abordagens', 'Variar número de tarefas', 'Apresentar resultados'],
            criterios: ['Medição precisa', 'Goroutines usadas corretamente', 'Análise dos resultados'],
          },
        },
      },
      {
        id: 'conc-goroutines',
        title: 'Goroutines e Channels',
        description: 'Goroutines, channels, buffers e select.',
        estimatedMinutes: 50,
        mesa: {
          modelagem: {
            explicacao: 'Goroutines são threads leves gerenciadas pelo runtime Go. Channels são pipes tipados para comunicação entre goroutines. Channels podem ser buffered (assíncronos) ou unbuffered (síncronos). Select permite esperar múltiplos channels.',
            codeExample: 'package main\n\nimport "fmt"\n\nfunc produtor(ch chan<- int) {\n\tfor i := 0; i < 5; i++ {\n\t\tch <- i\n\t}\n\tclose(ch)\n}\n\nfunc main() {\n\tch := make(chan int, 3) // buffered\n\tgo produtor(ch)\n\n\tfor v := range ch {\n\t\tfmt.Println("Recebido:", v)\n\t}\n}',
            recursos: ['https://go.dev/tour/concurrency/1', 'https://gobyexample.com/channels'],
          },
          experimentacao: {
            desafio: 'Implemente o padrão fan-out/fan-in: distribua trabalho entre N workers e colete resultados.',
            dicas: ['Fan-out: envie para múltiplos workers', 'Fan-in: colete de múltiplos channels em um', 'Use select para multiplexar channels'],
          },
          socializacao: {
            discussao: 'Channels vs locks (mutex) — quando usar cada um?',
            pontos: ['"Share memory by communicating"', 'Channels para coordenação, mutex para proteção de estado', 'Deadlocks com channels'],
            diasDesafio: 'Dias 25–34',
            sugestaoBlog: 'Goroutines e Channels em Go: pipelines, fan-out e o idioma CSP',
            hashtagsExtras: '#golang #channels #concurrency',

          },
          aplicacao: {
            projeto: 'Implemente um pipeline de processamento de dados com 3 estágios usando channels.',
            requisitos: ['Estágio 1: gerar dados', 'Estágio 2: transformar', 'Estágio 3: agregar resultados', 'Usar goroutines e channels'],
            criterios: ['Pipeline funcional', 'Goroutines finalizadas corretamente', 'Channels fechados'],
          },
        },
      },
      {
        id: 'conc-sync',
        title: 'WaitGroups, Mutex e Race Conditions',
        description: 'Sincronização avançada e prevenção de data races.',
        estimatedMinutes: 45,
        mesa: {
          modelagem: {
            explicacao: 'WaitGroups esperam N goroutines. Mutex protege acesso a dados compartilhados. O flag -race detecta data races. Operações atômicas (sync/atomic) são alternativas leves ao mutex.',
            codeExample: 'package main\n\nimport (\n\t"fmt"\n\t"sync"\n)\n\nfunc main() {\n\tvar mu sync.Mutex\n\tvar wg sync.WaitGroup\n\tcontador := 0\n\n\tfor i := 0; i < 1000; i++ {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tmu.Lock()\n\t\t\tcontador++\n\t\t\tmu.Unlock()\n\t\t}()\n\t}\n\n\twg.Wait()\n\tfmt.Println("Contador:", contador) // 1000\n}',
            recursos: ['https://gobyexample.com/mutexes', 'https://gobyexample.com/waitgroups'],
          },
          experimentacao: {
            desafio: 'Crie um programa com data race, detecte com `go run -race`, e corrija com mutex ou atomic.',
            dicas: ['go run -race main.go', 'sync.Mutex para seções críticas', 'atomic.AddInt64 para contadores'],
          },
          socializacao: {
            discussao: 'Quais são os padrões comuns de bugs de concorrência em Go?',
            pontos: ['Goroutine leaks', 'Deadlocks', 'Data races', 'Closure capture de variáveis de loop'],
            diasDesafio: 'Dias 25–34',
            sugestaoBlog: 'WaitGroups, Mutex e race conditions em Go: detectando e corrigindo bugs',
            hashtagsExtras: '#golang #mutex #racecondition',

          },
          aplicacao: {
            projeto: 'Implemente um rate limiter thread-safe usando sync primitives.',
            requisitos: ['Limitar N requests por segundo', 'Thread-safe com mutex ou channels', 'Testes com go -race'],
            criterios: ['Sem data races', 'Rate limiting funcional', 'Testes passando'],
          },
        },
      },
      {
        id: 'conc-workers',
        title: 'Workers e Load Balancer',
        description: 'Padrões de workers utilizando channels e load balancing.',
        estimatedMinutes: 50,
        mesa: {
          modelagem: {
            explicacao: 'O padrão Worker Pool distribui trabalho entre N goroutines fixas. Jobs entram por um channel, resultados saem por outro. Isso controla concorrência máxima e evita sobrecarga.',
            codeExample: 'package main\n\nimport "fmt"\n\nfunc worker(id int, jobs <-chan int, results chan<- int) {\n\tfor j := range jobs {\n\t\tfmt.Printf("Worker %d processando job %d\\n", id, j)\n\t\tresults <- j * 2\n\t}\n}\n\nfunc main() {\n\tjobs := make(chan int, 100)\n\tresults := make(chan int, 100)\n\n\t// Iniciar 3 workers\n\tfor w := 1; w <= 3; w++ {\n\t\tgo worker(w, jobs, results)\n\t}\n\n\t// Enviar 9 jobs\n\tfor j := 1; j <= 9; j++ {\n\t\tjobs <- j\n\t}\n\tclose(jobs)\n\n\t// Coletar resultados\n\tfor r := 1; r <= 9; r++ {\n\t\tfmt.Println(<-results)\n\t}\n}',
            recursos: ['https://gobyexample.com/worker-pools'],
          },
          experimentacao: {
            desafio: 'Implemente um worker pool que faz download concorrente de múltiplas URLs e salva o resultado.',
            dicas: ['Limite o número de workers', 'Use context para timeout por request', 'Trate erros por worker'],
          },
          socializacao: {
            discussao: 'Como dimensionar o número de workers? Quando usar pool fixo vs goroutines sob demanda?',
            pontos: ['CPU-bound vs I/O-bound', 'GOMAXPROCS para referência', 'Semáforos com channels buffered'],
            diasDesafio: 'Dias 25–34',
            sugestaoBlog: 'Worker Pool e Load Balancer em Go: padrões práticos de concorrência',
            hashtagsExtras: '#golang #workerpool #patterns',

          },
          aplicacao: {
            projeto: 'Crie um load balancer simples que distribui requests HTTP entre backends.',
            requisitos: ['Pool de workers configurável', 'Round-robin ou least-connections', 'Graceful shutdown'],
            criterios: ['Distribuição equilibrada', 'Tratamento de falhas', 'Shutdown limpo'],
          },
        },
      },
    ],
  },
  {
    id: 'apis',
    title: 'Desenvolvimento de APIs',
    description: 'APIs REST completas com Go: routers, middlewares, JWT, Swagger.',
    icon: 'Globe',
    color: '#7B68EE',
    lessons: [
      {
        id: 'api-http-mux',
        title: 'HTTP Server e Mux',
        description: 'Revisão de servidores HTTP e multiplexers.',
        estimatedMinutes: 35,
        mesa: {
          modelagem: {
            explicacao: 'A partir do Go 1.22, o ServeMux padrão suporta padrões de rota avançados como métodos HTTP e parâmetros de path. Para projetos maiores, frameworks como Chi ou Gin adicionam middleware routing.',
            codeExample: 'package main\n\nimport (\n\t"fmt"\n\t"net/http"\n)\n\nfunc main() {\n\tmux := http.NewServeMux()\n\n\t// Go 1.22+: método e path params\n\tmux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {\n\t\tid := r.PathValue("id")\n\t\tfmt.Fprintf(w, "User: %s", id)\n\t})\n\n\thttp.ListenAndServe(":8080", mux)\n}',
            recursos: ['https://pkg.go.dev/net/http'],
          },
          experimentacao: {
            desafio: 'Crie uma API CRUD básica para "produtos" usando apenas a standard library.',
            dicas: ['Use map como "banco de dados" em memória', 'Parse JSON do body com json.NewDecoder', 'Retorne status codes corretos'],
          },
          socializacao: {
            discussao: 'Standard library vs frameworks: qual a melhor abordagem para APIs?',
            pontos: ['Go 1.22 melhorou muito o ServeMux', 'Middleware é mais fácil com frameworks', 'Learning standard library primeiro é importante'],
            diasDesafio: 'Dias 49–56',
            sugestaoBlog: 'REST API em Go: stdlib vs Chi vs Gin — comparando abordagens',
            hashtagsExtras: '#golang #api #rest #webdev',

          },
          aplicacao: {
            projeto: 'API REST de tarefas (todo) com CRUD completo usando standard library.',
            requisitos: ['GET/POST/PUT/DELETE', 'JSON request/response', 'Status codes corretos'],
            criterios: ['RESTful', 'Tratamento de erros', 'Código organizado'],
          },
        },
      },
      {
        id: 'api-chi',
        title: 'Trabalhando com Chi',
        description: 'Router Chi: middleware, subrouters e padrões avançados.',
        estimatedMinutes: 40,
        mesa: {
          modelagem: {
            explicacao: 'Chi é um router leve e idiomatico compatível com net/http. Suporta middleware chain, subrouters, route groups e context de URL params.',
            codeExample: 'package main\n\nimport (\n\t"net/http"\n\t"github.com/go-chi/chi/v5"\n\t"github.com/go-chi/chi/v5/middleware"\n)\n\nfunc main() {\n\tr := chi.NewRouter()\n\tr.Use(middleware.Logger)\n\tr.Use(middleware.Recoverer)\n\n\tr.Route("/api/v1", func(r chi.Router) {\n\t\tr.Get("/users", listUsers)\n\t\tr.Post("/users", createUser)\n\t\tr.Route("/users/{id}", func(r chi.Router) {\n\t\t\tr.Get("/", getUser)\n\t\t\tr.Put("/", updateUser)\n\t\t\tr.Delete("/", deleteUser)\n\t\t})\n\t})\n\n\thttp.ListenAndServe(":8080", r)\n}',
            recursos: ['https://github.com/go-chi/chi'],
          },
          experimentacao: {
            desafio: 'Migre a API do exercício anterior para Chi, adicionando middleware de logging e recovery.',
            dicas: ['chi.URLParam(r, "id") para path params', 'middleware.Logger adiciona logging', 'r.Group para agrupar rotas'],
          },
          socializacao: {
            discussao: 'Chi vs Gin vs Echo vs Fiber — qual framework escolher?',
            pontos: ['Chi: idiomático, compatível net/http', 'Gin: popular, rápido, muitas features', 'Echo: similar ao Express.js', 'Fiber: inspirado em Express, usa fasthttp'],
            diasDesafio: 'Dias 49–56',
            sugestaoBlog: 'Dominando o Chi Router: middleware, subrouters e roteamento avançado',
            hashtagsExtras: '#golang #chi #router #api',

          },
          aplicacao: {
            projeto: 'API RESTful completa com Chi, incluindo versionamento e middleware customizado.',
            requisitos: ['Subrouters para versionamento', 'Middleware de CORS', 'Middleware de rate limiting'],
            criterios: ['Estrutura de rotas clara', 'Middleware funcional', 'Código idiomático'],
          },
        },
      },
      {
        id: 'api-jwt',
        title: 'Autenticação com JWT',
        description: 'Implementação de autenticação e autorização com JSON Web Tokens.',
        estimatedMinutes: 45,
        mesa: {
          modelagem: {
            explicacao: 'JWT (JSON Web Token) é um padrão para autenticação stateless. Token = header.payload.signature. Em Go, use a lib golang-jwt para gerar e validar tokens. Middleware intercepta requests e valida o token no header Authorization.',
            codeExample: 'package main\n\nimport (\n\t"time"\n\t"github.com/golang-jwt/jwt/v5"\n)\n\nvar jwtSecret = []byte("sua-chave-secreta")\n\nfunc gerarToken(userID string) (string, error) {\n\tclaims := jwt.MapClaims{\n\t\t"sub": userID,\n\t\t"exp": time.Now().Add(24 * time.Hour).Unix(),\n\t\t"iat": time.Now().Unix(),\n\t}\n\ttoken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)\n\treturn token.SignedString(jwtSecret)\n}',
            recursos: ['https://github.com/golang-jwt/jwt', 'https://jwt.io/'],
          },
          experimentacao: {
            desafio: 'Crie um middleware de autenticação JWT que proteja rotas específicas da API.',
            dicas: ['Token no header: Authorization: Bearer <token>', 'Middleware valida e extrai claims', 'Use context para passar dados do token'],
          },
          socializacao: {
            discussao: 'JWT vs Sessions: quando usar cada abordagem?',
            pontos: ['Stateless vs Stateful', 'Revogação de tokens', 'Refresh tokens'],
            diasDesafio: 'Dias 49–56',
            sugestaoBlog: 'Autenticação JWT em Go: do login ao refresh token com segurança',
            hashtagsExtras: '#golang #jwt #auth #security',

          },
          aplicacao: {
            projeto: 'Sistema completo de autenticação: register, login, refresh token e rotas protegidas.',
            requisitos: ['Registro de usuário com hash de senha', 'Login retornando JWT', 'Middleware de autenticação', 'Refresh token'],
            criterios: ['Senhas hasheadas (bcrypt)', 'Tokens com expiração', 'Rotas protegidas funcionais'],
          },
        },
      },
      {
        id: 'api-swagger',
        title: 'Documentação com Swagger',
        description: 'Documentando APIs com Swagger/OpenAPI.',
        estimatedMinutes: 35,
        mesa: {
          modelagem: {
            explicacao: 'Swagger (OpenAPI) documenta APIs automaticamente a partir de anotações no código. Em Go, a lib swaggo gera documentação a partir de comments. O endpoint /swagger/ serve a interface interativa.',
            recursos: ['https://github.com/swaggo/swag', 'https://swagger.io/specification/'],
          },
          experimentacao: {
            desafio: 'Adicione anotações Swagger em todas as rotas da API e gere a documentação.',
            dicas: ['Instale: go install github.com/swaggo/swag/cmd/swag@latest', 'Execute: swag init', 'Anote handlers com // @Summary, @Tags, etc'],
          },
          socializacao: {
            discussao: 'Documentação automática vs manual: qual é mais sustentável?',
            pontos: ['Swagger mantém docs sincronizadas com código', 'Necessidade de disciplina nas anotações', 'Alternativas: Postman collections, Insomnia'],
            diasDesafio: 'Dias 49–56',
            sugestaoBlog: 'Documentando APIs Go com Swagger: guia prático do swaggo',
            hashtagsExtras: '#golang #swagger #openapi #docs',

          },
          aplicacao: {
            projeto: 'Documente completamente a API com Swagger e publique a interface interativa.',
            requisitos: ['Todas as rotas documentadas', 'Modelos de request/response', 'Exemplos de uso'],
            criterios: ['Documentação completa', 'Swagger UI funcional', 'Exemplos testáveis'],
          },
        },
      },
    ],
  },
  {
    id: 'testes',
    title: 'Testes Automatizados',
    description: 'Testes unitários, de integração, mocks, benchmarks e fuzzing.',
    icon: 'TestTube',
    color: '#2ECC71',
    lessons: [
      {
        id: 'test-basico',
        title: 'Iniciando com Testes',
        description: 'Framework de testes do Go, asserções e testes em batch.',
        estimatedMinutes: 40,
        mesa: {
          modelagem: {
            explicacao: 'Go tem teste built-in: arquivos _test.go, funções Test*(t *testing.T). Use t.Error/t.Fatal para falhas. go test ./... executa todos. Table-driven tests são o padrão idiomático.',
            codeExample: 'package math\n\nimport "testing"\n\nfunc Soma(a, b int) int { return a + b }\n\nfunc TestSoma(t *testing.T) {\n\t// Table-driven tests\n\tcases := []struct{\n\t\ta, b, want int\n\t}{\n\t\t{1, 2, 3},\n\t\t{0, 0, 0},\n\t\t{-1, 1, 0},\n\t}\n\n\tfor _, tc := range cases {\n\t\tgot := Soma(tc.a, tc.b)\n\t\tif got != tc.want {\n\t\t\tt.Errorf("Soma(%d, %d) = %d; want %d", tc.a, tc.b, got, tc.want)\n\t\t}\n\t}\n}',
            recursos: ['https://go.dev/doc/tutorial/add-a-test', 'https://gobyexample.com/testing'],
          },
          experimentacao: {
            desafio: 'Escreva testes table-driven para uma função de validação de email.',
            dicas: ['Use t.Run para subtestes nomeados', 'Inclua edge cases', 'go test -v para output detalhado'],
          },
          socializacao: {
            discussao: 'Table-driven tests: por que são o padrão em Go?',
            pontos: ['Fáceis de estender', 'Um padrão para muitos cenários', 'Subtestes com t.Run'],
            diasDesafio: 'Dias 57–64',
            sugestaoBlog: 'Table-driven tests em Go: o padrão idiomático de testes que você precisa conhecer',
            hashtagsExtras: '#golang #testing #tdd',

          },
          aplicacao: {
            projeto: 'Crie uma suite de testes completa para um pacote de utilitários de strings.',
            requisitos: ['Table-driven tests', 'Subtestes nomeados', 'Cobertura > 80%'],
            criterios: ['Testes passando', 'Edge cases cobertos', 'go test -cover mostra boa cobertura'],
          },
        },
      },
      {
        id: 'test-avancado',
        title: 'Mocks, Fuzzing e Benchmarks',
        description: 'Testify, mocks, fuzzing e testes de performance.',
        estimatedMinutes: 50,
        mesa: {
          modelagem: {
            explicacao: 'Testify adiciona assertions e mocks. Fuzzing (Go 1.18+) gera inputs aleatórios. Benchmarks medem performance com b.N iterações.',
            codeExample: '// Benchmark\nfunc BenchmarkSoma(b *testing.B) {\n\tfor i := 0; i < b.N; i++ {\n\t\tSoma(1, 2)\n\t}\n}\n\n// Fuzz\nfunc FuzzSoma(f *testing.F) {\n\tf.Add(1, 2)\n\tf.Fuzz(func(t *testing.T, a, b int) {\n\t\tresult := Soma(a, b)\n\t\tif result != a+b {\n\t\t\tt.Errorf("Soma(%d, %d) = %d", a, b, result)\n\t\t}\n\t})\n}',
            recursos: ['https://github.com/stretchr/testify', 'https://go.dev/doc/fuzz/'],
          },
          experimentacao: {
            desafio: 'Crie mocks para uma interface de Repository e escreva testes que não dependam de banco de dados.',
            dicas: ['Use testify/mock para gerar mocks', 'Ou crie mocks manuais implementando a interface', 'go test -bench=. para benchmarks'],
          },
          socializacao: {
            discussao: 'Qual o nível ideal de cobertura de testes? 100% é realista?',
            pontos: ['Cobertura vs qualidade dos testes', 'Testes de mutação', 'ROI de cada tipo de teste'],
            diasDesafio: 'Dias 57–64',
            sugestaoBlog: 'Mocks, Fuzzing e Benchmarks em Go: testando além do básico',
            hashtagsExtras: '#golang #testing #fuzzing #benchmark',

          },
          aplicacao: {
            projeto: 'Adicione testes completos (unit, fuzz, benchmark) a um projeto existente.',
            requisitos: ['Mocks com Testify', 'Fuzzing para inputs de usuário', 'Benchmarks para funções críticas'],
            criterios: ['Suite completa', 'Mocks isolam dependências', 'Benchmarks documentados'],
          },
        },
      },
    ],
  },
  {
    id: 'banco-dados',
    title: 'Bancos de Dados',
    description: 'database/sql, GORM, migrations e SQLC.',
    icon: 'Database',
    color: '#E74C3C',
    lessons: [
      {
        id: 'db-basico',
        title: 'Go e Bancos de Dados',
        description: 'database/sql, conexões, queries e boas práticas de segurança.',
        estimatedMinutes: 45,
        mesa: {
          modelagem: {
            explicacao: 'O pacote database/sql fornece interface genérica para SQL. Drivers específicos (pq, mysql) implementam a conexão. Use prepared statements para prevenir SQL injection. Context controla timeouts.',
            codeExample: 'package main\n\nimport (\n\t"database/sql"\n\t"fmt"\n\t_ "github.com/lib/pq"\n)\n\nfunc main() {\n\tdb, err := sql.Open("postgres", "postgres://user:pass@localhost/dbname?sslmode=disable")\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer db.Close()\n\n\t// Prepared statement (previne SQL injection)\n\tvar nome string\n\terr = db.QueryRow("SELECT nome FROM users WHERE id = $1", 1).Scan(&nome)\n\tif err != nil {\n\t\tfmt.Println("Erro:", err)\n\t\treturn\n\t}\n\tfmt.Println("Nome:", nome)\n}',
            recursos: ['https://go.dev/doc/database/', 'https://gobyexample.com/'],
          },
          experimentacao: {
            desafio: 'Crie um CRUD completo com database/sql e PostgreSQL (ou SQLite).',
            dicas: ['Use ? ou $1 para parâmetros (nunca concatene strings)', 'db.Ping() verifica conexão', 'Rows.Close() é obrigatório'],
          },
          socializacao: {
            discussao: 'SQL puro vs ORM: qual abordagem é melhor para Go?',
            pontos: ['Performance vs produtividade', 'Type safety', 'Manutenabilidade de queries'],
            diasDesafio: 'Dias 65–72',
            sugestaoBlog: 'database/sql em Go: prepared statements, connection pooling e SQL injection',
            hashtagsExtras: '#golang #database #sql #postgres',

          },
          aplicacao: {
            projeto: 'Implemente um repositório de livros com database/sql.',
            requisitos: ['CRUD completo', 'Prepared statements', 'Connection pooling'],
            criterios: ['Sem SQL injection', 'Tratamento de erros', 'Performance adequada'],
          },
        },
      },
      {
        id: 'db-gorm-sqlc',
        title: 'GORM, Migrations e SQLC',
        description: 'ORM com GORM, migrations e geração de código com SQLC.',
        estimatedMinutes: 50,
        mesa: {
          modelagem: {
            explicacao: 'GORM é o ORM mais popular em Go. Migrations gerenciam schema do banco. SQLC gera código Go type-safe a partir de queries SQL — combina segurança de tipos com controle total das queries.',
            codeExample: '// GORM\ntype Product struct {\n\tgorm.Model\n\tNome  string  `gorm:"size:100;not null"`\n\tPreco float64 `gorm:"not null"`\n}\n\ndb.AutoMigrate(&Product{})\ndb.Create(&Product{Nome: "Go Book", Preco: 49.90})\n\nvar produto Product\ndb.First(&produto, 1)',
            recursos: ['https://gorm.io/', 'https://sqlc.dev/'],
          },
          experimentacao: {
            desafio: 'Migre o repositório anterior para GORM e depois crie uma versão com SQLC. Compare.',
            dicas: ['GORM: go get gorm.io/gorm', 'SQLC: defina queries em .sql e gere com sqlc generate', 'Compare linhas de código e type safety'],
          },
          socializacao: {
            discussao: 'GORM vs SQLC: quando usar cada um?',
            pontos: ['GORM: prototipagem rápida, relações complexas', 'SQLC: performance, queries otimizadas', 'Projetos podem usar ambos'],
            diasDesafio: 'Dias 65–72',
            sugestaoBlog: 'GORM vs SQLC em Go: qual ORM/query builder escolher para o seu projeto?',
            hashtagsExtras: '#golang #gorm #sqlc #orm',

          },
          aplicacao: {
            projeto: 'E-commerce simplificado com GORM: produtos, categorias e orders.',
            requisitos: ['Modelos com relacionamentos', 'Migrations automáticas', 'Queries otimizadas'],
            criterios: ['Relacionamentos corretos', 'Migrations funcionais', 'Queries eficientes'],
          },
        },
      },
    ],
  },
  {
    id: 'erros',
    title: 'Tratamento de Erros',
    description: 'Padrões idiomáticos de error handling: wrapping, multi-errors, erros estruturados e boas práticas.',
    icon: 'AlertCircle',
    color: '#E74C3C',
    lessons: [
      {
        id: 'erros-padroes',
        title: 'Padrões de Erro em Go',
        description: 'errors.New, fmt.Errorf, wrapping com %w e o idioma comma-ok.',
        estimatedMinutes: 40,
        mesa: {
          modelagem: {
            explicacao: 'Em Go, erros são valores — qualquer tipo que implementa a interface `error` (com método `Error() string`). O padrão idiomático é retornar `(T, error)` e verificar `if err != nil`. Com Go 1.13+, use `fmt.Errorf("contexto: %w", err)` para encapsular erros preservando a cadeia, e `errors.Is` / `errors.As` para verificar.',
            codeExample: 'package main\n\nimport (\n\t"errors"\n\t"fmt"\n)\n\n// Erro sentinela\nvar ErrNaoEncontrado = errors.New("registro não encontrado")\n\n// Erro customizado\ntype ErrValidacao struct {\n\tCampo   string\n\tMensagem string\n}\n\nfunc (e *ErrValidacao) Error() string {\n\treturn fmt.Sprintf("validação falhou no campo %s: %s", e.Campo, e.Mensagem)\n}\n\nfunc buscarUsuario(id int) error {\n\tif id <= 0 {\n\t\treturn &ErrValidacao{Campo: "id", Mensagem: "deve ser positivo"}\n\t}\n\tif id > 100 {\n\t\treturn fmt.Errorf("buscarUsuario(id=%d): %w", id, ErrNaoEncontrado)\n\t}\n\treturn nil\n}\n\nfunc main() {\n\tif err := buscarUsuario(200); err != nil {\n\t\t// unwrap com errors.Is\n\t\tif errors.Is(err, ErrNaoEncontrado) {\n\t\t\tfmt.Println("Usuário não existe")\n\t\t}\n\t\t// extrair tipo com errors.As\n\t\tvar ve *ErrValidacao\n\t\tif errors.As(err, &ve) {\n\t\t\tfmt.Printf("Campo inválido: %s\\n", ve.Campo)\n\t\t}\n\t}\n}',
            recursos: [
              'https://go.dev/blog/error-handling-and-go',
              'https://go.dev/blog/go1.13-errors',
              'https://gobyexample.com/errors',
              'https://go101.org/article/unofficial-faq.html',
            ],
          },
          experimentacao: {
            desafio: 'Crie um pacote de validação que retorne erros customizados com campos de contexto. Teste errors.Is e errors.As em diferentes cenários.',
            dicas: [
              'Crie pelo menos 3 tipos de erro customizados',
              'Use fmt.Errorf com %w para encapsular',
              'Teste: errors.Is(err, ErrSentinela)',
              'Teste: errors.As(err, &meuTipo)',
            ],
            codeTemplate: 'package validacao\n\nimport "errors"\n\nvar ErrCampoObrigatorio = errors.New("campo obrigatório")\n\ntype ErrTamanho struct {\n\tCampo string\n\tMin, Max, Got int\n}\n\nfunc (e *ErrTamanho) Error() string {\n\t// Implemente\n\treturn ""\n}\n\nfunc ValidarNome(nome string) error {\n\t// Implemente usando ErrCampoObrigatorio e ErrTamanho\n\treturn nil\n}',
          },
          socializacao: {
            discussao: 'Erros como valores vs exceções: qual abordagem é melhor para código de longa duração?',
            pontos: [
              'Erros explícitos forçam tratamento imediato',
              'Exceptions podem ser ignoradas acidentalmente',
              'Go encoraja "happy path" + tratamento explícito',
              'Comparar: try/catch em Java vs if err != nil em Go',
            ],
            diasDesafio: 'Dias 35–40',
            sugestaoBlog: 'Error handling idiomático em Go: wrapping, errors.Is, errors.As e boas práticas',
            hashtagsExtras: '#golang #errors #bestpractices',
          },
          aplicacao: {
            projeto: 'Crie um pacote de parsing de configuração que retorne erros ricos com contexto suficiente para debug sem stack trace manual.',
            requisitos: [
              'Erros sentinela para tipos de falha',
              'Erros customizados com campos de contexto',
              'Encapsulamento de erros de lower-level',
              'Testes unitários cobrindo todos os caminhos de erro',
            ],
            criterios: [
              'errors.Is / errors.As funcionando corretamente',
              'Mensagens de erro claras e acionáveis',
              'Cobertura de testes > 90%',
            ],
          },
        },
      },
      {
        id: 'erros-avancado',
        title: 'Multi-erros, Erros Estruturados e Bibliotecas',
        description: 'go-multierror, eris, oops — tratamento avançado de erros em Go.',
        estimatedMinutes: 45,
        mesa: {
          modelagem: {
            explicacao: 'Em operações paralelas ou de batch, é comum querer coletar múltiplos erros. A stdlib oferece `errors.Join` (Go 1.20+). Para erros com stack trace e contexto rico, bibliotecas como `eris` ou `oops` agregam valor. O pacote `multierr` do Uber é muito usado em produção.',
            codeExample: 'package main\n\nimport (\n\t"errors"\n\t"fmt"\n)\n\n// errors.Join (Go 1.20+)\nfunc validarFormulario(nome, email string) error {\n\tvar errs []error\n\tif nome == "" {\n\t\terrs = append(errs, errors.New("nome é obrigatório"))\n\t}\n\tif email == "" {\n\t\terrs = append(errs, errors.New("email é obrigatório"))\n\t}\n\treturn errors.Join(errs...)\n}\n\nfunc main() {\n\terr := validarFormulario("", "")\n\tif err != nil {\n\t\t// Itera sobre múltiplos erros\n\t\tfor _, e := range err.(interface{ Unwrap() []error }).Unwrap() {\n\t\t\tfmt.Println("-", e)\n\t\t}\n\t}\n}',
            recursos: [
              'https://pkg.go.dev/errors#Join',
              'https://github.com/rotisserie/eris',
              'https://github.com/samber/oops',
              'https://github.com/uber-go/multierr',
              'https://github.com/hashicorp/go-multierror',
            ],
          },
          experimentacao: {
            desafio: 'Implemente um sistema de import em batch (ex: importar uma lista de usuários de CSV) que colete todos os erros de validação sem abortar na primeira falha.',
            dicas: [
              'Use errors.Join para agregar erros',
              'Ou crie um slice de erros e formate no final',
              'Inclua número da linha no contexto do erro',
              'Teste com arquivo CSV com múltiplos erros',
            ],
          },
          socializacao: {
            discussao: 'Quando usar stack traces em erros? Há custo de performance a considerar?',
            pontos: [
              'Stack traces são úteis em desenvolvimento, caros em produção',
              'eris/tracerr capturam stack de forma eficiente',
              'Logs estruturados (zap, zerolog) como alternativa',
              'Sentry / OpenTelemetry para rastreamento em produção',
            ],
            diasDesafio: 'Dias 35–40',
            sugestaoBlog: 'Multi-erros e erros estruturados em Go: errors.Join, eris e estratégias de produção',
            hashtagsExtras: '#golang #errors #observability',
          },
          aplicacao: {
            projeto: 'Crie um validador de dados que processa um JSON array e retorna relatório de todos os erros encontrados com linha e campo.',
            requisitos: [
              'Processar todos os itens mesmo com erros',
              'Erros com contexto: índice do item, nome do campo',
              'Relatório final estruturado',
              'Output tanto para humanos quanto para máquinas (JSON)',
            ],
            criterios: [
              'Nenhum erro perdido (falha silenciosa proibida)',
              'Formato de relatório claro',
              'Testado com inputs inválidos variados',
            ],
          },
        },
      },
    ],
  },
  {
    id: 'generics',
    title: 'Generics',
    description: 'Custom generics em Go 1.18+: constraints, type parameters, inferência e casos de uso reais.',
    icon: 'Braces',
    color: '#8E44AD',
    lessons: [
      {
        id: 'gen-introducao',
        title: 'Introdução a Generics',
        description: 'Type parameters, constraints básicas e a interface any vs comparable.',
        estimatedMinutes: 45,
        mesa: {
          modelagem: {
            explicacao: 'Generics (Go 1.18+) permitem escrever código paramétrico: funções e tipos que operam sobre diferentes tipos mantendo segurança em tempo de compilação. A sintaxe usa `[T Constraint]` onde T é o type parameter. A constraint `any` aceita qualquer tipo; `comparable` exige que o tipo suporte `==`.',
            codeExample: 'package main\n\nimport "fmt"\n\n// Função genérica: funciona com int, float64, string...\nfunc Min[T interface{ ~int | ~float64 | ~string }](a, b T) T {\n\tif a < b {\n\t\treturn a\n\t}\n\treturn b\n}\n\n// Tipo genérico: Stack universal\ntype Stack[T any] struct {\n\tItems []T\n}\n\nfunc (s *Stack[T]) Push(item T) {\n\ts.Items = append(s.Items, item)\n}\n\nfunc (s *Stack[T]) Pop() (T, bool) {\n\tvar zero T\n\tif len(s.Items) == 0 {\n\t\treturn zero, false\n\t}\n\tn := len(s.Items) - 1\n\titem := s.Items[n]\n\ts.Items = s.Items[:n]\n\treturn item, true\n}\n\nfunc main() {\n\tfmt.Println(Min(3, 7))       // int\n\tfmt.Println(Min(3.14, 2.71)) // float64\n\n\ts := Stack[string]{}\n\ts.Push("Go")\n\ts.Push("Generics")\n\tv, _ := s.Pop()\n\tfmt.Println(v) // Generics\n}',
            recursos: [
              'https://go101.org/generics/444-first-look-of-custom-generics.html',
              'https://go101.org/generics/333-about-go-generics.html',
              'https://go.dev/doc/tutorial/generics',
              'https://go.dev/blog/intro-generics',
            ],
          },
          experimentacao: {
            desafio: 'Crie funções genéricas utilitárias: Map, Filter e Reduce que funcionem com slices de qualquer tipo.',
            dicas: [
              'Map[T, U any](slice []T, fn func(T) U) []U',
              'Filter[T any](slice []T, fn func(T) bool) []T',
              'Reduce[T, U any](slice []T, initial U, fn func(U, T) U) U',
              'Teste com []int, []string e []struct',
            ],
            codeTemplate: 'package main\n\nfunc Map[T, U any](slice []T, fn func(T) U) []U {\n\t// Implemente\n}\n\nfunc Filter[T any](slice []T, fn func(T) bool) []T {\n\t// Implemente\n}\n\nfunc Reduce[T, U any](slice []T, initial U, fn func(U, T) U) U {\n\t// Implemente\n}',
          },
          socializacao: {
            discussao: 'Generics resolvem quais problemas em Go que antes exigiam código repetitivo ou interface{}?',
            pontos: [
              'Antes: funções duplicadas para int, float64, etc.',
              'Antes: interface{} com type assertions e perda de type safety',
              'Agora: coleções genéricas (Set, Queue, Tree)',
              'Quando NÃO usar generics: simplicidade primeiro',
            ],
            diasDesafio: 'Dias 41–48',
            sugestaoBlog: 'Generics em Go: constraints, type parameters e os casos de uso que realmente valem a pena',
            hashtagsExtras: '#golang #generics #go118',
          },
          aplicacao: {
            projeto: 'Implemente um pacote de estruturas de dados genéricas: Set[T comparable], Queue[T any] e um Cache[K comparable, V any] com TTL.',
            requisitos: [
              'Set: Add, Remove, Contains, Union, Intersection',
              'Queue: Enqueue, Dequeue, Peek, Len',
              'Cache: Get, Set, Delete com expiração',
              'Testes unitários para cada estrutura',
            ],
            criterios: [
              'Type safety garantida em compilação',
              'Testes cobrindo operações e edge cases',
              'Benchmark comparando com interface{} equivalente',
            ],
          },
        },
      },
      {
        id: 'gen-constraints',
        title: 'Constraints e Limitações',
        description: 'golang.org/x/exp/constraints, union types, ~T e o status atual da implementação.',
        estimatedMinutes: 40,
        mesa: {
          modelagem: {
            explicacao: 'Constraints definem quais operações são permitidas sobre um type parameter. A sintaxe `~int` indica "qualquer tipo cujo tipo subjacente é int". Union types `int | float64` restringem a tipos específicos. O pacote `golang.org/x/exp/constraints` oferece constraints prontas: Ordered, Integer, Float, Number.',
            codeExample: 'package main\n\nimport (\n\t"fmt"\n\t"golang.org/x/exp/constraints"\n)\n\n// Ordered: qualquer tipo com operadores <, >, <=, >=\nfunc Max[T constraints.Ordered](a, b T) T {\n\tif a > b {\n\t\treturn a\n\t}\n\treturn b\n}\n\n// Constraint com ~\ntype MyInt int\n\nfunc Soma[T ~int | ~int64](a, b T) T {\n\treturn a + b\n}\n\nfunc main() {\n\tfmt.Println(Max(10, 20))       // int\n\tfmt.Println(Max("abc", "xyz")) // string\n\n\tvar x, y MyInt = 5, 3\n\tfmt.Println(Soma(x, y)) // 8 — MyInt funciona porque ~int\n}',
            recursos: [
              'https://go101.org/generics/555-type-constraints-and-parameters.html',
              'https://go101.org/generics/666-generic-instantiations-and-type-argument-inferences.html',
              'https://go101.org/generics/888-the-status-quo-of-go-custom-generics.html',
              'https://pkg.go.dev/golang.org/x/exp/constraints',
            ],
          },
          experimentacao: {
            desafio: 'Implemente uma função Sorted e um tipo OrderedMap usando constraints.Ordered. Compare com a abordagem sort.Interface anterior a generics.',
            dicas: [
              'go get golang.org/x/exp/constraints',
              'Crie sua própria constraint: type Number interface { ~int | ~float64 }',
              'Tente usar um método em constraint — veja as limitações',
              'Leia sobre: interfaces com methods vs union types',
            ],
          },
          socializacao: {
            discussao: 'Quais limitações das generics em Go você achou surpreendentes? O Go acertou no design?',
            pontos: [
              'Não é possível usar operadores em type parameters sem constraints',
              'Métodos não podem ter seus próprios type parameters',
              'Comparado com C++ templates e Rust generics',
              'Go priorizou simplicidade — trade-offs válidos?',
            ],
            diasDesafio: 'Dias 41–48',
            sugestaoBlog: 'Constraints e limitações dos Generics em Go: o que funciona, o que não funciona e por quê',
            hashtagsExtras: '#golang #generics #constraints',
          },
          aplicacao: {
            projeto: 'Crie uma biblioteca de algoritmos genéricos: BinarySearch, Sort (merge sort) e um min-heap genérico usando constraints.Ordered.',
            requisitos: [
              'BinarySearch[T constraints.Ordered](sorted []T, target T) int',
              'MergeSort[T constraints.Ordered](slice []T) []T',
              'MinHeap[T constraints.Ordered] com Push/Pop/Peek',
              'Benchmarks contra sort.Slice da stdlib',
            ],
            criterios: [
              'Algoritmos corretos (testes com edge cases)',
              'Performance competitiva com stdlib',
              'Código legível e idiomático',
            ],
          },
        },
      },
    ],
  },
  {
    id: 'solid',
    title: 'SOLID em Go',
    description: 'Princípios SOLID aplicados ao Go.',
    icon: 'Shield',
    color: '#9B59B6',
    lessons: [
      {
        id: 'solid-principios',
        title: 'Princípios SOLID em Go',
        description: 'SRP, OCP, LSP, ISP e DIP com exemplos práticos em Go.',
        estimatedMinutes: 60,
        mesa: {
          modelagem: {
            explicacao: 'SOLID em Go: SRP — cada struct/package deve ter uma responsabilidade. OCP — use interfaces para extensibilidade. LSP — tipos que implementam interface devem ser substituíveis. ISP — interfaces pequenas e específicas. DIP — dependa de abstrações (interfaces), não de implementações concretas.',
            codeExample: '// ISP: interfaces pequenas\ntype Reader interface { Read(p []byte) (n int, err error) }\ntype Writer interface { Write(p []byte) (n int, err error) }\ntype ReadWriter interface { Reader; Writer }\n\n// DIP: dependa da interface\ntype UserService struct {\n\trepo UserRepository // interface, não implementação\n}\n\ntype UserRepository interface {\n\tFindByID(id string) (*User, error)\n\tSave(user *User) error\n}',
            recursos: ['https://dave.cheney.net/2016/08/20/solid-go-design'],
          },
          experimentacao: {
            desafio: 'Refatore um código monolítico aplicando cada princípio SOLID, um por vez.',
            dicas: ['Comece extraindo interfaces (DIP/ISP)', 'Separe responsabilidades em packages', 'Use composition over inheritance'],
          },
          socializacao: {
            discussao: 'SOLID foi criado para OOP. Faz sentido em Go que não é puramente OOP?',
            pontos: ['Go usa composição, não herança', 'Interfaces implícitas facilitam SOLID', 'Pragmatismo vs purismo'],
            diasDesafio: 'Dias 79–84',
            sugestaoBlog: 'SOLID em Go: princípios de design com composição e interfaces implícitas',
            hashtagsExtras: '#golang #solid #architecture #cleancode',

          },
          aplicacao: {
            projeto: 'Refatore um projeto Go aplicando todos os 5 princípios SOLID.',
            requisitos: ['Demonstrar cada princípio com before/after', 'Testes para validar refatoração', 'Documentar decisões'],
            criterios: ['Cada princípio aplicado corretamente', 'Código mais testável', 'Sem regressões'],
          },
        },
      },
    ],
  },
  {
    id: 'clean-arch',
    title: 'Go e Clean Architecture',
    description: 'Clean Architecture aplicada em projetos Go reais.',
    icon: 'Layers',
    color: '#1ABC9C',
    lessons: [
      {
        id: 'clean-conceitos',
        title: 'Clean Architecture: Conceitos e Estrutura',
        description: 'Camadas, regras de dependência, entities, use cases e adaptadores.',
        estimatedMinutes: 55,
        mesa: {
          modelagem: {
            explicacao: 'Clean Architecture separa código em camadas: Entities (domínio), Use Cases (lógica de negócio), Adapters (interfaces com mundo externo), Frameworks (infraestrutura). A regra de ouro: dependências apontam para dentro — frameworks dependem de use cases, não o contrário.',
            recursos: ['https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html'],
          },
          experimentacao: {
            desafio: 'Crie a estrutura de pastas de um projeto Go com Clean Architecture.',
            dicas: [
              'internal/entity/ — domínio',
              'internal/usecase/ — casos de uso',
              'internal/infra/ — adapters e frameworks',
              'cmd/ — entry points',
            ],
          },
          socializacao: {
            discussao: 'Clean Architecture adiciona complexidade. Quando vale a pena?',
            pontos: ['Projetos pequenos vs grandes', 'Testabilidade vs simplicidade', 'Pragmatismo na escolha'],
            diasDesafio: 'Dias 79–84',
            sugestaoBlog: 'Clean Architecture em Go: estruturando projetos reais com entities, use cases e adapters',
            hashtagsExtras: '#golang #cleanarchitecture #ddd',

          },
          aplicacao: {
            projeto: 'Implemente um sistema de orders com Clean Architecture completa.',
            requisitos: [
              'Entities: Order, Product, Customer',
              'Use Cases: CreateOrder, ListOrders',
              'Adapters: HTTP, gRPC, Repository',
              'Infraestrutura: PostgreSQL, RabbitMQ',
            ],
            criterios: ['Camadas respeitam regra de dependência', 'Use cases testáveis sem infra', 'DTOs separam camadas'],
          },
        },
      },
    ],
  },
  {
    id: 'implementacoes',
    title: 'Implementações Avançadas',
    description: 'gRPC, GraphQL, AWS S3, Cobra CLI, Event Dispatcher, RabbitMQ e mais.',
    icon: 'Wrench',
    color: '#E67E22',
    lessons: [
      {
        id: 'impl-grpc',
        title: 'gRPC',
        description: 'Comunicação entre serviços com gRPC e Protocol Buffers.',
        estimatedMinutes: 50,
        mesa: {
          modelagem: {
            explicacao: 'gRPC usa Protocol Buffers para definir serviços e mensagens. É mais eficiente que REST para comunicação entre microsserviços. Suporta streaming bidirecional.',
            codeExample: '// service.proto\nsyntax = "proto3";\n\nservice UserService {\n\trpc GetUser(GetUserRequest) returns (User);\n}\n\nmessage GetUserRequest {\n\tstring id = 1;\n}\n\nmessage User {\n\tstring id = 1;\n\tstring name = 2;\n}',
            recursos: ['https://grpc.io/docs/languages/go/', 'https://protobuf.dev/'],
          },
          experimentacao: {
            desafio: 'Crie um serviço gRPC com CRUD de produtos. Gere código com protoc.',
            dicas: ['Instale protoc e plugins Go', 'protoc --go_out --go-grpc_out', 'Use reflection para debugging'],
          },
          socializacao: {
            discussao: 'gRPC vs REST: quando usar cada um?',
            pontos: ['gRPC: microsserviços internos, streaming', 'REST: APIs públicas, browser clients', 'gRPC-Gateway como ponte'],
            diasDesafio: 'Dias 73–78',
            sugestaoBlog: 'gRPC com Go: do proto ao servidor em produção',
            hashtagsExtras: '#golang #grpc #microservices #protobuf',

          },
          aplicacao: {
            projeto: 'Microsserviço completo com gRPC: server, client e testes.',
            requisitos: ['Proto definitions', 'Server e client implementation', 'Streaming unary e bidirecional'],
            criterios: ['Proto compilando', 'Comunicação funcional', 'Testes de integração'],
          },
        },
      },
      {
        id: 'impl-graphql',
        title: 'GraphQL',
        description: 'API GraphQL com Go usando gqlgen.',
        estimatedMinutes: 45,
        mesa: {
          modelagem: {
            explicacao: 'GraphQL permite ao cliente especificar exatamente quais dados precisa. Em Go, gqlgen gera código type-safe a partir do schema GraphQL.',
            recursos: ['https://gqlgen.com/', 'https://graphql.org/'],
          },
          experimentacao: {
            desafio: 'Crie um schema GraphQL para livraria com queries e mutations.',
            dicas: ['gqlgen init para scaffold', 'Defina schema.graphqls', 'Implemente resolvers gerados'],
          },
          socializacao: {
            discussao: 'GraphQL vs REST: complexidade vs flexibilidade?',
            pontos: ['N+1 queries problem', 'Over-fetching vs under-fetching', 'Schema como contrato'],
            diasDesafio: 'Dias 73–78',
            sugestaoBlog: 'GraphQL com Go usando gqlgen: schema-first e resolvers type-safe',
            hashtagsExtras: '#golang #graphql #gqlgen #api',

          },
          aplicacao: {
            projeto: 'API GraphQL completa com autenticação e dataloader.',
            requisitos: ['Queries e Mutations', 'Authentication middleware', 'Dataloader para evitar N+1'],
            criterios: ['Schema bem definido', 'Performance com dataloader', 'Playground funcional'],
          },
        },
      },
      {
        id: 'impl-cli-events',
        title: 'CLI, Events e Configuração',
        description: 'Cobra CLI, Event Dispatcher e Viper para configuração.',
        estimatedMinutes: 45,
        mesa: {
          modelagem: {
            explicacao: 'Cobra é o framework padrão para CLIs em Go (usado por Docker, Kubernetes). Viper gerencia configurações de múltiplas fontes. Event Dispatcher implementa pub/sub patterns.',
            codeExample: '// Cobra CLI\nvar rootCmd = &cobra.Command{\n\tUse:   "app",\n\tShort: "Minha aplicação CLI",\n}\n\nvar serveCmd = &cobra.Command{\n\tUse:   "serve",\n\tShort: "Iniciar servidor",\n\tRun: func(cmd *cobra.Command, args []string) {\n\t\t// iniciar servidor\n\t},\n}',
            recursos: ['https://github.com/spf13/cobra', 'https://github.com/spf13/viper'],
          },
          experimentacao: {
            desafio: 'Crie uma CLI com Cobra que tenha 3 comandos e use Viper para configuração.',
            dicas: ['cobra-cli init para scaffold', 'Viper lê de arquivo, env vars e flags', 'Combine Cobra + Viper para app completo'],
          },
          socializacao: {
            discussao: 'Por que tantas ferramentas DevOps são escritas em Go?',
            pontos: ['Binário único, sem dependências', 'Cross-compilation fácil', 'CLI ecosystem maduro'],
            diasDesafio: 'Dias 73–78',
            sugestaoBlog: 'CLIs em Go com Cobra e Viper: construindo ferramentas de linha de comando profissionais',
            hashtagsExtras: '#golang #cli #cobra #viper',

          },
          aplicacao: {
            projeto: 'CLI completa com Cobra, Viper e Event Dispatcher para automação de tarefas.',
            requisitos: ['Múltiplos comandos e subcomandos', 'Configuração via arquivo e env vars', 'Eventos para logging e notificações'],
            criterios: ['CLI usável', 'Configuração flexível', 'Eventos propagados corretamente'],
          },
        },
      },
    ],
  },
  {
    id: 'internals',
    title: 'Golang Internals',
    description: 'Runtime, scheduler, garbage collector e performance.',
    icon: 'Cpu',
    color: '#34495E',
    lessons: [
      {
        id: 'int-runtime',
        title: 'Runtime, Scheduler e Memória',
        description: 'M:P:G model, memory allocation, GC e ferramentas de diagnóstico.',
        estimatedMinutes: 60,
        mesa: {
          modelagem: {
            explicacao: 'O Go runtime gerencia goroutines via M:P:G model — M (OS threads), P (processadores lógicos), G (goroutines). O scheduler distribui G em M via P. O GC é concurrent, tri-color mark-and-sweep. Stack das goroutines começa pequena (2KB) e cresce dinamicamente.',
            recursos: [
              'https://go.dev/doc/gc-guide',
              'https://go.dev/blog/ismmkeynote',
            ],
          },
          experimentacao: {
            desafio: 'Use GODEBUG=gctrace=1 e runtime.ReadMemStats para monitorar GC e alocação de memória de um programa.',
            dicas: ['GOMAXPROCS controla P', 'runtime.NumGoroutine() conta goroutines', 'go tool pprof para profiling'],
          },
          socializacao: {
            discussao: 'Como o scheduler do Go compara com threads do OS?',
            pontos: ['Goroutines: ~2KB vs threads: ~1MB', 'Cooperative vs preemptive scheduling', 'Trabalho roubado (work-stealing)'],
            diasDesafio: 'Dias 85–90',
            sugestaoBlog: 'Por dentro do Go: scheduler M:P:G, GC tri-color e gerenciamento de memória',
            hashtagsExtras: '#golang #internals #runtime #gc',

          },
          aplicacao: {
            projeto: 'Faça profiling de uma aplicação Go e otimize baseado nos resultados.',
            requisitos: ['CPU profile com pprof', 'Memory profile', 'Identificar e corrigir bottlenecks'],
            criterios: ['Profiling executado', 'Bottlenecks identificados', 'Melhoria mensurável'],
          },
        },
      },
    ],
  },
  {
    id: 'deploy',
    title: 'Deploy',
    description: 'Compilação, Docker multistage, Kubernetes e deploy.',
    icon: 'Cloud',
    color: '#3498DB',
    lessons: [
      {
        id: 'deploy-docker-k8s',
        title: 'Docker e Kubernetes',
        description: 'Imagens otimizadas com multistage build e deploy em Kubernetes.',
        estimatedMinutes: 55,
        mesa: {
          modelagem: {
            explicacao: 'Go compila em binário estático — perfeito para containers Docker. Multistage build: primeiro estágio compila, segundo usa imagem mínima (scratch/distroless). Kubernetes orquestra containers com deployments, services e ingress.',
            codeExample: '# Dockerfile multistage\nFROM golang:1.22 AS builder\nWORKDIR /app\nCOPY . .\nRUN CGO_ENABLED=0 go build -o /app/server ./cmd/server\n\nFROM scratch\nCOPY --from=builder /app/server /server\nEXPOSE 8080\nCMD ["/server"]',
            recursos: ['https://docs.docker.com/build/building/multi-stage/', 'https://kubernetes.io/docs/home/'],
          },
          experimentacao: {
            desafio: 'Crie um Dockerfile multistage para uma API Go e compare o tamanho da imagem final.',
            dicas: ['golang:alpine vs scratch', 'CGO_ENABLED=0 para binário estático', 'docker images para verificar tamanho'],
          },
          socializacao: {
            discussao: 'Por que Go é tão popular em cloud-native e Kubernetes?',
            pontos: ['Binário estático = imagem tiny', 'Cross-compilation simplifica CI', 'K8s, Docker, Terraform são escritos em Go'],
            diasDesafio: 'Dias 97–100',
            sugestaoBlog: 'Do código Go ao Kubernetes: Docker multistage, manifests e deploy em produção',
            hashtagsExtras: '#golang #docker #kubernetes #devops',

          },
          aplicacao: {
            projeto: 'Deploy completo: Dockerfile multistage + manifests Kubernetes.',
            requisitos: ['Dockerfile otimizado', 'Deployment + Service + Ingress YAML', 'Health checks configurados'],
            criterios: ['Imagem < 20MB', 'Deploy funcional', 'Health checks operacionais'],
          },
        },
      },
    ],
  },
];
