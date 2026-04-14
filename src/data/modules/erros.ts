import type { ModuleMeta } from '../../types';

export const errosModule: ModuleMeta = {
  id: 'erros',
  title: 'Tratamento de Erros',
  description: 'Erros idiomáticos: wrapping, sentinel errors, errors.Is/As, multi-errors, panic/recover e boas práticas.',
  icon: 'AlertCircle',
  color: '#E74C3C',
  lessons: ['erros-padroes', 'erros-avancado'],
};
