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
            explicacao: 'Em Go, erros são valores — qualquer tipo que implementa `error` (com método `Error() string`). O padrão idiomático: retorne `(T, error)` e verifique `if err != nil`. Crie erros simples com `errors.New()`. Encapsule com contexto: `fmt.Errorf("contexto: %w", err)`. Erros sentinela são variáveis de pacote (ex: `io.EOF`). `errors.Is` verifica cadeia; `errors.As` extrai tipo concreto.',
            codeExample: 'package main\n\nimport (\n\t"errors"\n\t"fmt"\n)\n\nvar ErrNaoEncontrado = errors.New("não encontrado")\n\ntype ErrValidacao struct {\n\tCampo string\n\tMsg   string\n}\n\nfunc (e *ErrValidacao) Error() string {\n\treturn fmt.Sprintf("%s: %s", e.Campo, e.Msg)\n}\n\nfunc buscar(id int) error {\n\tif id <= 0 {\n\t\treturn &ErrValidacao{Campo: "id", Msg: "deve ser positivo"}\n\t}\n\treturn fmt.Errorf("buscar(id=%d): %w", id, ErrNaoEncontrado)\n}\n\nfunc main() {\n\terr := buscar(999)\n\n\t// errors.Is — verifica cadeia\n\tif errors.Is(err, ErrNaoEncontrado) {\n\t\tfmt.Println("Não existe")\n\t}\n\n\t// errors.As — extrai tipo\n\terr2 := buscar(-1)\n\tvar ve *ErrValidacao\n\tif errors.As(err2, &ve) {\n\t\tfmt.Printf("Campo inválido: %s\\n", ve.Campo)\n\t}\n}',
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
            explicacao: 'Em operações batch/paralelas, colete múltiplos erros com `errors.Join` (Go 1.20+). Para stack traces e contexto rico, libs como `eris` ou `oops` ajudam. `multierr` (Uber) é muito usado em produção. O padrão é: nunca perder um erro silenciosamente; em batch, processe tudo e reporte todos os erros no final.',
            codeExample: 'package main\n\nimport (\n\t"errors"\n\t"fmt"\n)\n\nfunc validar(nome, email string) error {\n\tvar errs []error\n\tif nome == "" {\n\t\terrs = append(errs, errors.New("nome obrigatório"))\n\t}\n\tif email == "" {\n\t\terrs = append(errs, errors.New("email obrigatório"))\n\t}\n\treturn errors.Join(errs...) // nil se slice vazio\n}\n\nfunc main() {\n\tif err := validar("", ""); err != nil {\n\t\tfmt.Println(err)\n\t\t// Output:\n\t\t// nome obrigatório\n\t\t// email obrigatório\n\t}\n}',
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
