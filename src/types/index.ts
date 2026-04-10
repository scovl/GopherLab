export type MesaPhase = 'modelagem' | 'experimentacao' | 'socializacao' | 'aplicacao';

export interface MesaContent {
  modelagem: {
    explicacao: string;
    codeExample?: string;
    recursos: string[];
  };
  experimentacao: {
    desafio: string;
    dicas: string[];
    codeTemplate?: string;
  };
  socializacao: {
    discussao?: string;
    pontos?: string[];
    diasDesafio?: string;
    sugestaoBlog?: string;
    hashtagsExtras?: string;
  };
  aplicacao: {
    projeto: string;
    requisitos: string[];
    criterios: string[];
    starterCode?: string;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  mesa: MesaContent;
  estimatedMinutes: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lessons: Lesson[];
}

export interface UserProgress {
  completedLessons: string[];
  currentLesson: string | null;
  currentPhase: MesaPhase | null;
  moduleNotes: Record<string, string>;
  startedAt: string;
  lastAccessedAt: string;
}

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  theme: 'light' | 'dark' | 'sepia';
  focusHighlight: boolean;
  lineSpacing: 'normal' | 'relaxed' | 'spacious';
  sidebarCollapsed: boolean;
}

export const MESA_LABELS: Record<MesaPhase, { label: string; description: string; icon: string }> = {
  modelagem: {
    label: 'Modelagem',
    description: 'Observe e compreenda o conceito apresentado com exemplos claros',
    icon: '👁️',
  },
  experimentacao: {
    label: 'Experimentação',
    description: 'Pratique o conceito com exercícios guiados passo a passo',
    icon: '🧪',
  },
  socializacao: {
    label: 'Socialização',
    description: 'Reflita e compartilhe o que aprendeu com a comunidade',
    icon: '💬',
  },
  aplicacao: {
    label: 'Aplicação',
    description: 'Aplique o conhecimento em um projeto prático e real',
    icon: '🚀',
  },
};
