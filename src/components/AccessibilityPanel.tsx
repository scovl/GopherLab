import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export function AccessibilityPanel() {
  const { settings, updateSetting, resetSettings } = useAccessibility();

  return (
    <div className="accessibility-panel" role="region" aria-label="Configurações de acessibilidade">
      <h2>Acessibilidade</h2>
      <p className="panel-description">
        Personalize a experiência de acordo com suas preferências.
      </p>

      <div className="setting-group">
        <label htmlFor="theme-select">Tema visual</label>
        <select
          id="theme-select"
          value={settings.theme}
          onChange={e => updateSetting('theme', e.target.value as 'light' | 'dark' | 'sepia')}
        >
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
          <option value="sepia">Sépia (leitura confortável)</option>
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="font-size-select">Tamanho da fonte</label>
        <select
          id="font-size-select"
          value={settings.fontSize}
          onChange={e =>
            updateSetting('fontSize', e.target.value as 'normal' | 'large' | 'extra-large')
          }
        >
          <option value="normal">Normal (16px)</option>
          <option value="large">Grande (18px)</option>
          <option value="extra-large">Extra grande (20px)</option>
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="line-spacing-select">Espaçamento entre linhas</label>
        <select
          id="line-spacing-select"
          value={settings.lineSpacing}
          onChange={e =>
            updateSetting('lineSpacing', e.target.value as 'normal' | 'relaxed' | 'spacious')
          }
        >
          <option value="normal">Normal</option>
          <option value="relaxed">Relaxado</option>
          <option value="spacious">Espaçoso</option>
        </select>
      </div>

      <div className="setting-group">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={e => updateSetting('reducedMotion', e.target.checked)}
          />
          <span>Reduzir animações</span>
        </label>
        <p className="setting-hint">Remove transições e movimentos que podem causar desconforto.</p>
      </div>

      <div className="setting-group">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={e => updateSetting('highContrast', e.target.checked)}
          />
          <span>Alto contraste</span>
        </label>
        <p className="setting-hint">Aumenta o contraste entre texto e fundo para melhor legibilidade.</p>
      </div>

      <div className="setting-group">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={settings.focusHighlight}
            onChange={e => updateSetting('focusHighlight', e.target.checked)}
          />
          <span>Destaque de foco visível</span>
        </label>
        <p className="setting-hint">Mostra indicador visual claro ao navegar com teclado.</p>
      </div>

      <button className="btn btn-secondary" onClick={resetSettings} aria-label="Restaurar configurações padrão">
        Restaurar padrões
      </button>
    </div>
  );
}
