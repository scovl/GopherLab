import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StickyNote } from './StickyNote';

interface Highlight {
  id: string;
  text: string;
  note?: string;
}

interface SelectionToolbarProps {
  lessonId: string;
  lessonTitle?: string;
  onPinNote?: (id: string, lessonId: string, lessonTitle: string, text: string, note: string) => void;
  children: React.ReactNode;
}

function storageKey(lessonId: string) {
  return `gopherlab-highlights-${lessonId}`;
}

function loadHighlights(lessonId: string): Highlight[] {
  try {
    const raw = localStorage.getItem(storageKey(lessonId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHighlights(lessonId: string, highlights: Highlight[]) {
  localStorage.setItem(storageKey(lessonId), JSON.stringify(highlights));
}

export function SelectionToolbar({ lessonId, lessonTitle, onPinNote, children }: Readonly<SelectionToolbarProps>) {
  const [highlights, setHighlights] = useState<Highlight[]>(() => loadHighlights(lessonId));
  const [toolbar, setToolbar] = useState<{ x: number; y: number; text: string } | null>(null);
  const [editingNote, setEditingNote] = useState<Highlight | null>(null);
  const [stickyNotes, setStickyNotes] = useState<Highlight[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<Highlight[]>(highlights);
  const applyingRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    highlightsRef.current = highlights;
  }, [highlights]);

  // Sync highlights to localStorage
  useEffect(() => {
    saveHighlights(lessonId, highlights);
  }, [highlights, lessonId]);

  // Reload when lessonId changes
  useEffect(() => {
    setHighlights(loadHighlights(lessonId));
    setStickyNotes([]);
    setEditingNote(null);
    setToolbar(null);
  }, [lessonId]);

  // Stable function to apply highlights to the DOM
  const applyHighlights = useCallback(() => {
    const container = containerRef.current;
    if (!container || applyingRef.current) return;
    applyingRef.current = true;

    try {
      // Remove existing marks
      const existingMarks = container.querySelectorAll('mark[data-hl-id]');
      existingMarks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(mark.textContent ?? ''), mark);
          parent.normalize();
        }
      });

      // Apply highlights via TreeWalker
      for (const hl of highlightsRef.current) {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const textNode = node as Text;
          const content = textNode.textContent ?? '';
          const idx = content.indexOf(hl.text);
          if (idx === -1 || idx + hl.text.length > content.length) continue;

          try {
            const range = document.createRange();
            range.setStart(textNode, idx);
            range.setEnd(textNode, idx + hl.text.length);

            const mark = document.createElement('mark');
            mark.dataset.hlId = hl.id;
            mark.className = 'hl-mark';
            if (hl.note) mark.classList.add('hl-mark--has-note');
            range.surroundContents(mark);
          } catch {
            // surroundContents can fail if range crosses element boundaries
          }
          break;
        }
      }
    } finally {
      applyingRef.current = false;
    }
  }, []);

  // Apply highlights when they change
  useEffect(() => {
    applyHighlights();
  }, [highlights, applyHighlights]);

  // MutationObserver: re-apply highlights when children DOM changes
  // (handles async markdown rendering and React reconciliation)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frameId: number | null = null;
    const observer = new MutationObserver(() => {
      if (applyingRef.current) return;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(applyHighlights);
    });

    observer.observe(container, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [applyHighlights]);

  const handleMouseUp = useCallback(() => {
    const sel = globalThis.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      return;
    }

    const text = sel.toString().trim();
    if (text.length < 2) return;

    // Check selection is inside our container
    if (!containerRef.current?.contains(sel.anchorNode)) return;

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current!.getBoundingClientRect();

    setToolbar({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
      text,
    });
  }, []);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
      setToolbar(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleMark = useCallback(() => {
    if (!toolbar) return;
    const existing = highlights.find(h => h.text === toolbar.text);
    if (!existing) {
      const hl: Highlight = { id: crypto.randomUUID(), text: toolbar.text };
      setHighlights(prev => [...prev, hl]);
    }
    setToolbar(null);
    globalThis.getSelection()?.removeAllRanges();
  }, [toolbar, highlights]);

  const handleUnmark = useCallback(() => {
    if (!toolbar) return;
    setHighlights(prev => prev.filter(h => h.text !== toolbar.text));
    setToolbar(null);
    globalThis.getSelection()?.removeAllRanges();
  }, [toolbar]);

  const handleNote = useCallback(() => {
    if (!toolbar) return;
    let hl = highlights.find(h => h.text === toolbar.text);
    if (!hl) {
      hl = { id: crypto.randomUUID(), text: toolbar.text, note: '' };
      setHighlights(prev => [...prev, hl!]);
    }
    setEditingNote({ ...hl });
    setToolbar(null);
    globalThis.getSelection()?.removeAllRanges();
  }, [toolbar, highlights]);

  const handleSaveNote = useCallback((id: string, note: string) => {
    setHighlights(prev =>
      prev.map(h => (h.id === id ? { ...h, note } : h))
    );
    // Show as sticky
    setEditingNote(null);
    if (note.trim()) {
      setStickyNotes(prev => {
        if (prev.find(n => n.id === id)) return prev.map(n => (n.id === id ? { ...n, note } : n));
        const hl = highlights.find(h => h.id === id);
        return [...prev, { ...(hl ?? { id, text: '' }), note }];
      });
    }
  }, [highlights]);

  const handleCloseNote = useCallback((id: string) => {
    setStickyNotes(prev => prev.filter(n => n.id !== id));
    setEditingNote(null);
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setHighlights(prev =>
      prev.map(h => (h.id === id ? { ...h, note: undefined } : h))
    );
    setStickyNotes(prev => prev.filter(n => n.id !== id));
    setEditingNote(null);
  }, []);

  const handlePin = useCallback((id: string, text: string, note: string) => {
    if (onPinNote) {
      onPinNote(id, lessonId, lessonTitle ?? lessonId, text, note);
    }
  }, [onPinNote, lessonId, lessonTitle]);

  const isHighlighted = toolbar ? highlights.some(h => h.text === toolbar.text) : false;

  return (
    <div className="selection-toolbar-container" ref={containerRef} onMouseUp={handleMouseUp}>
      {children}

      {toolbar && (
        <div
          ref={toolbarRef}
          className="sel-toolbar"
          style={{ left: toolbar.x, top: toolbar.y }}
          role="toolbar"
          aria-label="Opções de texto selecionado"
        >
          {!isHighlighted ? (
            <button className="sel-toolbar-btn" onClick={handleMark} title="Marcar">
              <span aria-hidden="true">🖍️</span> Marcar
            </button>
          ) : (
            <button className="sel-toolbar-btn" onClick={handleUnmark} title="Desmarcar">
              <span aria-hidden="true">✕</span> Desmarcar
            </button>
          )}
          <button className="sel-toolbar-btn" onClick={handleNote} title="Criar nota">
            <span aria-hidden="true">📝</span> Nota
          </button>
        </div>
      )}

      {editingNote && (
        <StickyNote
          id={editingNote.id}
          text={editingNote.text}
          note={editingNote.note ?? ''}
          onSave={handleSaveNote}
          onClose={handleCloseNote}
          onDelete={handleDeleteNote}
          onPin={handlePin}
        />
      )}

      {stickyNotes.map(sn => (
        <StickyNote
          key={sn.id}
          id={sn.id}
          text={sn.text}
          note={sn.note ?? ''}
          onSave={handleSaveNote}
          onClose={handleCloseNote}
          onDelete={handleDeleteNote}
          onPin={handlePin}
        />
      ))}
    </div>
  );
}
