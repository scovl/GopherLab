import { Module } from '../../types';

export const genericsModule: Module = {
  id: 'generics',
  title: 'Generics',
  description: 'Generics (Go 1.18+): type parameters, constraints, inferência e casos de uso reais.',
  icon: 'Braces',
  color: '#8E44AD',
  lessons: [
    {
      id: 'gen-introducao',
      title: 'Introdução a Generics',
      description: 'Type parameters, any, comparable, funções e tipos genéricos.',
      estimatedMinutes: 45,
      vesa: {
        visaoGeral: {
          explicacao: 'Generics (Go 1.18+) permitem que funções e tipos sejam parametrizados por tipos, mantendo type safety total em compiletime. A sintaxe: func F[T Constraint](args) é instanciada pelo compilador para cada combinação de tipos concreta. A inferência de tipo evita explicítar os type params na maioria das chamadas: Filter(nums, fn) -- o compilador deduz T=int.\n\nany (é alias de interface{}) aceita qualquer tipo como constraint mas não permite operações além de atribuir, passar e armazenar. comparable habilita == e != -- necessário para usar T como chave de map ou em sets. Constraints mais específicas habilitam operações: ~ (tilde) indica "underlying type" -- ~int aceita int e quaisquer tipos definidos com base em int: type Minutes int satisfaz ~int. Union types: interface{ int | float64 } restringe a esses tipos exatos.\n\nO zero value de um type parameter T é obtido declarando var zero T -- não é possível usar nil diretamente (a menos que T seja uma interface ou tipo nilável). Métodos não podem ter próprios type parameters -- essa é uma limitação explícita do design Go. Funções genéricas não podem ser atribuídas a variáveis sem especificar os type params (sem valor de função genérico parcialmente aplicado).\n\nCasos de uso ideais: funções sobre coleções (Map, Filter, Reduce, Contains), tipos contêner (Stack, Queue, Set, Cache), algoritmos genéricos (Sort, BinarySearch), utilitarios de erro (Must[T], Ptr[T]). Não use generics quando uma interface resolve o problema com a mesma clareza -- a regra prática: se você precisa work with the structure of the type (indexes, arithmetic), use generics; se só precisa invocar métodos, use interfaces.',           codeExample: 'package main\n\nimport "fmt"\n\n// Função genérica\nfunc Filter[T any](slice []T, fn func(T) bool) []T {\n\tvar result []T\n\tfor _, v := range slice {\n\t\tif fn(v) {\n\t\t\tresult = append(result, v)\n\t\t}\n\t}\n\treturn result\n}\n\n// Tipo genérico\ntype Stack[T any] struct {\n\titems []T\n}\n\nfunc (s *Stack[T]) Push(item T) { s.items = append(s.items, item) }\n\nfunc (s *Stack[T]) Pop() (T, bool) {\n\tvar zero T\n\tif len(s.items) == 0 {\n\t\treturn zero, false\n\t}\n\tn := len(s.items) - 1\n\titem := s.items[n]\n\ts.items = s.items[:n]\n\treturn item, true\n}\n\nfunc main() {\n\t// Filter genérico\n\tnums := []int{1, 2, 3, 4, 5}\n\tpares := Filter(nums, func(n int) bool { return n%2 == 0 })\n\tfmt.Println(pares) // [2 4]\n\n\t// Stack genérica\n\ts := Stack[string]{}\n\ts.Push("Go")\n\ts.Push("Generics")\n\tv, _ := s.Pop()\n\tfmt.Println(v) // Generics\n}',
          recursos: [
            'https://go.dev/doc/tutorial/generics',
            'https://go.dev/blog/intro-generics',
          ],
        },
        experimentacao: {
          desafio: 'Implemente Map, Filter e Reduce genéricos. Depois, crie um Set[T comparable] com Add, Contains, Remove, Union e Intersection.',
          dicas: [
            'Map[T, U any]([]T, func(T) U) []U',
            'Set usa map[T]struct{} internamente (memoria mínima)',
            'Reduce[T, U any]([]T, U, func(U, T) U) U',
          ],
          codeTemplate: 'package main\n\nfunc Map[T, U any](s []T, fn func(T) U) []U {\n\t// Implemente\n\treturn nil\n}\n\nfunc Reduce[T, U any](s []T, init U, fn func(U, T) U) U {\n\t// Implemente\n\tvar zero U\n\treturn zero\n}',
        },
        socializacao: {
          discussao: 'Generics resolvem quais problemas? Quando NÃO usar?',
          pontos: [
            'Antes: sort.IntSlice, sort.StringSlice, sort.Float64Slice...',
            'Agora: uma função Sort[T constraints.Ordered]',
            'Não use quando interface simples resolve o problema',
          ],
          diasDesafio: 'Dias 69–76',
          sugestaoBlog: 'Generics em Go: Map, Filter, Reduce e coleções type-safe',
          hashtagsExtras: '#golang #generics',
        },
        aplicacao: {
          projeto: 'Pacote de coleções genéricas: Set[T], Queue[T] e Cache[K, V] com TTL.',
          requisitos: [
            'Set: Add, Remove, Contains, Union, Intersection',
            'Queue: Enqueue, Dequeue, Peek, Len',
            'Cache: Get, Set com TTL, Delete, cleanup automático',
          ],
          criterios: ['Type safety em compilação', 'Testes unitários', 'Benchmark vs interface{}'],
        },
      },
    },
    {
      id: 'gen-constraints',
      title: 'Constraints Avançadas',
      description: 'constraints.Ordered, union types, ~T, limitações e design patterns.',
      estimatedMinutes: 40,
      vesa: {
        visaoGeral: {
          explicacao: 'Constraints em Go generics são interfaces que definem o conjunto de tipos permítidos e as operações disponíveis. Uma constraint pode ser: (1) uma interface com métodos (como io.Reader), que habilita apenas esses métodos; (2) uma interface com union de tipos (int | string), que habilita as operações comuns a todos os tipos listados (ex: +, ==); (3) uma combinação.\n\nO operador ~ (tilde): ~int significa "qualquer tipo cujo tipo subjacente (underlying type) é int". O underlying type de type Minutes int é int, então Minutes satisfaz ~int. Sem ~, apenas o tipo exato (int) satisfaria a constraint. Tipicamente as constraints custom usam ~ para aceitar definitões de tipo: interface{ ~int | ~int8 | ~int16 | ~int32 | ~int64 }.\n\nO pacote golang.org/x/exp/constraints (experimental, parte oficial futura) oferece: Ordered (todos os tipos com >, <, >=, <=), Integer (todos os inteiros signed e unsigned), Float, Complex, Signed, Unsigned. Para o pacote padrão, cmp.Ordered (Go 1.21) está disponível na stdlib. slices.Sort[S ~[]E, E cmp.Ordered](s S) usa isso na prática.\n\nLimitações do design atual: não é possível usar type parameters em métodos de structs genéricas (apenas no receiver). Não há specialization -- o mesmo código gerado para todos os tipos (ao contrário de C++ templates). Não é possível converter []T para []interface{}. Variádicos genéricos não existem. Essas limitações foram escolhas deliberadas de simplicidade, mas podem ser relaxadas em versões futuras.',           codeExample: 'package main\n\nimport (\n\t"fmt"\n\t"golang.org/x/exp/constraints"\n)\n\n// constraints.Ordered: <, >, <=, >=\nfunc Max[T constraints.Ordered](a, b T) T {\n\tif a > b {\n\t\treturn a\n\t}\n\treturn b\n}\n\n// Custom constraint com ~\ntype Number interface {\n\t~int | ~int64 | ~float64\n}\n\nfunc Soma[T Number](nums ...T) T {\n\tvar total T\n\tfor _, n := range nums {\n\t\ttotal += n\n\t}\n\treturn total\n}\n\n// ~ permite type aliases\ntype Celsius float64\n\nfunc main() {\n\tfmt.Println(Max(10, 20))       // int\n\tfmt.Println(Max("abc", "xyz")) // string\n\n\tvar c1, c2 Celsius = 36.5, 37.2\n\tfmt.Println(Soma(c1, c2)) // funciona por causa de ~float64\n}',
          recursos: [
            'https://pkg.go.dev/golang.org/x/exp/constraints',
            'https://go.dev/blog/intro-generics',
          ],
        },
        experimentacao: {
          desafio: 'Implemente BinarySearch e MergeSort genéricos usando constraints.Ordered. Compare performance com sort.Slice.',
          dicas: [
            'go get golang.org/x/exp para usar constraints',
            'Crie sua constraint: type Numeric interface { ~int | ~float64 }',
            '~ é essencial para aceitar type aliases',
          ],
        },
        socializacao: {
          discussao: 'Go acertou no design de generics? Quais limitações surpreenderam?',
          pontos: [
            'Métodos não podem ter type params próprios',
            'Sem specialization (tratamento especial por tipo)',
            'Comparado com C++ templates: muito mais simples',
            'Go priorizou simplicidade — trade-off válido',
          ],
          diasDesafio: 'Dias 69–76',
          sugestaoBlog: 'Constraints em Go: ~T, union types e limitações dos generics',
          hashtagsExtras: '#golang #generics #constraints',
        },
        aplicacao: {
          projeto: 'Biblioteca de algoritmos genéricos: BinarySearch, MergeSort e MinHeap.',
          requisitos: [
            'BinarySearch[T constraints.Ordered]',
            'MergeSort[T constraints.Ordered]',
            'MinHeap[T constraints.Ordered] com Push/Pop/Peek',
          ],
          criterios: ['Corretos', 'Performance competitiva', 'Testes com edge cases'],
        },
      },
    },
  ],
};
