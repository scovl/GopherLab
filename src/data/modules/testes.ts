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
          explicacao: 'Go tem testes built-in: arquivos `_test.go`, funções `Test*(t *testing.T)`. Table-driven tests são o padrão idiomático: slice de structs com input/expected, loop com `t.Run` para subtests nomeados. `go test -cover` mede cobertura. `go test -v` mostra output detalhado. `httptest` permite testar HTTP handlers sem servidor real.',
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
          explicacao: 'Mocking em Go é natural via interfaces: crie implementação fake que satisfaz a interface. Testify adiciona assertions e mock helpers. Fuzzing (Go 1.18+) gera inputs aleatórios para encontrar bugs. Benchmarks (Benchmark*) medem performance com `b.N` iterações. `go test -bench=.` executa benchmarks; `go test -benchmem` mostra alocações.',
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
