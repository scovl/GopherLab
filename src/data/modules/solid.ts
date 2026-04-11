import { Module } from '../../types';

export const solidModule: Module = {
  id: 'solid',
  title: 'SOLID em Go',
  description: 'Princípios SOLID aplicados ao Go: composição, interfaces e design.',
  icon: 'Shield',
  color: '#9B59B6',
  lessons: [
    {
      id: 'solid-principios',
      title: 'Princípios SOLID em Go',
      description: 'SRP, OCP, LSP, ISP e DIP com exemplos idiomáticos.',
      estimatedMinutes: 60,
      vesa: {
        visaoGeral: {
          explicacao: 'SOLID em Go: **SRP** — cada struct/package tem uma responsabilidade. **OCP** — interfaces permitem extensão sem modificar código existente. **LSP** — tipos que implementam interface devem ser substituíveis. **ISP** — interfaces pequenas e focadas (io.Reader, io.Writer). **DIP** — dependa de interfaces, não implementações. Go facilita SOLID com interfaces implícitas e composição.',
          codeExample: '// ISP — interfaces pequenas\ntype Reader interface { Read(p []byte) (int, error) }\ntype Writer interface { Write(p []byte) (int, error) }\ntype ReadWriter interface { Reader; Writer }\n\n// DIP — dependa de abstrações\ntype UserService struct {\n\trepo UserRepository // interface, nunca struct concreto\n}\n\ntype UserRepository interface {\n\tFindByID(ctx context.Context, id string) (*User, error)\n\tSave(ctx context.Context, user *User) error\n}',
          recursos: ['https://dave.cheney.net/2016/08/20/solid-go-design'],
        },
        experimentacao: {
          desafio: 'Refatore um código monolítico (handler que faz tudo: HTTP, validação, banco) aplicando cada princípio SOLID.',
          dicas: [
            'SRP: separe handler, service, repository',
            'ISP: interface Repository com apenas os métodos usados',
            'DIP: service recebe interface, não struct concreto',
          ],
        },
        socializacao: {
          discussao: 'SOLID foi criado para OOP com herança. Faz sentido em Go que usa composição?',
          pontos: [
            'Go não tem herança — composição é mais flexível',
            'Interfaces implícitas facilitam ISP e DIP naturalmente',
            'Pragmatismo > purismo — aplique onde faz diferença',
          ],
          diasDesafio: 'Dias 77–82',
          sugestaoBlog: 'SOLID em Go: design com composição e interfaces implícitas',
          hashtagsExtras: '#golang #solid #cleancode',
        },
        aplicacao: {
          projeto: 'Refatore um "monolito" em Go aplicando os 5 princípios com before/after.',
          requisitos: [
            'Demonstrar cada princípio',
            'Testes para validar refatoração',
            'Documentar decisões de design',
          ],
          criterios: ['Cada princípio aplicado', 'Código mais testável', 'Sem regressões'],
        },
      },
    },
  ],
};
