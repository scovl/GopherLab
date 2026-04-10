import React from 'react';
import { Lesson, Module } from '../types';
import { MesaPhases } from './MesaPhases';
import { useRoadmap } from '../hooks/useRoadmap';

interface LessonViewProps {
  lesson: Lesson;
  module: Module;
  onBack: () => void;
  onNavigate: (lessonId: string) => void;
}

export function LessonView({ lesson, module, onBack, onNavigate }: Readonly<LessonViewProps>) {
  const { getNextLesson, getPrevLesson } = useRoadmap();
  const next = getNextLesson(lesson.id);
  const prev = getPrevLesson(lesson.id);

  return (
    <article className="lesson-view" aria-label={`Aula: ${lesson.title}`}>
      <nav className="lesson-breadcrumb" aria-label="Navegação do conteúdo">
        <button className="btn btn-ghost" onClick={onBack} aria-label="Voltar para o roadmap">
          ← Roadmap
        </button>
        <span aria-hidden="true">/</span>
        <span>{module.title}</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{lesson.title}</span>
      </nav>

      <header className="lesson-header">
        <div className="lesson-header-badge" style={{ backgroundColor: module.color }}>
          {module.title}
        </div>
        <h1>{lesson.title}</h1>
        <p className="lesson-description">{lesson.description}</p>
        <div className="lesson-meta-bar">
          <span className="meta-item" aria-label={`Tempo estimado: ${lesson.estimatedMinutes} minutos`}>
            ⏱ ~{lesson.estimatedMinutes} min
          </span>
        </div>
      </header>

      <MesaPhases mesa={lesson.mesa} lessonId={lesson.id} />

      <nav className="lesson-pagination" aria-label="Navegação entre aulas">
        {prev ? (
          <button className="btn btn-secondary" onClick={() => onNavigate(prev.id)}>
            ← {prev.title}
          </button>
        ) : <span />}
        {next ? (
          <button className="btn btn-primary" onClick={() => onNavigate(next.id)}>
            {next.title} →
          </button>
        ) : <span />}
      </nav>
    </article>
  );
}
