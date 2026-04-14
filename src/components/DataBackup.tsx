import React, { useRef } from 'react';

const BACKUP_PREFIXES = ['gopherlab-progress', 'gopherlab-highlights-', 'gopherlab-note-shelf'];

function collectBackupData(): Record<string, string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && BACKUP_PREFIXES.some(p => key.startsWith(p))) {
      data[key] = localStorage.getItem(key) ?? '';
    }
  }
  return data;
}

function handleExport() {
  const data = collectBackupData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gopherlab-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataBackup() {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (typeof data !== 'object' || data === null) return;

        for (const [key, value] of Object.entries(data)) {
          if (typeof key === 'string' && typeof value === 'string' && BACKUP_PREFIXES.some(p => key.startsWith(p))) {
            localStorage.setItem(key, value);
          }
        }
        globalThis.location.reload();
      } catch {
        // ignore invalid files
      }
    };
    reader.readAsText(file);

    // reset so the same file can be re-imported
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="data-backup">
      <span className="data-backup-label">Dados</span>
      <div className="data-backup-actions">
        <button className="data-backup-btn" onClick={handleExport} title="Exportar progresso">
          ⬇ Exportar
        </button>
        <label className="data-backup-btn" title="Importar progresso">
          ⬆ Importar
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="data-backup-input"
          />
        </label>
      </div>
    </div>
  );
}
