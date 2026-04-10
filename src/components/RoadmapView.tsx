import React, { useState } from 'react';
import { useRoadmap } from '../hooks/useRoadmap';
import { ModuleCard } from './ModuleCard';
import { ProgressBar } from './ProgressBar';
import { useProgress } from '../context/ProgressContext';

interface RoadmapViewProps {
  onLessonSelect: (lessonId: string) => void;
}

export function RoadmapView({ onLessonSelect }: Readonly<RoadmapViewProps>) {
  const { modules, totalLessons } = useRoadmap();
  const { progress } = useProgress();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const completedCount = progress.completedLessons.length;
  const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <main className="roadmap-view" role="main" aria-label="Roadmap de aprendizado Go">
      <div>
          <header className="roadmap-header">
            <h1>Aprenda Go</h1>
            <p className="roadmap-subtitle">
              Roadmap completo de aprendizado em Golang com metodologia MESA
            </p>
            <div className="roadmap-stats" aria-live="polite">
              <div className="stat-card">
                <span className="stat-number">{modules.length}</span>
                <span className="stat-label">Módulos</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{totalLessons}</span>
                <span className="stat-label">Aulas</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{completedCount}</span>
                <span className="stat-label">Concluídas</span>
              </div>
              <div className="stat-card highlighted">
                <span className="stat-number">{percentage}%</span>
                <span className="stat-label">Progresso</span>
              </div>
            </div>
            <ProgressBar />
          </header>

          <section className="mesa-explainer" aria-label="Sobre a metodologia MESA">
            <h2>Metodologia MESA</h2>
            <p>Cada aula segue 4 fases para aprendizado profundo e estruturado:</p>
            <div className="mesa-phases-overview">
              <div className="mesa-phase-card">
                <span className="phase-icon" aria-hidden="true">👁️</span>
                <h3>Modelagem</h3>
                <p>Observe e compreenda o conceito com explicações e exemplos de código</p>
              </div>
              <div className="mesa-phase-card">
                <span className="phase-icon" aria-hidden="true">🧪</span>
                <h3>Experimentação</h3>
                <p>Pratique com desafios guiados e dicas passo a passo</p>
              </div>
              <div className="mesa-phase-card">
                <span className="phase-icon" aria-hidden="true">💬</span>
                <h3>Socialização</h3>
                <p>Reflita sobre o que aprendeu e discuta com a comunidade</p>
              </div>
              <div className="mesa-phase-card">
                <span className="phase-icon" aria-hidden="true">🚀</span>
                <h3>Aplicação</h3>
                <p>Aplique o conhecimento em um projeto prático real</p>
              </div>
            </div>
          </section>

          <section className="modules-list" aria-label="Módulos do roadmap">
            <h2>Módulos</h2>
            {modules.map(module => (
              <ModuleCard
                key={module.id}
                module={module}
                isExpanded={expandedModules.has(module.id)}
                onSelect={toggleModule}
                onLessonSelect={onLessonSelect}
              />
            ))}
          </section>
      </div>
    </main>
  );
}
