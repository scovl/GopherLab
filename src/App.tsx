import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { RoadmapView } from './components/RoadmapView';
import { RoadmapTree } from './components/RoadmapTree';
import { LessonView } from './components/LessonView';
import { AccessibilityPanel } from './components/AccessibilityPanel';
import { IrcView } from './components/IrcView';
import { useRoadmap } from './hooks/useRoadmap';
import { useProgress } from './context/ProgressContext';

type AppView = 'roadmap' | 'lesson' | 'accessibility' | 'irc';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('roadmap');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const { findLesson, modules } = useRoadmap();
  const { setCurrentLesson, progress } = useProgress();

  const handleLessonSelect = useCallback(
    (lessonId: string) => {
      setSelectedLessonId(lessonId);
      setCurrentLesson(lessonId);
      setCurrentView('lesson');
      // Scroll to top on navigation
      window.scrollTo({ top: 0 });
    },
    [setCurrentLesson]
  );

  const handleBackToRoadmap = useCallback(() => {
    setCurrentView('roadmap');
    setSelectedLessonId(null);
    setCurrentLesson(null);
  }, [setCurrentLesson]);

  const handleSidebarNavigate = useCallback((view: 'roadmap' | 'accessibility' | 'irc') => {
    setCurrentView(view);
    if (view === 'roadmap') {
      setSelectedLessonId(null);
      setCurrentLesson(null);
    }
  }, [setCurrentLesson]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentView === 'lesson') {
        handleBackToRoadmap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, handleBackToRoadmap]);

  const lessonData = selectedLessonId ? findLesson(selectedLessonId) : null;

  const handleModuleClick = useCallback((moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    const firstIncomplete = mod.lessons.find(l => !progress.completedLessons.includes(l.id));
    const target = firstIncomplete ?? mod.lessons[mod.lessons.length - 1];
    if (target) handleLessonSelect(target.id);
  }, [modules, progress.completedLessons, handleLessonSelect]);

  // Skip-to-content link for accessibility
  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>

      <Sidebar
        onNavigate={handleSidebarNavigate}
        currentView={currentView === 'lesson' ? 'roadmap' : currentView}
      />

      <div className={`main-content${currentView === 'irc' ? ' main-content--irc' : ''}`} id="main-content" tabIndex={-1} data-roadmap-sidebar="true">
        {currentView === 'roadmap' && (
          <RoadmapView onLessonSelect={handleLessonSelect} />
        )}
        {currentView === 'lesson' && lessonData && (
          <LessonView
            lesson={lessonData.lesson}
            module={lessonData.module}
            onBack={handleBackToRoadmap}
            onNavigate={handleLessonSelect}
          />
        )}
        {currentView === 'accessibility' && (
          <div className="page-container">
            <AccessibilityPanel />
          </div>
        )}
        {currentView === 'irc' && <IrcView />}

        {currentView !== 'irc' && (
          <footer className="app-footer">
            <span className="app-footer__divider" aria-hidden="true" />
            <p>
              Feito com ♥ por{' '}
              <a href="https://scovl.github.io/" target="_blank" rel="noopener noreferrer">
                Vitor Lobo
              </a>
            </p>
            <p className="app-footer__sub">
              Projeto open source — contribuições são bem-vindas
            </p>
          </footer>
        )}
      </div>

      <aside className="roadmap-sidebar" aria-label="Mapa visual do roadmap">
        <RoadmapTree onModuleClick={handleModuleClick} />
      </aside>
    </div>
  );
}
