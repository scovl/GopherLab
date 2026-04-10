import React from 'react';
import { Module } from '../types';
import { useProgress } from '../context/ProgressContext';
import { ProgressBar } from './ProgressBar';

interface ModuleCardProps {
  module: Module;
  onSelect: (moduleId: string) => void;
  isExpanded: boolean;
  onLessonSelect: (lessonId: string) => void;
}

export function ModuleCard({ module, onSelect, isExpanded, onLessonSelect }: Readonly<ModuleCardProps>) {
  const { isLessonCompleted } = useProgress();
  const lessonIds = module.lessons.map(l => l.id);

  return (
    <div className="module-card" style={{ '--module-color': module.color } as React.CSSProperties}>
      <button
        className="module-header"
        onClick={() => onSelect(module.id)}
        aria-expanded={isExpanded}
        aria-controls={`module-${module.id}-lessons`}
      >
        <div className="module-header-left">
          <span className="module-icon" style={{ backgroundColor: module.color }} aria-hidden="true">
            {module.icon === 'Rocket' && '🚀'}
            {module.icon === 'Blocks' && '🧱'}
            {module.icon === 'Package' && '📦'}
            {module.icon === 'GitBranch' && '🔀'}
            {module.icon === 'Globe' && '🌐'}
            {module.icon === 'TestTube' && '🧪'}
            {module.icon === 'Database' && '🗄️'}
            {module.icon === 'Shield' && '🛡️'}
            {module.icon === 'Layers' && '📐'}
            {module.icon === 'Wrench' && '🔧'}
            {module.icon === 'Cpu' && '⚙️'}
            {module.icon === 'Cloud' && '☁️'}
          </span>
          <div className="module-info">
            <h3 className="module-title">{module.title}</h3>
            <p className="module-description">{module.description}</p>
          </div>
        </div>
        <span className={`module-chevron ${isExpanded ? 'expanded' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>

      <ProgressBar moduleId={module.id} lessonIds={lessonIds} />

      {isExpanded && (
        <ul
          className="module-lessons"
          id={`module-${module.id}-lessons`}
          aria-label={`Aulas do módulo ${module.title}`}
        >
          {module.lessons.map((lesson, index) => {
            const completed = isLessonCompleted(lesson.id);
            return (
              <li key={lesson.id} className="lesson-item">
                <button
                  className={`lesson-button ${completed ? 'completed' : ''}`}
                  onClick={() => onLessonSelect(lesson.id)}
                  aria-label={`${completed ? 'Concluída: ' : ''}Aula ${index + 1}: ${lesson.title}`}
                >
                  <span className="lesson-status" aria-hidden="true">
                    {completed ? '✓' : (index + 1)}
                  </span>
                  <div className="lesson-info">
                    <span className="lesson-title">{lesson.title}</span>
                    <span className="lesson-meta">
                      ~{lesson.estimatedMinutes} min
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
