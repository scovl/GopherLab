import React, { useState, useEffect, useRef, useCallback } from 'react';

type TimerMode = 'focus' | 'short-break' | 'long-break';

const DURATIONS: Record<TimerMode, number> = {
  'focus': 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

const LABELS: Record<TimerMode, string> = {
  'focus': 'Foco',
  'short-break': 'Pausa curta',
  'long-break': 'Pausa longa',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(DURATIONS['focus']);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!running) {
      clearTimer();
      return;
    }

    intervalRef.current = globalThis.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          setRunning(false);
          if (mode === 'focus') {
            const next = sessions + 1;
            setSessions(next);
            if (next % 4 === 0) {
              setMode('long-break');
              return DURATIONS['long-break'];
            }
            setMode('short-break');
            return DURATIONS['short-break'];
          }
          setMode('focus');
          return DURATIONS['focus'];
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [running, mode, sessions, clearTimer]);

  const handleToggle = () => setRunning(r => !r);

  const handleReset = () => {
    setRunning(false);
    clearTimer();
    setTimeLeft(DURATIONS[mode]);
  };

  const handleModeChange = (newMode: TimerMode) => {
    setRunning(false);
    clearTimer();
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
  };

  const progress = 1 - timeLeft / DURATIONS[mode];
  const R = 70;
  const circumference = 2 * Math.PI * R;
  const dashOffset = circumference * (1 - progress);

  // Generate 60 tick marks around the ring
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i * 360) / 60;
    const isMajor = i % 5 === 0;
    const outerR = 88;
    const innerR = isMajor ? 80 : 83;
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      angle,
      x1: 100 + outerR * Math.cos(rad),
      y1: 100 + outerR * Math.sin(rad),
      x2: 100 + innerR * Math.cos(rad),
      y2: 100 + innerR * Math.sin(rad),
      major: isMajor,
    };
  });

  return (
    <div className="pomodoro" aria-label="Pomodoro Timer">
      <div className="pomodoro-label">Marmota Timer</div>
      <div className="pomodoro-modes">
        {(Object.keys(DURATIONS) as TimerMode[]).map(m => (
          <button
            key={m}
            className={`pomodoro-mode-btn${mode === m ? ' active' : ''}`}
            onClick={() => handleModeChange(m)}
            aria-pressed={mode === m}
          >
            {LABELS[m]}
          </button>
        ))}
      </div>

      <div className="pomodoro-ring-wrapper">
        <svg className="pomodoro-ring" viewBox="0 0 200 200" aria-hidden="true">
          {/* Tick marks */}
          {ticks.map((t) => (
            <line
              key={`tick-${t.angle}`}
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              className={t.major ? 'pomodoro-tick pomodoro-tick--major' : 'pomodoro-tick'}
            />
          ))}
          {/* Background ring */}
          <circle cx="100" cy="100" r={R} className="pomodoro-ring-bg" />
          {/* Progress arc */}
          <circle
            cx="100" cy="100" r={R}
            className={`pomodoro-ring-progress pomodoro-ring--${mode}`}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 100 100)"
          />
        </svg>
        <img
          className="pomodoro-gopher"
          src="/gopher.png"
          alt=""
          aria-hidden="true"
        />
        <div className="pomodoro-time" aria-live="polite">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="pomodoro-controls">
        <button
          className={`pomodoro-btn pomodoro-btn--toggle${running ? ' running' : ''}`}
          onClick={handleToggle}
          aria-label={running ? 'Pausar timer' : 'Iniciar timer'}
        >
          {running ? '⏸' : '▶'}
        </button>
        <button
          className="pomodoro-btn pomodoro-btn--reset"
          onClick={handleReset}
          aria-label="Reiniciar timer"
        >
          ↺
        </button>
        <button
          className="pomodoro-btn pomodoro-btn--help"
          onClick={() => setShowHelp(h => !h)}
          aria-label="O que é Pomodoro?"
          aria-expanded={showHelp}
        >
          ?
        </button>
      </div>

      {showHelp && (
        <div className="pomodoro-help">
          <p>
            A técnica Pomodoro divide o estudo em blocos de 25 min de foco
            seguidos de pausas curtas. Após 4 sessões, faça uma pausa longa.
            Isso melhora a concentração e reduz a fadiga mental.
          </p>
          <a
            href="https://www.youtube.com/watch?v=hfxfJ7Qa4sg"
            target="_blank"
            rel="noopener noreferrer"
          >
            🎬 Assista uma explicação rápida
          </a>
        </div>
      )}

      <div className="pomodoro-sessions" aria-live="polite">
        {sessions > 0 && <span>🔥 {sessions} {sessions === 1 ? 'sessão' : 'sessões'}</span>}
      </div>
    </div>
  );
}
