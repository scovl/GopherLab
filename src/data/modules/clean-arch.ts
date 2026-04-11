import { Module } from '../../types';

export const cleanArchModule: Module = {
  id: 'clean-arch',
  title: 'Clean Architecture',
  description: 'Clean Architecture em Go: entities, use cases, adapters e frameworks.',
  icon: 'Layers',
  color: '#1ABC9C',
  lessons: [
    {
      id: 'clean-conceitos',
      title: 'Clean Architecture: Conceitos e Implementação',
      description: 'Camadas, regras de dependência, entities, use cases e project layout.',
      estimatedMinutes: 55,
      vesa: {
        visaoGeral: {
          explicacao: 'Clean Architecture separa código em camadas com dependências apontando para dentro: **Entities** (domínio, regras de negócio) → **Use Cases** (lógica de aplicação) → **Adapters** (HTTP handlers, repos) → **Frameworks** (banco, web). A regra de ouro: camadas internas nunca importam externas. Em Go: `internal/entity/`, `internal/usecase/`, `internal/infra/`, `cmd/`.',
          codeExample: '# Layout Go com Clean Architecture\ncmd/\n  server/main.go         # entry point, DI\ninternal/\n  entity/                # domínio puro (structs, regras)\n    order.go\n  usecase/               # lógica de aplicação\n    create_order.go\n  infra/                 # adapters\n    handler/http.go      # HTTP handler\n    repository/pg.go     # PostgreSQL repo\npkg/                     # libs públicas reutilizáveis',
          recursos: [
            'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html',
          ],
        },
        experimentacao: {
          desafio: 'Crie um projeto com Clean Architecture: entity Order, use case CreateOrder, handler HTTP e repository (in-memory para começar).',
          dicas: [
            'Entity não importa nenhum pacote externo',
            'Use case depende de interface Repository, não implementação',
            'Handler converte HTTP ↔ use case',
          ],
        },
        socializacao: {
          discussao: 'Clean Architecture adiciona complexidade. Quando vale a pena?',
          pontos: [
            'Projetos pequenos: overengineering',
            'Projetos médios/grandes: testabilidade e manutenção',
            'Pragmatismo: não precisa ser 100% puro',
          ],
          diasDesafio: 'Dias 77–82',
          sugestaoBlog: 'Clean Architecture em Go: do conceito ao código real',
          hashtagsExtras: '#golang #cleanarchitecture',
        },
        aplicacao: {
          projeto: 'Sistema de pedidos com Clean Architecture completa.',
          requisitos: [
            'Entities: Order, Product',
            'Use Cases: CreateOrder, ListOrders',
            'Adapters: HTTP handler, PostgreSQL repository',
            'Testes: use cases testáveis sem infra',
          ],
          criterios: ['Regra de dependência respeitada', 'Use cases testáveis isoladamente', 'Código organizado'],
        },
      },
    },
  ],
};
