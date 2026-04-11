import { Module } from '../../types';

export const errosModule: Module = {
    id: 'erros',
    title: 'Tratamento de Erros',
    description: 'Erros idiomáticos: wrapping, sentinel errors, errors.Is/As, multi-errors e boas práticas.',
    icon: 'AlertCircle',
    color: '#E74C3C',
    lessons: [
      {
        id: 'erros-padroes',
        title: 'Padrões de Erro em Go',
        description: 'error interface, errors.New, fmt.Errorf, wrapping com %w, errors.Is e errors.As.',
        estimatedMinutes: 40,
        vesa: {
          visaoGeral: {
            explicacao: 'Em Go, erros são valores -- qualquer tipo que implemente a interface error (método Error() string). Essa escolha designístíca força o tratamento explícito: o compilador não deixa ignorar um valor de retorno (embora seja possível com _). O padrão idiomático é retornar (T, error) e verificar if err != nil imediatamente.\n\nerrors.New("mensagem") cria um valor de erro simples -- cada chamada cria um ponteiro distinto, então dois errors.New com o mesmo texto são não iguais por ==. Erros sentinela são variáveis de pacote exportadas (var ErrNotFound = errors.New("not found")) que podem ser comparadas com errors.Is(). fmt.Errorf("contexto: %w", err) cria um erro wrapped que encapsula o erro original e adiciona contexto. A cadeia de wrapping pode ser qualquer profundidade.\n\nerrors.Is(err, target) percorre a cadeia de wrapping até encontrar um erro igual a target por == ou por um método Is(error) bool customizado no tipo de erro. errors.As(err, &target) percorre a cadeia Até encontrar um erro atribuível ao tipo de target e preenche &target com o valor -- útil para acessar campos de erros customizados. Tipos de erro customizados devem implementar o método Unwrap() error para participar das cadeias de wrapping.\n\nDesempacote com errors.Unwrap(err) para obter o erro original de uma camada. Para implementar wrapping em tipos customizados: implemente Unwrap() error. Para wrapping múltiplo (Go 1.20+): fmt.Errorf("%w ... %w", err1, err2) cria um erro que aponta para ambos, e errors.Is/As percorrem a árvore completa. A regra geral: nunca perca um erro; adicione contexto mas preserve a causa raiz com wrapping.',             codeExample: 'package main\n\nimport (\n\t"errors"\n\t"fmt"\n)\n\nvar ErrNaoEncontrado = errors.New("não encontrado")\n\ntype ErrValidacao struct {\n\tCampo string\n\tMsg   string\n}\n\nfunc (e *ErrValidacao) Error() string {\n\treturn fmt.Sprintf("%s: %s", e.Campo, e.Msg)\n}\n\nfunc buscar(id int) error {\n\tif id <= 0 {\n\t\treturn &ErrValidacao{Campo: "id", Msg: "deve ser positivo"}\n\t}\n\treturn fmt.Errorf("buscar(id=%d): %w", id, ErrNaoEncontrado)\n}\n\nfunc main() {\n\terr := buscar(999)\n\n\t// errors.Is — verifica cadeia\n\tif errors.Is(err, ErrNaoEncontrado) {\n\t\tfmt.Println("Não existe")\n\t}\n\n\t// errors.As — extrai tipo\n\terr2 := buscar(-1)\n\tvar ve *ErrValidacao\n\tif errors.As(err2, &ve) {\n\t\tfmt.Printf("Campo inválido: %s\\n", ve.Campo)\n\t}\n}',
            recursos: [
              'https://go.dev/blog/error-handling-and-go',
              'https://go.dev/blog/go1.13-errors',
              'https://gobyexample.com/errors',
            ],
          },
          experimentacao: {
            desafio: 'Crie 3 tipos de erro: sentinela, customizado com campos e wrapped. Teste errors.Is e errors.As em cada caso.',
            dicas: [
              'Sentinela: var ErrNotFound = errors.New("...")',
              'Wrapping: fmt.Errorf("contexto: %w", err)',
              'errors.As: extrai struct de erro customizado',
            ],
          },
          socializacao: {
            discussao: 'Erros como valores vs exceções: qual abordagem preferem para projetos grandes?',
            pontos: [
              'Erros explícitos forçam tratamento imediato',
              'Exceptions podem ser esquecidas ou swallowed',
              'Go: "happy path" à esquerda, error handling à direita',
            ],
            diasDesafio: 'Dias 39–44',
            sugestaoBlog: 'Error handling em Go: wrapping, errors.Is, errors.As e boas práticas',
            hashtagsExtras: '#golang #errors #bestpractices',
          },
          aplicacao: {
            projeto: 'Parser de configuração que retorna erros ricos: sentinela para tipo de falha, customizado para contexto, wrapping para causa raiz.',
            requisitos: [
              'Erros sentinela para tipos de falha',
              'Erros customizados com campos de contexto',
              'Testes cobrindo todos os caminhos de erro',
            ],
            criterios: ['errors.Is/As funcionando', 'Mensagens claras', 'Cobertura > 90%'],
          },
        },
      },
      {
        id: 'erros-avancado',
        title: 'Multi-erros e Erros Estruturados',
        description: 'errors.Join, go-multierror, eris e estratégias de produção.',
        estimatedMinutes: 40,
        vesa: {
          visaoGeral: {
            explicacao: 'Em operações batch e paralelas, a boa prática é não abortar no primeiro erro -- processe tudo e reporte todos os erros no final. errors.Join (Go 1.20+) combina múltiplos erros em um único valor; retorna nil se todos os itens do slice forem nil. O Error() de um joined error concatena as mensagens com newline. errors.Is e errors.As atravessam a arvore de erros joinados.\n\npanic e defer são mecanismos distintos de controle de fluxo extraordinário. panic(v) para a execução normal e começa a desenrolar a call stack da goroutine corrente, executando as funções deferridas em ordem LIFO. Se não for recuperado em nenhuma defer, o runtime imprime a stack trace e termina o programa. Apenas a goroutine que panicou é afetada no unwind -- mas se chegar ao topo sem recover, o programa todo termina.\n\nrecover() captura o valor passado ao panic -- mas APENAS se chamado diretamente dentro de uma função deferrida (não em funções chamadas pela defer). Fora de defer, recover() retorna nil. O padrão idiomático em servidores HTTP: cada handler é executado com um recover para evitar que um panic em um request derrube o servidor inteiro. Desde Go 1.21, panic(nil) é equivalente a panic(new(runtime.PanicNilError)) -- codigos que chequeam recover() != nil precisam também tratar *runtime.PanicNilError.\n\nPara erros ricos em produção, o ecossistema oferece: github.com/rotisserie/eris (wrapping com stack trace), go.uber.org/multierr (multiple errors), slog (logging estruturado nativo Go 1.21+). A orientação geral: use errors padrão para a lógica de negócio; use logging estruturado para observabilidade; reserve panic para invariantes violados (bugs no código do programador, não erros de input).',             codeExample: 'package main\n\nimport (\n\t"errors"\n\t"fmt"\n)\n\nfunc validar(nome, email string) error {\n\tvar errs []error\n\tif nome == "" {\n\t\terrs = append(errs, errors.New("nome obrigatório"))\n\t}\n\tif email == "" {\n\t\terrs = append(errs, errors.New("email obrigatório"))\n\t}\n\treturn errors.Join(errs...) // nil se slice vazio\n}\n\nfunc main() {\n\tif err := validar("", ""); err != nil {\n\t\tfmt.Println(err)\n\t\t// Output:\n\t\t// nome obrigatório\n\t\t// email obrigatório\n\t}\n}',
            recursos: [
              'https://pkg.go.dev/errors#Join',
              'https://github.com/uber-go/multierr',
              'https://github.com/rotisserie/eris',
            ],
          },
          experimentacao: {
            desafio: 'Implemente um importador de CSV que processa todas as linhas e coleta todos os erros de validação (com número da linha) sem abortar na primeira falha.',
            dicas: [
              'errors.Join agrupa erros — nil se slice vazio',
              'Inclua número da linha no contexto do erro',
              'Para output JSON dos erros, crie struct ErrorReport',
            ],
          },
          socializacao: {
            discussao: 'Quando usar stack traces em erros? Há custo de performance?',
            pontos: [
              'Stack traces úteis em dev, caros em prod',
              'Logging estruturado (slog/zap) como alternativa',
              'OpenTelemetry para rastreamento distribuído',
            ],
            diasDesafio: 'Dias 39–44',
            sugestaoBlog: 'Multi-erros em Go: errors.Join e estratégias para batch processing',
            hashtagsExtras: '#golang #errors #observability',
          },
          aplicacao: {
            projeto: 'Validador de JSON array: processe todos os itens e retorne relatório completo de erros.',
            requisitos: [
              'Processar todos itens mesmo com erros',
              'Erros com contexto: índice + campo + mensagem',
              'Output para humanos (texto) e máquinas (JSON)',
            ],
            criterios: ['Nenhum erro perdido', 'Relatório claro', 'Testes com inputs variados'],
          },
        },
      },
    ],
};
