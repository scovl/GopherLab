import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useProgress } from '../context/ProgressContext';
import { useRoadmap } from '../hooks/useRoadmap';

interface SidebarProps {
  onNavigate: (view: 'roadmap' | 'accessibility' | 'irc') => void;
  currentView: string;
}

export function Sidebar({ onNavigate, currentView }: Readonly<SidebarProps>) {
  const { settings, updateSetting } = useAccessibility();
  const { progress } = useProgress();
  const { totalLessons } = useRoadmap();

  const completedCount = progress.completedLessons.length;
  const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  if (settings.sidebarCollapsed) {
    return (
      <aside className="sidebar collapsed" aria-label="Menu lateral (colapsado)">
        <button
          className="sidebar-toggle"
          onClick={() => updateSetting('sidebarCollapsed', false)}
          aria-label="Expandir menu lateral"
          title="Expandir menu"
        >
          ☰
        </button>
      </aside>
    );
  }

  return (
    <aside className="sidebar" aria-label="Menu lateral de navegação">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img className="brand-icon" src="/gopher.png" alt="Gopher mascote" width="32" height="32" />
          <h2>GopherLab</h2>
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => updateSetting('sidebarCollapsed', true)}
          aria-label="Colapsar menu lateral"
          title="Colapsar menu"
        >
          ✕
        </button>
      </div>

      <div className="sidebar-progress" aria-live="polite">
        <div className="mini-progress">
          <span>{completedCount}/{totalLessons}</span>
          <div className="mini-progress-bar">
            <div className="mini-progress-fill" style={{ width: `${percentage}%` }} />
          </div>
          <span>{percentage}%</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        <button
          className={`sidebar-nav-item ${currentView === 'roadmap' ? 'active' : ''}`}
          onClick={() => onNavigate('roadmap')}
          aria-current={currentView === 'roadmap' ? 'page' : undefined}
        >
          <span aria-hidden="true">📚</span>
          <span>Roadmap</span>
        </button>
        <button
          className={`sidebar-nav-item ${currentView === 'accessibility' ? 'active' : ''}`}
          onClick={() => onNavigate('accessibility')}
          aria-current={currentView === 'accessibility' ? 'page' : undefined}
        >
          <span aria-hidden="true">♿</span>
          <span>Acessibilidade</span>
        </button>

        <button
          className={`sidebar-nav-item sidebar-irc-btn ${currentView === 'irc' ? 'active' : ''}`}
          onClick={() => onNavigate('irc')}
          aria-current={currentView === 'irc' ? 'page' : undefined}
          aria-label="Abrir chat IRC do canal #gopherlab na Libera.Chat"
          title="Chat IRC — #gopherlab @ Libera.Chat"
        >
          <span aria-hidden="true">💬</span>
          <span>Chat IRC</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <p className="sidebar-hint">
          Use Tab para navegar. Esc para voltar.
        </p>
      </div>
    </aside>
  );
}
