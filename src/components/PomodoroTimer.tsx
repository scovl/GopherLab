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
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="pomodoro" aria-label="Pomodoro Timer">
      <div className="pomodoro-label">🍅 Pomodoro Timer</div>
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
        <svg className="pomodoro-ring" viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="36" className="pomodoro-ring-bg" />
          <circle
            cx="40" cy="40" r="36"
            className={`pomodoro-ring-progress pomodoro-ring--${mode}`}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 40 40)"
          />
        </svg>
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
      </div>

      <div className="pomodoro-sessions" aria-live="polite">
        {sessions > 0 && <span>🔥 {sessions} {sessions === 1 ? 'sessão' : 'sessões'}</span>}
      </div>
    </div>
  );
}
