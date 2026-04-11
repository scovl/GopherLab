/// <reference types="vite/client" />
import jsYaml from 'js-yaml';
import type { Lesson } from '../../types';

const rawFiles = import.meta.glob('./*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  if (!raw.startsWith('---')) return { data: {}, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { data: {}, body: raw };
  const yamlStr = raw.slice(4, end);
  const body = raw.slice(end + 4).replace(/^\n/, '');
  const data = (jsYaml.load(yamlStr) ?? {}) as Record<string, unknown>;
  return { data, body };
}

function arr(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(String);
}

const lessonMap = new Map<string, Lesson>();

for (const [path, raw] of Object.entries(rawFiles)) {
  const id = path.replace('./', '').replace('.md', '');
  const { data, body } = parseFrontmatter(raw);

  const lesson: Lesson = {
    id,
    title: String(data.title ?? id),
    description: String(data.description ?? ''),
    estimatedMinutes: Number(data.estimatedMinutes ?? 30),
    vesa: {
      visaoGeral: {
        explicacao: body || undefined,
        codeExample: data.codeExample !== undefined && String(data.codeExample) !== 'NONE' ? String(data.codeExample) : undefined,
        recursos: arr(data.recursos),
      },
      experimentacao: {
        desafio: String((data.experimentacao as Record<string, unknown>)?.desafio ?? ''),
        dicas: arr((data.experimentacao as Record<string, unknown>)?.dicas),
        codeTemplate: ((data.experimentacao as Record<string, unknown>)?.codeTemplate as string) || undefined,
        notaPos: ((data.experimentacao as Record<string, unknown>)?.notaPos as string) || undefined,
      },
      socializacao: {
        discussao: String((data.socializacao as Record<string, unknown>)?.discussao ?? '') || undefined,
        pontos: arr((data.socializacao as Record<string, unknown>)?.pontos),
        diasDesafio: String((data.socializacao as Record<string, unknown>)?.diasDesafio ?? '') || undefined,
        sugestaoBlog: String((data.socializacao as Record<string, unknown>)?.sugestaoBlog ?? '') || undefined,
        hashtagsExtras: String((data.socializacao as Record<string, unknown>)?.hashtagsExtras ?? '') || undefined,
      },
      aplicacao: {
        projeto: String((data.aplicacao as Record<string, unknown>)?.projeto ?? ''),
        requisitos: arr((data.aplicacao as Record<string, unknown>)?.requisitos),
        criterios: arr((data.aplicacao as Record<string, unknown>)?.criterios),
        starterCode: ((data.aplicacao as Record<string, unknown>)?.starterCode as string) || undefined,
      },
    },
  };

  lessonMap.set(id, lesson);
}

export function getLesson(id: string): Lesson | undefined {
  return lessonMap.get(id);
}

export function getLessonContent(lessonId: string): string {
  return lessonMap.get(lessonId)?.vesa.visaoGeral.explicacao ?? '';
}
