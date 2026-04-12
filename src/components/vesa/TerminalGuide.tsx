import React from 'react';

interface TerminalGuideProps {
  commands: string[];
  description?: string;
}

/** Read-only terminal-style block with copy-to-clipboard for each command. */
export function TerminalGuide({ commands, description }: Readonly<TerminalGuideProps>) {
  const [copied, setCopied] = React.useState<number | null>(null);

  async function copyCommand(cmd: string, idx: number) {
    await navigator.clipboard.writeText(cmd);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  }

  function copyAll() {
    const all = commands.join('\n');
    navigator.clipboard.writeText(all);
    setCopied(-1);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="terminal-guide">
      <div className="terminal-guide-header">
        <span className="terminal-guide-dots" aria-hidden="true">
          <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
        </span>
        <span className="terminal-guide-title">Terminal</span>
        <button className="terminal-copy-all" onClick={copyAll} title="Copiar todos os comandos">
          {copied === -1 ? '✓ Copiado!' : '📋 Copiar tudo'}
        </button>
      </div>
      {description && <p className="terminal-guide-desc">{description}</p>}
      <div className="terminal-guide-body">
        {commands.map((cmd, i) => (
          <div className="terminal-line" key={i}>
            <span className="terminal-prompt" aria-hidden="true">$</span>
            <code className="terminal-cmd">{cmd}</code>
            <button
              className="terminal-copy-btn"
              onClick={() => copyCommand(cmd, i)}
              title="Copiar comando"
              aria-label={`Copiar: ${cmd}`}
            >
              {copied === i ? '✓' : '⎘'}
            </button>
          </div>
        ))}
      </div>
      <p className="terminal-guide-hint">
        Execute esses comandos no seu terminal local. Você precisa ter o <a href="https://go.dev/dl/" target="_blank" rel="noopener noreferrer">Go instalado</a> na sua máquina.
      </p>
    </div>
  );
}
