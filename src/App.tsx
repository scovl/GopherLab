import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { RoadmapView } from './components/RoadmapView';
import { RoadmapTree } from './components/RoadmapTree';
import { LessonView } from './components/LessonView';
import { AccessibilityPanel } from './components/AccessibilityPanel';
import { useRoadmap } from './hooks/useRoadmap';
import { useProgress } from './context/ProgressContext';
import { useNoteShelf, ShelfStickyManager, type ShelfNote } from './components/NoteShelf';
import { ScrollToTop } from './components/ScrollToTop';

type AppView = 'roadmap' | 'lesson' | 'accessibility';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('roadmap');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const { findLesson, modules } = useRoadmap();
  const { setCurrentLesson, progress } = useProgress();
  const { shelf, pinToShelf, removeFromShelf, updateShelfNote } = useNoteShelf();
  const [openShelfNotes, setOpenShelfNotes] = useState<ShelfNote[]>([]);

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

  const handleSidebarNavigate = useCallback((view: 'roadmap' | 'accessibility') => {
    setCurrentView(view);
    if (view === 'roadmap') {
      setSelectedLessonId(null);
      setCurrentLesson(null);
    }
  }, [setCurrentLesson]);

  const handlePinNote = useCallback((id: string, lessonId: string, lessonTitle: string, text: string, note: string) => {
    pinToShelf({ id, lessonId, lessonTitle, text, note });
  }, [pinToShelf]);

  const handleOpenShelfNote = useCallback((sn: ShelfNote) => {
    setOpenShelfNotes(prev => prev.some(n => n.id === sn.id) ? prev : [...prev, sn]);
  }, []);

  const handleCloseShelfNote = useCallback((id: string) => {
    setOpenShelfNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleSaveShelfNote = useCallback((id: string, noteText: string) => {
    updateShelfNote(id, noteText);
    setOpenShelfNotes(prev => prev.map(n => (n.id === id ? { ...n, note: noteText } : n)));
  }, [updateShelfNote]);

  const handleDeleteShelfNote = useCallback((id: string) => {
    removeFromShelf(id);
    setOpenShelfNotes(prev => prev.filter(n => n.id !== id));
  }, [removeFromShelf]);

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
        shelf={shelf}
        onOpenShelfNote={handleOpenShelfNote}
        onRemoveShelfNote={removeFromShelf}
      />

      <div className="main-content" id="main-content" tabIndex={-1} data-roadmap-sidebar="true">
        {currentView === 'roadmap' && (
          <RoadmapView onLessonSelect={handleLessonSelect} />
        )}
        {currentView === 'lesson' && lessonData && (
          <LessonView
            lesson={lessonData.lesson}
            module={lessonData.module}
            onBack={handleBackToRoadmap}
            onNavigate={handleLessonSelect}
            onPinNote={handlePinNote}
          />
        )}
        {currentView === 'accessibility' && (
          <div className="page-container">
            <AccessibilityPanel />
          </div>
        )}

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
      </div>

      <aside className="roadmap-sidebar" aria-label="Mapa visual do roadmap">
        <RoadmapTree onModuleClick={handleModuleClick} />
      </aside>

      <ShelfStickyManager
        openNotes={openShelfNotes}
        onSave={handleSaveShelfNote}
        onClose={handleCloseShelfNote}
        onDelete={handleDeleteShelfNote}
      />

      <ScrollToTop />
    </div>
  );
}
