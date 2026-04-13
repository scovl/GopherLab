import React from 'react';
import ReactMarkdown from 'react-markdown';
import { mdComponents } from './mdComponents';
import { solveChallenge } from '../../utils/pow';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-go';
import 'prismjs/themes/prism.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  const [refPct, setRefPct] = React.useState(50);
  const columnsRef = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  function onDividerPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onDividerPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const container = columnsRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setRefPct(Math.min(80, Math.max(20, pct)));
  }

  function onDividerPointerUp() {
    dragging.current = false;
  }

  async function runCode() {
    if (!code.trim()) {
      setOutput({ text: 'O editor está vazio. Digite o código acima para executar.', isError: true });
      return;
    }
    setRunning(true);
    setOutput(null);
    try {
      const pow = await solveChallenge();
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PoW-Nonce': pow.nonce,
          'X-PoW-Solution': pow.solution,
        },
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

  const refLines = referenceCode ? referenceCode.split('\n').length : 0;
  const isSplit = refLines > 30;

  return (
    <div className={`playground-section${isSplit ? ' playground-section--split' : ''}`}>
      <div className="playground-columns" ref={isSplit ? columnsRef : undefined}>
        {referenceCode && (
          <div
            className="playground-pane playground-pane--ref"
            style={isSplit ? { flex: 'none', width: `${refPct}%` } : undefined}
          >
            <div className="playground-ref-header">
              <span>📖 {referenceLabel} — leia e <strong>digite</strong> no editor ao lado</span>
            </div>
            <div
              className="playground-ref-code"
              aria-label="Código de referência — não copiável"
              onCopy={e => e.preventDefault()}
              onCut={e => e.preventDefault()}
            >
              <SyntaxHighlighter
                language="go"
                style={oneLight}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                }}
              >
                {referenceCode}
              </SyntaxHighlighter>
            </div>
          </div>
        )}

        {isSplit && (
          <div
            className="playground-divider"
            aria-label="Arraste para redimensionar"
            onPointerDown={onDividerPointerDown}
            onPointerMove={onDividerPointerMove}
            onPointerUp={onDividerPointerUp}
          />
        )}

        <div
          className="playground-pane playground-pane--editor"
          style={isSplit ? { flex: 'none', width: `${100 - refPct}%` } : undefined}
        >
          <div className="playground-header">
            <span className="playground-title">
              <img src="/gopher.png" alt="" aria-hidden="true" width="20" height="20" style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} /> Seu código
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

          <Editor
            value={code}
            onValueChange={setCode}
            highlight={src => Prism.highlight(src, Prism.languages.go, 'go')}
            insertSpaces={false}
            tabSize={4}
            padding={16}
            className="playground-editor-wrapper"
            textareaClassName="playground-editor-input"
            style={{
              fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
              fontSize: '0.85rem',
              lineHeight: '1.6',
              minHeight: isSplit
                ? `${refLines * 1.6 * 0.85 + 2}rem`
                : `${Math.max(12, code.split('\n').length + 2) * 1.6 * 0.85 + 2}rem`,
            }}
            placeholder={'// Digite seu código aqui\npackage main\n\nimport "fmt"\n\nfunc main() {\n\t\n}'}
            aria-label="Editor de código Go"
          />
        </div>
      </div>

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
