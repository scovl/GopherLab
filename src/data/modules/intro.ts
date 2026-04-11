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
          explicacao: 'Go (ou Golang) foi iniciado em setembro de 2007 por Robert Griesemer, Rob Pike e Ken Thompson enquanto aguardavam uma compilação C++ de 45 minutos no Google. O design começou em um documento interno de Pike e Thompson. A linguagem foi anunciada publicamente em novembro de 2009, com a versão 1.0 langada em março de 2012. A promessa da v1.0 e a ainda mantida: compatibilidade retroativa total -- qualquer código escrito para Go 1.x continua compilando e funcionando nas versões futuras.\n\nMarcos históricos: Go 1.5 (2015) reescreveu o compilador e runtime em Go (antes era C). Go 1.11 (2018) introduziu Go Modules, resolvendo o problema de gerenciamento de dependências. Go 1.13 (2019) adicionou suporte a novas formas de literais numéricos (0b, 0o, _). Go 1.18 (2022) trouxe generics -- a feature mais requisitada em anos. Go 1.21 (2023) adicionou funções embutidas min/max, slices/maps/cmp packages na stdlib, e log/slog para logging estruturado.\n\nOs três criadores têm histórias ilustres: Ken Thompson criou Unix e C (Turing Award 1983) e co-criou UTF-8. Rob Pike trabalhou com Thompson em Unix e Plan 9, criou o pacote utf8. Ambos são responsabilidade direta pelo fato de Go ser nativamente UTF-8. Go é uma das poucas linguagens cujo compilador é escrito na própria linguagem depois de poucos anos, demonstrando auto-suficiência.',
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
          explicacao: 'Go foi projetado com princípios explícitos: simplicidade radial sobre expressividade. A linguagem tem exatamente 25 palavras-chave (keywords) -- menos que Python, Java ou C++. Não há herança, overloading de operadores, coerção implícita, ou assertions de tipo implícitas. Qualquer idiom que parecesse "muito esperto" foi deliberadamente excluído.\n\nFatores que fazem Go popular em infraestrutura: (1) Compilação ultra-rápida -- projetos grandes compilam em segundos; (2) Binário estático auto-contido -- deploy é copiar um arquivo, sem dependencias externas, Docker images minimalistas; (3) Garbage collector de baixa latência (pausas <1ms desde Go 1.14); (4) Goroutines -- concorrência nativa sem lidar com threads OS; (5) Toolchain integrado -- go fmt, go test, go vet, go build, go doc, go mod, pprof.\n\nCasos de uso ideais: APIs REST/gRPC, microservices, CLIs, ferramentas DevOps (k8s, Docker, Terraform, Hugo são escritos em Go), proxies reversos, sistemas de filas, parsers/compilers. Go não é ideal para: frontend web (use JavaScript/WASM), ML/Data Science (use Python), mobile (use Swift/Kotlin/Flutter), jogos (use C++/Rust). O mercado paga bem por Go: é consistentemente uma das linguagens mais bem-pagas em surveys do Stack Overflow.', 
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
          explicacao: 'A instalação do Go é um arquivo único: baixe em go.dev/dl (instalador .msi no Windows, .pkg no macOS, tarball no Linux). O instalador configura automaticamente o PATH. Verifique com go version e go env GOROOT. GOROOT é o diretório de instalação (ex: /usr/local/go). GOPATH (padrão ~/go) era o workspace obrigatório antes de Go Modules -- hoje, só é relevante para go install (binários vão para $GOPATH/bin).\n\nTodo programa Go pertence a um package. O package main com a função main() é o ponto de entrada de um executável. import lista os packages usados -- packages não usados causam erro de compilação (o compilador é rigoroso). go mod init github.com/user/repo cria go.mod, que define o module path e a versão mínima do Go exigida. go run main.go compila e executa num passo; go build compila para binário; go install compila e instala em $GOPATH/bin.\n\nO compilador Go é rápido por design: sem headers, sem macros, dependências implícitas proibidas, regras de inicialização simples. Um projeto de 100k linhas compila em segundos. Cross-compilation é nativa: GOOS=linux GOARCH=amd64 go build compila para Linux x86-64 de qualquer plataforma. Arquiteturas suportadas: amd64, arm64, arm, 386, riscv64, ppc64, s390x, wasm.', 
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
            'fmt.Printf não adiciona newline automaticamente -- use a sequencia de nova linha no formato',
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
          explicacao: 'O VS Code com a extensão oficial "Go" da Google (publisher: golang) é o editor mais popular para Go. O coração da experiência é o gopls (Go Language Server) -- um servidor LSP que provê: autocompletar, go to definition, find references, renaming seguro, inlays hints de tipos inferidos e diagnósticos em tempo real.\n\nFerramentas essenciais instaladas via "Go: Install/Update Tools": gopls (language server), dlv (Delve debugger), staticcheck (linter avançado), gotests (geração de testes), gomodifytags (editar struct tags). Todas são instaladas como binários Go em $GOPATH/bin. Configuração recomendada no settings.json: "go.useLanguageServer": true, "editor.formatOnSave": true, "[go]": { "editor.defaultFormatter": "golang.go" }.\n\ngofmt é o formatador oficial e opinionado: não tem opções de configuração (tabs, não espaços; espaços após keywords; sem trailing whitespace). goimports faz o mesmo que gofmt e ainda gerencia imports automaticamente. go vet detecta erros comuns que compilam mas são incorretos (ex: string passada onde *string esperada, mutex copiado, etc). Integre go vet e staticcheck no CI para garantir qualidade.', 
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
