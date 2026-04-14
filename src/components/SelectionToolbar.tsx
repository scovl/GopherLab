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

interface ToolbarState {
  x: number;
  y: number;
  text: string;
  highlightId?: string;
}

function storageKey(lessonId: string) {
  return `gopherlab-highlights-${lessonId}`;
}

function trimWhitespaceBounds(data: string, start: number, end: number): { start: number; end: number } {
  let s = start;
  let e = end;
  while (s < e && /\s/.test(data[s])) s++;
  while (e > s && /\s/.test(data[e - 1])) e--;
  return { start: s, end: e };
}

/** Returns all Text node segments that fall within `range`. */
function collectTextSegments(range: Range): Array<{ node: Text; start: number; end: number }> {
  const startNode = range.startContainer;
  const endNode   = range.endContainer;

  if (startNode === endNode && startNode.nodeType === Node.TEXT_NODE) {
    const t = startNode as Text;
    const { start, end } = trimWhitespaceBounds(t.data, range.startOffset, range.endOffset);
    return start < end ? [{ node: t, start, end }] : [];
  }

  const segments: Array<{ node: Text; start: number; end: number }> = [];
  const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const t = n as Text;
    if (!range.intersectsNode(t)) continue;
    const rawStart = t === startNode ? range.startOffset : 0;
    const rawEnd = t === endNode ? range.endOffset : t.length;
    const { start, end } = trimWhitespaceBounds(t.data, rawStart, rawEnd);
    if (start < end) segments.push({ node: t, start, end });
  }
  return segments;
}

/** Wraps a single Text-node slice in a <mark> element. */
function wrapTextSlice(node: Text, s: number, e: number, hlId: string, classes: string): void {
  const target = s > 0 ? node.splitText(s) : node;
  if (e - s < target.length) target.splitText(e - s);

  const mark = document.createElement('mark');
  mark.dataset.hlId = hlId;
  mark.className = classes;
  target.parentNode?.insertBefore(mark, target);
  mark.appendChild(target);
}

/**
 * Wraps each text-node segment within `range` in its own <mark>.
 * Only operates on Text nodes — never moves element nodes — so React's
 * virtual DOM structure stays intact even for cross-boundary selections.
 */
function wrapRangeInMarks(range: Range, hlId: string, classes: string): void {
  for (const { node, start: s, end: e } of collectTextSegments(range)) {
    wrapTextSlice(node, s, e, hlId, classes);
  }
}

/**
 * Builds a flat character-position map and finds the Range for `text`.
 * Returns null if the text is not found in the container's text content.
 */
