import type { ModuleMeta } from '../../types';

export const foundationModule: ModuleMeta = {
  id: 'foundation',
  title: 'Fundamentos',
  description: 'Domine os conceitos básicos: tipos, variáveis, controle de fluxo, funções, structs, interfaces e mais.',
  icon: 'Blocks',
  color: '#5DC9E2',
  lessons: [
    'found-tipos',
    'found-strings-runes',
    'found-controle',
    'found-colecoes',
    'found-ponteiros',
    'found-funcoes',
    'found-structs',
    'found-interfaces',
    'found-packages',
  ],
};
