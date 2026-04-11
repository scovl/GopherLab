import React from 'react';
import ReactMarkdown from 'react-markdown';

const mdComponents = {
  a: ({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  ),
};

export interface GoCodeEditorProps {
  referenceCode?: string;
  referenceLabel: string;
  lessonId: string;
  downloadName: string;
  notaPos?: string;
}

export function GoCodeEditor({ referenceCode, referenceLabel, lessonId: _lessonId, downloadName, notaPos }: Readonly<GoCodeEditorProps>) {
  const [code, setCode] = React.useState('');
  const [running, setRunning] = React.useState(false);
  const [output, setOutput] = React.useState<{ text: string; isError: boolean } | null>(null);

  async function runCode() {
    if (!code.trim()) {
      setOutput({ text: 'O editor está vazio. Digite o código acima para executar.', isError: true });
      return;
    }
    setRunning(true);
    setOutput(null);
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: code }),
      });
      const data = await res.json();
      if (data.errors) {
        setOutput({ text: data.errors, isError: true });
      } else {
        setOutput({ text: data.output || '(sem saída)', isError: false });
      }
    } catch {
      setOutput({ text: 'Erro ao conectar com o executor. Verifique a conexão.', isError: true });
    } finally {
      setRunning(false);
    }
  }

  function downloadCode() {
    if (!code.trim()) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${downloadName}.go`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="playground-section">
      {referenceCode && (
        <>
          <div className="playground-ref-header">
            <span>📖 {referenceLabel} — leia e <strong>digite</strong> no editor abaixo</span>
          </div>
          <pre
            className="playground-ref-code"
            aria-label="Código de referência — não copiável"
            onCopy={e => e.preventDefault()}
            onCut={e => e.preventDefault()}
          >
            <code>{referenceCode}</code>
          </pre>
        </>
      )}

      <div className="playground-header">
        <span className="playground-title">
          <span aria-hidden="true">🐹</span> Seu código
        </span>
        <div className="playground-toolbar">
          <button
            className="btn-play"
            onClick={runCode}
            disabled={running}
            aria-label="Executar código"
          >
            {running ? '⏳ Executando…' : '▶ Executar'}
          </button>
          <button
            className="btn-tool"
            onClick={downloadCode}
            disabled={!code.trim()}
            aria-label="Baixar arquivo .go"
          >
            ⬇ Baixar .go
          </button>
          <button
            className="btn-tool btn-tool-ghost"
            onClick={() => { setCode(''); setOutput(null); }}
            aria-label="Limpar editor"
          >
            ✕ Limpar
          </button>
        </div>
      </div>

      <textarea
        className="playground-editor"
        value={code}
        onChange={e => setCode(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Tab') {
            e.preventDefault();
            const el = e.currentTarget;
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const next = code.slice(0, start) + '\t' + code.slice(end);
            setCode(next);
            // restore cursor after React re-render
            requestAnimationFrame(() => {
              el.selectionStart = start + 1;
              el.selectionEnd = start + 1;
            });
          }
        }}
        spellCheck={false}
        aria-label="Editor de código Go"
        placeholder={'// Digite seu código aqui\npackage main\n\nimport "fmt"\n\nfunc main() {\n\t\n}'}
        rows={Math.max(12, code.split('\n').length + 2)}
      />

      {output && (
        <>
          <section
            className={`playground-output ${output.isError ? 'playground-output-error' : 'playground-output-ok'}`}
            aria-label={output.isError ? 'Erros de compilação' : 'Saída do programa'}
          >
            <div className="playground-output-label">
              {output.isError ? '✗ Erro' : '✓ Saída'}
            </div>
            <pre className="playground-output-text">{output.text}</pre>
          </section>

          {!output.isError && notaPos && (
            <div className="nota-pos">
              <div className="nota-pos-header">
                <span className="nota-pos-icon">💡</span>
                <span className="nota-pos-titulo">O que aconteceu nesse código?</span>
              </div>
              <div className="nota-pos-body">
                <ReactMarkdown components={mdComponents}>{notaPos}</ReactMarkdown>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