function findTextRange(container: Element, text: string): Range | null {
  const positions: { node: Text; offset: number }[] = [];
  let fullText = '';

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const t = node as Text;
    for (let i = 0; i < t.length; i++) {
      positions.push({ node: t, offset: i });
      fullText += t.data[i];
    }
  }

  const idx = fullText.indexOf(text);
  if (idx === -1 || idx + text.length > positions.length) return null;

  const range = document.createRange();
  range.setStart(positions[idx].node, positions[idx].offset);
  const endPos = positions[idx + text.length - 1];
  range.setEnd(endPos.node, endPos.offset + 1);
  return range;
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
  const [toolbar, setToolbar] = useState<ToolbarState | null>(null);
  const [editingNote, setEditingNote] = useState<Highlight | null>(null);
  const [stickyNotes, setStickyNotes] = useState<Highlight[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<Highlight[]>(highlights);
  const applyingRef = useRef(false);
  const observerRef = useRef<MutationObserver | null>(null);

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
    // Disconnect observer so our own DOM changes don't re-trigger it
    observerRef.current?.disconnect();

    try {
      // Remove existing marks — move children back to preserve inner HTML
      const existingMarks = container.querySelectorAll('mark[data-hl-id]');
      existingMarks.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
          while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark);
          }
          mark.remove();
          parent.normalize();
        }
      });

      // Apply highlights — wrapRangeInMarks only touches Text nodes, never
      // element nodes, so React's virtual DOM structure stays intact.
      for (const hl of highlightsRef.current) {
        const range = findTextRange(container, hl.text);
        if (!range) continue;
        try {
          const classes = hl.note ? 'hl-mark hl-mark--has-note' : 'hl-mark';
          wrapRangeInMarks(range, hl.id, classes);
        } catch {
          // ignore edge cases
        }
      }
    } finally {
      applyingRef.current = false;
      // Reconnect observer — it won't see mutations that happened while disconnected
      if (observerRef.current && container) {
        observerRef.current.observe(container, { childList: true, subtree: true, characterData: true });
      }
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

    observerRef.current = observer;
    observer.observe(container, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      observerRef.current = null;
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
    const containerRect = containerRef.current.getBoundingClientRect();

    const anchorEl = sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode?.parentElement;
    const focusEl = sel.focusNode instanceof Element ? sel.focusNode : sel.focusNode?.parentElement;
    const anchorMark = anchorEl?.closest('mark[data-hl-id]') as HTMLElement | null;
    const focusMark = focusEl?.closest('mark[data-hl-id]') as HTMLElement | null;
    const sameMarkId =
      anchorMark && focusMark && anchorMark.dataset.hlId === focusMark.dataset.hlId
        ? anchorMark.dataset.hlId
        : undefined;

    setToolbar({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
      text,
      highlightId: sameMarkId,
    });
  }, []);

  // Click on an existing <mark> → show the unmark toolbar without needing a drag-selection
  const handleMarkClick = useCallback((e: MouseEvent) => {
    const rawTarget = e.target;
    let targetEl: Element | null = null;
    if (rawTarget instanceof Element) {
      targetEl = rawTarget;
    } else if (rawTarget instanceof Node) {
      targetEl = rawTarget.parentElement;
    }
    const mark = targetEl?.closest('mark[data-hl-id]');
    if (!mark || !containerRef.current?.contains(mark)) return;

    const hlId = (mark as HTMLElement).dataset.hlId!;
    const hl = highlightsRef.current.find(h => h.id === hlId);
    if (!hl) return;

    const rect = mark.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    setToolbar({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
      text: hl.text,
      highlightId: hl.id,
    });
    globalThis.getSelection()?.removeAllRanges();
    e.stopPropagation();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('click', handleMarkClick);
    return () => container.removeEventListener('click', handleMarkClick);
  }, [handleMarkClick]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('mouseup', handleMouseUp);
    return () => container.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
      // Don't dismiss if clicking on a highlight mark (handleMarkClick will handle it)
      const target = e.target instanceof Element ? e.target : (e.target as Node)?.parentElement;
      if (target?.closest('mark[data-hl-id]')) return;
      setToolbar(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const handleMark = useCallback(() => {
    if (!toolbar) return;
    const existing = toolbar.highlightId
      ? highlights.find(h => h.id === toolbar.highlightId)
      : highlights.find(h => h.text === toolbar.text);
    if (!existing) {
      const hl: Highlight = { id: crypto.randomUUID(), text: toolbar.text };
      setHighlights(prev => [...prev, hl]);
    }
    setToolbar(null);
    globalThis.getSelection()?.removeAllRanges();
  }, [toolbar, highlights]);

  const handleUnmark = useCallback(() => {
    if (!toolbar) return;
    setHighlights(prev =>
      toolbar.highlightId
        ? prev.filter(h => h.id !== toolbar.highlightId)
        : prev.filter(h => h.text !== toolbar.text)
    );
    setToolbar(null);
    globalThis.getSelection()?.removeAllRanges();
  }, [toolbar]);

  const handleNote = useCallback(() => {
    if (!toolbar) return;
    let hl = toolbar.highlightId
      ? highlights.find(h => h.id === toolbar.highlightId)
      : highlights.find(h => h.text === toolbar.text);
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
        if (prev.some(n => n.id === id)) return prev.map(n => (n.id === id ? { ...n, note } : n));
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

  let isHighlighted = false;
  if (toolbar) {
    if (toolbar.highlightId) {
      isHighlighted = highlights.some(h => h.id === toolbar.highlightId);
    } else {
      isHighlighted = highlights.some(h => h.text === toolbar.text);
    }
  }

  return (
    <div className="selection-toolbar-container" ref={containerRef}>
      {children}

      {toolbar && (
        <div
          ref={toolbarRef}
          className="sel-toolbar"
          style={{ left: toolbar.x, top: toolbar.y }}
          role="toolbar"
          aria-label="Opções de texto selecionado"
        >
          {isHighlighted ? (
            <button className="sel-toolbar-btn" onClick={handleUnmark} title="Desmarcar">
              <span aria-hidden="true">✕</span> Desmarcar
            </button>
          ) : (
            <button className="sel-toolbar-btn" onClick={handleMark} title="Marcar">
              <span aria-hidden="true">🖍️</span> Marcar
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
