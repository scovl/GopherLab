import React, { useState } from 'react';
import { solveChallenge } from '../utils/pow';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface LabEditorFile {
  name: string;
  body: string;
}

interface LabEditorProps {
  /** Initial set of files for the project. At least one is required. */
  initialFiles: LabEditorFile[];
  /** Slug used for the download zip name */
  projectSlug: string;
}

type RunMode = 'run' | 'test';

// ---------------------------------------------------------------------------
// Helper: detect if the set of files has a *_test.go file
// ---------------------------------------------------------------------------
function hasTestFile(files: LabEditorFile[]): boolean {
  return files.some(f => f.name.endsWith('_test.go'));
}

// ---------------------------------------------------------------------------
// LabEditor
// ---------------------------------------------------------------------------
export function LabEditor({ initialFiles, projectSlug }: Readonly<LabEditorProps>) {
  const [files, setFiles] = useState<LabEditorFile[]>(initialFiles);
  const [activeFile, setActiveFile] = useState<string>(initialFiles[0]?.name ?? 'main.go');
  const [mode, setMode] = useState<RunMode>('run');
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<{ text: string; isError: boolean } | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFile, setShowNewFile] = useState(false);

  const currentFile = files.find(f => f.name === activeFile) ?? files[0];
  const canTest = hasTestFile(files);

  // -------------------------------------------------------------------------
  // File management
  // -------------------------------------------------------------------------
  function updateBody(body: string) {
    setFiles(prev => prev.map(f => f.name === activeFile ? { ...f, body } : f));
  }

  function addFile() {
    const name = newFileName.trim();
    if (!name) return;
    // Basic safety: only simple .go filenames
    if (!/^[a-zA-Z0-9_-]+\.go$/.test(name)) {
      alert('Nome inválido. Use apenas letras, números, _ e - com extensão .go');
      return;
    }
    if (files.some(f => f.name === name)) {
      alert('Já existe um arquivo com esse nome');
      return;
    }
    const isTest = name.endsWith('_test.go');
    const template = isTest
      ? `package main\n\nimport "testing"\n\nfunc TestExemplo(t *testing.T) {\n\t// escreva seus testes aqui\n}\n`
      : `package main\n\n// ${name}\n`;
    setFiles(prev => [...prev, { name, body: template }]);
    setActiveFile(name);
    setNewFileName('');
    setShowNewFile(false);
    if (isTest) setMode('test');
  }

  function removeFile(name: string) {
    if (files.length === 1) return; // must keep at least one
    const next = files.filter(f => f.name !== name);
    setFiles(next);
    if (activeFile === name) setActiveFile(next[0].name);
  }

  // -------------------------------------------------------------------------
  // Execution
  // -------------------------------------------------------------------------
  async function execute() {
    setRunning(true);
    setOutput(null);
    try {
      const pow = await solveChallenge();
      const res = await fetch('/api/lab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PoW-Nonce': pow.nonce,
          'X-PoW-Solution': pow.solution,
        },
        body: JSON.stringify({
          files: files.map(f => ({ name: f.name, body: f.body })),
          mode,
        }),
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

  // -------------------------------------------------------------------------
  // Download all files as a zip-like text archive (individual .go files)
  // -------------------------------------------------------------------------
  function downloadFile(f: LabEditorFile) {
    const blob = new Blob([f.body], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = f.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadAll() {
    // Download each file individually
    files.forEach(f => downloadFile(f));
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="lab-editor">
      {/* ── Header ── */}
      <div className="lab-header">
        <span className="lab-title">
          <span aria-hidden="true">🔬</span> Lab — Projeto: <code>{projectSlug}</code>
        </span>
        <div className="lab-toolbar">
          {/* Mode toggle — only show test if there's a test file */}
          <div className="lab-mode-toggle" role="group" aria-label="Modo de execução">
            <button
              className={`lab-mode-btn ${mode === 'run' ? 'active' : ''}`}
              onClick={() => setMode('run')}
              aria-pressed={mode === 'run'}
            >
              ▶ run
            </button>
            <button
              className={`lab-mode-btn ${mode === 'test' ? 'active' : ''} ${!canTest ? 'disabled' : ''}`}
              onClick={() => canTest && setMode('test')}
              disabled={!canTest}
              aria-pressed={mode === 'test'}
              title={canTest ? 'Executar testes' : 'Adicione um arquivo *_test.go para habilitar'}
            >
              🧪 test
            </button>
          </div>

          <button
            className="btn-play"
            onClick={execute}
            disabled={running}
            aria-label={mode === 'test' ? 'Executar testes' : 'Executar programa'}
          >
            {running ? '⏳ Executando…' : mode === 'test' ? '🧪 go test -v' : '▶ go run'}
          </button>

          <button
            className="btn-tool"
            onClick={downloadAll}
            title="Baixar todos os arquivos do projeto"
            aria-label="Baixar arquivos do projeto"
          >
            ⬇ Baixar
          </button>
        </div>
      </div>

      {/* ── File Tabs ── */}
      <div className="lab-tabs" role="tablist" aria-label="Arquivos do projeto">
        {files.map(f => (
          <div
            key={f.name}
            className={`lab-tab ${f.name === activeFile ? 'active' : ''} ${f.name.endsWith('_test.go') ? 'lab-tab-test' : ''}`}
            role="tab"
            aria-selected={f.name === activeFile}
            onClick={() => setActiveFile(f.name)}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setActiveFile(f.name)}
          >
            <span className="lab-tab-name">{f.name}</span>
            {files.length > 1 && f.name !== 'main.go' && (
              <button
                className="lab-tab-close"
                onClick={e => { e.stopPropagation(); removeFile(f.name); }}
                aria-label={`Fechar ${f.name}`}
                title="Remover arquivo"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {/* Add file button */}
        {showNewFile ? (
          <div className="lab-tab-new-input">
            <input
              type="text"
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addFile(); if (e.key === 'Escape') setShowNewFile(false); }}
              placeholder="nome_arquivo.go"
              autoFocus
              aria-label="Nome do novo arquivo"
              className="lab-new-file-input"
            />
            <button onClick={addFile} className="lab-tab-add-confirm" aria-label="Confirmar">✓</button>
            <button onClick={() => setShowNewFile(false)} className="lab-tab-add-cancel" aria-label="Cancelar">✕</button>
          </div>
        ) : (
          <button
            className="lab-tab-add"
            onClick={() => setShowNewFile(true)}
            aria-label="Adicionar novo arquivo Go"
            title="Novo arquivo"
          >
            + arquivo
          </button>
        )}
      </div>

      {/* ── Editor ── */}
      <div className="lab-editor-body" role="tabpanel" aria-label={`Editando ${currentFile?.name}`}>
        <textarea
          className="lab-code-editor"
          value={currentFile?.body ?? ''}
          onChange={e => updateBody(e.target.value)}
          spellCheck={false}
          aria-label={`Código de ${currentFile?.name}`}
          rows={Math.max(16, (currentFile?.body ?? '').split('\n').length + 2)}
        />
      </div>

      {/* ── Output ── */}
      {output && (
        <section
          className={`lab-output ${output.isError ? 'lab-output-error' : 'lab-output-ok'}`}
          aria-label={output.isError ? 'Erros' : 'Saída'}
        >
          <div className="lab-output-label">
            {output.isError ? '✗ Erro' : mode === 'test' ? '🧪 Resultado dos testes' : '✓ Saída'}
          </div>
          <pre className="lab-output-text">{output.text}</pre>
        </section>
      )}

      {/* ── Tip bar ── */}
      <div className="lab-tip">
        <span>
          💡 <strong>go run</strong> executa o programa · <strong>go test -v</strong> roda os testes ·
          Use <em>+ arquivo</em> para adicionar <code>*_test.go</code> e praticar TDD
        </span>
      </div>
    </div>
  );
}
