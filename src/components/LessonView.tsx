import React, { useState, useRef, useEffect } from 'react';
import { Lesson, Module } from '../types';
import { VesaPhases } from './VesaPhases';
import { useRoadmap } from '../hooks/useRoadmap';
import { SelectionToolbar } from './SelectionToolbar';

interface LessonViewProps {
  lesson: Lesson;
  module: Module;
  onBack: () => void;
  onNavigate: (lessonId: string) => void;
  onPinNote?: (id: string, lessonId: string, lessonTitle: string, text: string, note: string) => void;
}

export function LessonView({ lesson, module, onBack, onNavigate, onPinNote }: Readonly<LessonViewProps>) {
  const { getNextLesson, getPrevLesson } = useRoadmap();
  const next = getNextLesson(lesson.id);
  const prev = getPrevLesson(lesson.id);
  const [showLessons, setShowLessons] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLessons(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <article className="lesson-view" aria-label={`Aula: ${lesson.title}`}>
      <nav className="lesson-breadcrumb" aria-label="Navegação do conteúdo">
        <button className="btn btn-ghost" onClick={onBack} aria-label="Voltar para o roadmap">
          ← Roadmap
        </button>
        <span aria-hidden="true">/</span>
        <div className="breadcrumb-dropdown" ref={dropdownRef}>
          <button
            className="btn btn-ghost breadcrumb-module-btn"
            onClick={() => setShowLessons(v => !v)}
            aria-expanded={showLessons}
            aria-haspopup="listbox"
          >
            {module.title} <span className="breadcrumb-chevron" aria-hidden="true">▾</span>
          </button>
          {showLessons && (
            <ul className="breadcrumb-lesson-list" role="listbox" aria-label={`Aulas de ${module.title}`}>
              {module.lessons.map(l => (
                <li key={l.id} role="option" aria-selected={l.id === lesson.id}>
                  <button
                    className={`breadcrumb-lesson-item${l.id === lesson.id ? ' active' : ''}`}
                    onClick={() => { onNavigate(l.id); setShowLessons(false); }}
                  >
                    {l.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{lesson.title}</span>
      </nav>

      <SelectionToolbar lessonId={lesson.id} lessonTitle={lesson.title} onPinNote={onPinNote}>
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

        <VesaPhases key={lesson.id} vesa={lesson.vesa} lessonId={lesson.id} />
      </SelectionToolbar>

      <nav className="lesson-pagination" aria-label="Navegação entre aulas">
        {prev ? (
          <button className="btn btn-secondary" onClick={() => onNavigate(prev.id)}>
            ← {prev.title}
          </button>
        ) : <span />}
        {next ? (
          <button className="btn btn-next-lesson" onClick={() => onNavigate(next.id)}>
            <span className="btn-next-lesson__label">Próximo tópico</span>
            <span className="btn-next-lesson__title">{next.title} →</span>
          </button>
        ) : <span />}
      </nav>
    </article>
  );
}
