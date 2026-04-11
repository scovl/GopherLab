import { Module } from '../../types';

export const testesModule: Module = {
  id: 'testes',
  title: 'Testes Automatizados',
  description: 'Testes unitários, table-driven, mocks, benchmarks, fuzzing, httptest e cobertura.',
  icon: 'TestTube',
  color: '#2ECC71',
  lessons: [
    {
      id: 'test-basico',
      title: 'Testes Unitários e Table-driven',
      description: 'testing.T, table-driven tests, subtests, cobertura e httptest.',
      estimatedMinutes: 45,
      vesa: {
        visaoGeral: {
          explicacao: 'Go tem testes nativos: arquivos _test.go no mesmo diretório do código; funções TestNome(t *testing.T) são detectadas automaticamente por go test. t.Error/t.Errorf marcam falha mas continuam executando o teste; t.Fatal/t.Fatalf marcam falha e param imediatamente. O Helper t.Helper() faz o reporter de erro apontar para o caller, não para a função auxíliar -- use em funções de assertion customizadas.\n\nTable-driven tests são o idioma padrão em Go: define-se um slice de structs com campos nome, input e expected; itera-se com t.Run(tc.nome, func(t *testing.T) { ... }). Cada subtest é executado como um teste independente: go test -run TestSoma/positivos roda somente o subtest \"positivos\". Subtests são executados em paralelo se chamarem t.Parallel() -- mas cuidado com captura de variável de loop (Go 1.22+ corrigiu isso).\n\ngo test -cover mostra porcentagem de cobertura; -coverprofile=c.out gera arquivo; go tool cover -html=c.out abre visão interativa no browser mostrando quais linhas foram exercitadas. coverage não é métrica de qualidade por si só -- 80% com casos bem escolhidos vale mais que 100% com assert triviais. httptest.NewRecorder() captura status, headers e body de um handler HTTP sem bind em porta real. httptest.NewServer(handler) sobe um servidor real em porta aleatória para testes de integração.', 
          codeExample: 'package math\n\nimport (\n\t"net/http"\n\t"net/http/httptest"\n\t"testing"\n)\n\nfunc Soma(a, b int) int { return a + b }\n\nfunc TestSoma(t *testing.T) {\n\tcases := []struct {\n\t\tnome     string\n\t\ta, b     int\n\t\texpected int\n\t}{\n\t\t{"positivos", 1, 2, 3},\n\t\t{"zeros", 0, 0, 0},\n\t\t{"negativos", -1, 1, 0},\n\t\t{"grandes", 1<<30, 1, 1<<30 + 1},\n\t}\n\tfor _, tc := range cases {\n\t\tt.Run(tc.nome, func(t *testing.T) {\n\t\t\tgot := Soma(tc.a, tc.b)\n\t\t\tif got != tc.expected {\n\t\t\t\tt.Errorf("Soma(%d, %d) = %d; want %d", tc.a, tc.b, got, tc.expected)\n\t\t\t}\n\t\t})\n\t}\n}\n\n// httptest — testar HTTP handler\nfunc TestHealthHandler(t *testing.T) {\n\treq := httptest.NewRequest("GET", "/health", nil)\n\tw := httptest.NewRecorder()\n\n\thttp.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n\t\tw.WriteHeader(http.StatusOK)\n\t}).ServeHTTP(w, req)\n\n\tif w.Code != 200 {\n\t\tt.Errorf("status = %d; want 200", w.Code)\n\t}\n}',
          recursos: [
            'https://go.dev/doc/tutorial/add-a-test',
            'https://gobyexample.com/testing',
            'https://pkg.go.dev/net/http/httptest',
          ],
        },
        experimentacao: {
          desafio: 'Escreva testes table-driven com t.Run para uma função de validação de email. Depois, teste um HTTP handler usando httptest.NewRequest e httptest.NewRecorder.',
          dicas: [
            't.Run("nome", func(t *testing.T) {...}) para subtests',
            'go test -v para ver cada subtest',
            'go test -cover para cobertura',
            'httptest.NewRecorder() captura status e body',
          ],
        },
        socializacao: {
          discussao: 'Table-driven tests: por que são o padrão em Go? Quanto de cobertura é suficiente?',
          pontos: [
            'Fáceis de estender — adicionar caso é adicionar linha',
            'Subtests com t.Run permitem rodar caso isolado',
            '80% cobertura é bom; 100% nem sempre vale o esforço',
          ],
          diasDesafio: 'Dias 45–52',
          sugestaoBlog: 'Table-driven tests em Go: o padrão que todo dev Go precisa conhecer',
          hashtagsExtras: '#golang #testing #tdd',
        },
        aplicacao: {
          projeto: 'Suite de testes completa para um pacote de utilitários: table-driven + httptest.',
          requisitos: [
            'Table-driven tests com t.Run',
            'Cobertura > 80% (go test -cover)',
            'Testes HTTP com httptest',
          ],
          criterios: ['Testes passando', 'Edge cases cobertos', 'Boa cobertura'],
        },
      },
    },
    {
      id: 'test-avancado',
      title: 'Mocks, Fuzzing e Benchmarks',
      description: 'Interfaces para mocking, testify, fuzzing (Go 1.18+), benchmarks e profiling.',
      estimatedMinutes: 45,
      vesa: {
        visaoGeral: {
          explicacao: 'Mocking em Go é feito naturalmente com interfaces: define-se a dependência como interface, e o teste fornece uma implementação fake que satisfaz a interface. Não é necessário framework especial. Testify (github.com/stretchr/testify) adiciona: assert.Equal(t, expected, got) com mensagem de diff clara, require (fatal na primeira falha), e testify/mock para mocking declarativo. gomock (uber-go/mock) gera código de mock a partir de interfaces via mockgen.\n\nBenchmarks: funções BenchmarkNome(b *testing.B) com loop for i := 0; i < b.N; i++. O framework ajusta b.N automaticamente para medir com precisão. go test -bench=. -benchmem -benchtime=5s -count=3 fornece média de várias iterações. -benchmem mostra allocs/op e B/op -- essencial para otimizar hot paths. b.ResetTimer() reinicia o contador após setup; b.ReportAllocs() faz o mesmo que -benchmem para o benchmark específico.\n\nFuzzing (Go 1.18+): funções FuzzNome(f *testing.F) com f.Add para seed corpus e f.Fuzz(func(t *testing.T, args...) { }) para o fuzz target. go test -fuzz=FuzzNome executa indefinidamente gerando inputs mutados; go test -fuzz=FuzzNome -fuzztime=30s limita o tempo. Inputs que causam panic são salvos em testdata/fuzz/FuzzNome/ e reproduzidos em execuções normais. Profiling: go test -cpuprofile=cpu.out -memprofile=mem.out e go tool pprof cpu.out para encontrar gargalos.', ,
          codeExample: '// Mock manual via interface\ntype UserRepo interface {\n\tFindByID(id string) (*User, error)\n}\n\ntype mockRepo struct {\n\tusers map[string]*User\n}\n\nfunc (m *mockRepo) FindByID(id string) (*User, error) {\n\tu, ok := m.users[id]\n\tif !ok {\n\t\treturn nil, ErrNotFound\n\t}\n\treturn u, nil\n}\n\n// Benchmark\nfunc BenchmarkSoma(b *testing.B) {\n\tfor i := 0; i < b.N; i++ {\n\t\tSoma(1, 2)\n\t}\n}\n\n// Fuzz (Go 1.18+)\nfunc FuzzSoma(f *testing.F) {\n\tf.Add(1, 2)\n\tf.Fuzz(func(t *testing.T, a, b int) {\n\t\tresult := Soma(a, b)\n\t\tif result != a+b {\n\t\t\tt.Errorf("Soma(%d, %d) = %d", a, b, result)\n\t\t}\n\t})\n}',
          recursos: [
            'https://github.com/stretchr/testify',
            'https://go.dev/doc/fuzz/',
            'https://pkg.go.dev/testing#hdr-Benchmarks',
          ],
        },
        experimentacao: {
          desafio: 'Crie mock para uma interface Repository, escreva testes isolados do banco, adicione benchmark para uma função de sorting e fuzz para um parser.',
          dicas: [
            'Mock manual: struct que implementa interface',
            'Testify: assert.Equal(t, expected, got)',
            'go test -bench=. -benchmem -count=5',
            'go test -fuzz=FuzzNome -fuzztime=30s',
          ],
        },
        socializacao: {
          discussao: 'Mocks vs integration tests: qual o balanço ideal?',
          pontos: [
            'Mocks: rápidos, isolados, testam lógica',
            'Integration: lentos, reais, testam conexão',
            'Fuzzing encontra bugs que testes manuais não acham',
          ],
          diasDesafio: 'Dias 45–52',
          sugestaoBlog: 'Mocks, Fuzzing e Benchmarks: testando além do básico em Go',
          hashtagsExtras: '#golang #testing #fuzzing #benchmark',
        },
        aplicacao: {
          projeto: 'Adicione testes completos a um projeto: unit (mock), fuzz (parser), bench (hot path).',
          requisitos: [
            'Mocks para dependências externas',
            'Fuzzing para funções que aceitam input do usuário',
            'Benchmarks para funções críticas',
          ],
          criterios: ['Suite completa', 'Mocks isolam deps', 'Benchmarks documentados'],
        },
      },
    },
  ],
};
