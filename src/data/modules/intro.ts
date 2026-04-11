import { Module } from '../../types';

export const introModule: Module = {
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
      vesa: {
        visaoGeral: {
          explicacao: 'Go (ou Golang) foi criado em 2007 por Robert Griesemer, Rob Pike e Ken Thompson no Google e anunciado publicamente em 2009. A versão 1.0 saiu em 2012 garantindo compatibilidade retroativa. Marcos importantes: módulos em Go 1.11 (2018) e generics em Go 1.18 (2022). Go nasceu da frustração com linguagens existentes para sistemas distribuídos — compilação lenta do C++, complexidade do Java e a necessidade de uma linguagem simples, rápida e com concorrência nativa.',
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
            'Discuta as vantagens da compilação estática e binário único',
            'Pense no modelo de concorrência com goroutines vs threads OS',
          ],
          diasDesafio: 'Dias 1–7',
          sugestaoBlog: 'Por que escolhi Go: história, motivações e meu setup inicial',
          hashtagsExtras: '#golang #beginner',
        },
        aplicacao: {
          projeto: 'Crie um documento resumindo a história do Go e suas principais características.',
          requisitos: [
            'Incluir linha do tempo: 2007 (criação), 2009 (anúncio), 2012 (v1.0), 2018 (módulos), 2022 (generics)',
            'Listar pelo menos 3 características únicas do Go',
            'Mencionar casos de uso reais em produção',
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
      vesa: {
        visaoGeral: {
          explicacao: 'Go foi projetado para resolver problemas reais de engenharia em larga escala: compilação rápida, execução eficiente, facilidade de manutenção, suporte nativo à concorrência e um ecossistema de ferramentas robusto. A linguagem prioriza simplicidade — tem apenas 25 palavras reservadas. Compila para binário estático (deploy sem dependências), tem garbage collector otimizado para baixa latência e um modelo de concorrência baseado em CSP (Communicating Sequential Processes).',
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
            'Go é excelente para backend, CLIs e sistemas — menos para mobile e ML',
          ],
        },
        socializacao: {
          discussao: 'Em quais cenários Go NÃO seria a melhor escolha?',
          pontos: [
            'Aplicações mobile nativas',
            'Machine Learning (comparado com Python)',
            'Frontend web — Go é backend/infraestrutura',
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
      title: 'Instalação e Primeiro Programa',
      description: 'Instale Go, configure o ambiente e escreva seu Hello World.',
      estimatedMinutes: 30,
      vesa: {
        visaoGeral: {
          explicacao: 'A instalação do Go é simples: baixe em go.dev/dl, instale e verifique com `go version`. O Go usa GOPATH (workspace padrão ~/go) e GOROOT (diretório de instalação). Todo programa Go começa com `package main` e a função `main()` é o ponto de entrada. O pacote `fmt` fornece formatação de I/O.',
          codeExample: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Olá, Go!")\n}\n\n// Executar:\n// go mod init meuprojeto\n// go run main.go',
          recursos: [
            'https://go.dev/dl/',
            'https://go.dev/doc/install',
            'https://go.dev/tour/welcome/1',
          ],
        },
        experimentacao: {
          desafio: 'Instale Go, crie um módulo com go mod init e escreva um programa que imprima seu nome usando fmt.Printf com verbos de formatação (%s, %d, %v).',
          dicas: [
            'No Windows: instalador .msi, no macOS: .pkg ou brew, no Linux: tarball em /usr/local',
            'Verifique: go version && go env',
            'go mod init inicializa um módulo — necessário para qualquer projeto',
            'fmt.Printf não adiciona \\n automaticamente',
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
          sugestaoBlog: 'Instalando Go e rodando Hello World: guia passo a passo',
          hashtagsExtras: '#golang #setup',
        },
        aplicacao: {
          projeto: 'Configure o Go e crie um módulo com Hello World funcional.',
          requisitos: [
            'Go instalado e funcionando (go version)',
            'Módulo inicializado com go mod init',
            'Programa usando fmt.Println e fmt.Printf',
          ],
          criterios: ['Go instalado corretamente', 'Hello World compilando e executando'],
        },
      },
    },
    {
      id: 'intro-vscode',
      title: 'Configuração do Ambiente no VSCode',
      description: 'Configure o Visual Studio Code para desenvolvimento em Go.',
      estimatedMinutes: 20,
      vesa: {
        visaoGeral: {
          explicacao: 'O VS Code com a extensão oficial "Go" da Google é o editor mais popular para Go. A extensão oferece: autocompletar via gopls (Go Language Server), formatação automática com gofmt, debugging com Delve, testes integrados e análise estática com go vet. Instale a extensão e use Ctrl+Shift+P > "Go: Install/Update Tools" para instalar as ferramentas auxiliares.',
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
            'Extensão Go instalada com todas as ferramentas',
            'Debugger funcionando com breakpoints',
            'Formatação ao salvar ativada',
          ],
          criterios: ['AutoComplete funcionando', 'Formatação automática', 'Debugger operacional'],
        },
      },
    },
  ],
};
