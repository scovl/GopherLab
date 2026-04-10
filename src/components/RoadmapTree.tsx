import React, { useMemo } from 'react';
import { useProgress } from '../context/ProgressContext';
import { useRoadmap } from '../hooks/useRoadmap';

interface RoadmapTreeProps {
  onModuleClick?: (moduleId: string) => void;
}

type NodeState = 'completed' | 'active' | 'next' | 'locked';

function nodeAriaLabel(title: string, state: NodeState, done: number, total: number): string {
  if (state === 'completed') return `${title} — concluído`;
  if (state === 'active') return `${title} — ${done}/${total} aulas`;
  if (state === 'next') return `${title} — próximo`;
  return `${title} — bloqueado`;
}

export function RoadmapTree({ onModuleClick }: Readonly<RoadmapTreeProps>) {
  const { modules } = useRoadmap();
  const { progress } = useProgress();

  const completedSet = useMemo(() => new Set(progress.completedLessons), [progress.completedLessons]);

  const nodes = useMemo(() => {
    return modules.map((mod, i) => {
      const doneLessons = mod.lessons.filter(l => completedSet.has(l.id)).length;
      const total = mod.lessons.length;
      const completed = doneLessons === total && total > 0;
      const partial = doneLessons > 0 && !completed;

      // Determine visual state
      let state: NodeState;
      if (completed) {
        state = 'completed';
      } else if (partial) {
        state = 'active';
      } else {
        // "next" = immediately unlocked (prev module has any progress)
        // "locked" = further ahead
        const anyPrevDone = i === 0 || modules[i - 1].lessons.some(l => completedSet.has(l.id));
        state = anyPrevDone ? 'next' : 'locked';
      }

      return { mod, doneLessons, total, state };
    });
  }, [modules, completedSet]);

  const completedModules = nodes.filter(n => n.state === 'completed').length;

  return (
    <div className="rt-wrapper" aria-label="Seu progresso no roadmap">
      <div className="rt-header">
        <span className="rt-title">Seu Roadmap</span>
        <span className="rt-count">{completedModules}/{modules.length} módulos</span>
      </div>

      <div className="rt-track">
        {/* Vertical spine line */}
        <div className="rt-spine" aria-hidden="true" />

        {nodes.map(({ mod, doneLessons, total, state }) => (
          <button
            key={mod.id}
            type="button"
            className={`rt-node rt-node--${state}`}
            disabled={state === 'locked'}
            aria-label={nodeAriaLabel(mod.title, state, doneLessons, total)}
            onClick={() => onModuleClick?.(mod.id)}
          >
            {/* Connector dot on spine */}
            <div className="rt-dot" aria-hidden="true">
              {state === 'completed' && <span className="rt-check">✓</span>}
              {state === 'active' && <span className="rt-pulse" />}
              {(state === 'next' || state === 'locked') && (
                <span className="rt-dot-inner" style={{ background: mod.color }} />
              )}
            </div>

            {/* Balloon */}
            <div className="rt-balloon">
              <div className="rt-balloon-title">{mod.title}</div>
              <div className="rt-balloon-lessons">
                {mod.lessons.map(l => (
                  <span
                    key={l.id}
                    className={`rt-lesson-dot ${completedSet.has(l.id) ? 'rt-lesson-dot--done' : ''}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              {state === 'active' && (
                <div className="rt-balloon-progress">
                  <div
                    className="rt-balloon-bar"
                    style={{ width: `${Math.round((doneLessons / total) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
