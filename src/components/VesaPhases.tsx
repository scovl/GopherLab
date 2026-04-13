import { useState } from 'react';
import { VesaPhase, VesaContent, VESA_LABELS } from '../types';
import { useProgress } from '../context/ProgressContext';
import { VisaoGeralContent } from './vesa/VisaoGeral';
import { ExperimentacaoContent } from './vesa/Experimentacao';
import { SocializacaoContent } from './vesa/Socializacao';
import { AplicacaoContent } from './vesa/Aplicacao';

interface VesaPhasesProps {
  vesa: VesaContent;
  lessonId: string;
}

const PHASE_ORDER: VesaPhase[] = ['visaoGeral', 'experimentacao', 'socializacao', 'aplicacao'];

export function VesaPhases({ vesa, lessonId }: Readonly<VesaPhasesProps>) {
  const { progress, setCurrentPhase } = useProgress();
  const [activePhase, setActivePhase] = useState<VesaPhase>(progress.currentPhase ?? 'visaoGeral');

  const handlePhaseChange = (phase: VesaPhase) => {
    setActivePhase(phase);
    setCurrentPhase(phase);
  };

  const currentIndex = PHASE_ORDER.indexOf(activePhase);

  return (
    <div className="vesa-container">
      <div className="vesa-header">
        <h3>Ciclo de Aprendizado VESA</h3>
        <p className="vesa-subtitle">Visão Geral → Experimentação → Socialização → Aplicação</p>
      </div>

      {/* Phase Navigation Tabs */}
      <div className="vesa-tabs" role="tablist" aria-label="Fases do ciclo de aprendizado VESA">
        {PHASE_ORDER.map((phase, index) => {
          const info = VESA_LABELS[phase];
          const isActive = activePhase === phase;
          const isPast = index < currentIndex;

          return (
            <button
              key={phase}
              role="tab"
              aria-selected={isActive}
              aria-controls={`vesa-panel-${phase}`}
              id={`vesa-tab-${phase}`}
              className={`vesa-tab ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
              onClick={() => handlePhaseChange(phase)}
            >
              <span className="vesa-tab-icon" aria-hidden="true">{info.icon}</span>
              <span className="vesa-tab-label">{info.label}</span>
              <span className="vesa-tab-step" aria-hidden="true">{index + 1}/4</span>
            </button>
          );
        })}
      </div>

      {/* Phase Content */}
      <div
        className="vesa-panel"
        role="tabpanel"
        id={`vesa-panel-${activePhase}`}
        aria-labelledby={`vesa-tab-${activePhase}`}
      >
        <div className="vesa-phase-description">
          <p>{VESA_LABELS[activePhase].description}</p>
        </div>

        {activePhase === 'visaoGeral' && (
          <VisaoGeralContent content={vesa.visaoGeral} lessonId={lessonId} />
        )}
        {activePhase === 'experimentacao' && (
          <ExperimentacaoContent content={vesa.experimentacao} lessonId={lessonId} />
        )}
        {activePhase === 'socializacao' && (
          <SocializacaoContent content={vesa.socializacao} />
        )}
        {activePhase === 'aplicacao' && (
          <AplicacaoContent content={vesa.aplicacao} lessonId={lessonId} />
        )}
      </div>

      {/* Phase Navigation */}
      <div className="vesa-nav">
        {currentIndex > 0 && (
          <button
            className="btn btn-secondary"
            onClick={() => handlePhaseChange(PHASE_ORDER[currentIndex - 1])}
          >
            ← {VESA_LABELS[PHASE_ORDER[currentIndex - 1]].label}
          </button>
        )}
        <div className="vesa-nav-spacer" />
        {currentIndex < PHASE_ORDER.length - 1 && (
          <button
            className="btn btn-phase"
            onClick={() => handlePhaseChange(PHASE_ORDER[currentIndex + 1])}
          >
            {VESA_LABELS[PHASE_ORDER[currentIndex + 1]].label} →
          </button>
        )}
      </div>
    </div>
  );
}

