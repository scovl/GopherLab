import React, { useState, useRef, useEffect } from 'react';
import { Lesson, Module } from '../types';
import { VesaPhases } from './VesaPhases';
import { useRoadmap } from '../hooks/useRoadmap';
import { SelectionToolbar } from './SelectionToolbar';
import { ErrorBoundary } from './ErrorBoundary';

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
  const [focusIndex, setFocusIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowLessons(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!showLessons) {
      setFocusIndex(-1);
    }
  }, [showLessons]);

  useEffect(() => {
    const item = itemRefs.current[focusIndex];
    if (item) {
      const btn = item.querySelector('button') as HTMLButtonElement | null;
      btn?.focus();
    }
  }, [focusIndex]);

  const handleToggleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!showLessons) {
        setShowLessons(true);
        setFocusIndex(e.key === 'ArrowDown' ? 0 : module.lessons.length - 1);
      }
    } else if (e.key === 'Escape' && showLessons) {
      e.preventDefault();
      setShowLessons(false);
      toggleRef.current?.focus();
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    const len = module.lessons.length;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusIndex(prev => (prev + 1) % len);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusIndex(prev => (prev <= 0 ? len - 1 : prev - 1));
        break;
      case 'Home':
        e.preventDefault();
        setFocusIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusIndex(len - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusIndex >= 0 && focusIndex < len) {
          onNavigate(module.lessons[focusIndex].id);
          setShowLessons(false);
          toggleRef.current?.focus();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowLessons(false);
        toggleRef.current?.focus();
        break;
    }
  };

  return (
    <article className="lesson-view" aria-label={`Aula: ${lesson.title}`}>
      <nav className="lesson-breadcrumb" aria-label="Navegação do conteúdo">
        <button className="btn btn-ghost" onClick={onBack} aria-label="Voltar para o roadmap">
          ← Roadmap
        </button>
        <span aria-hidden="true">/</span>
        <div className="breadcrumb-dropdown" ref={dropdownRef}>
          <button
            ref={toggleRef}
            className="btn btn-ghost breadcrumb-module-btn"
            onClick={() => setShowLessons(v => !v)}
            onKeyDown={handleToggleKeyDown}
            aria-expanded={showLessons}
            aria-haspopup="menu"
            aria-controls="breadcrumb-menu"
          >
            {module.title} <span className="breadcrumb-chevron" aria-hidden="true">▾</span>
          </button>
          {showLessons && (
            <ul id="breadcrumb-menu" className="breadcrumb-lesson-list" role="menu" aria-label={`Aulas de ${module.title}`} onKeyDown={handleMenuKeyDown}>
              {module.lessons.map((l, i) => (
                <li key={l.id} role="menuitem" aria-current={l.id === lesson.id ? 'page' : undefined} ref={el => { itemRefs.current[i] = el; }}>
                  <button
                    className={`breadcrumb-lesson-item${l.id === lesson.id ? ' active' : ''}`}
                    onClick={() => { onNavigate(l.id); setShowLessons(false); }}
                    tabIndex={-1}
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

      <ErrorBoundary>
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
      </ErrorBoundary>

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
