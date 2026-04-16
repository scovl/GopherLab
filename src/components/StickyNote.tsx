import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface StickyNoteProps {
  id: string;
  text: string;
  note: string;
  onSave: (id: string, note: string) => void;
  onClose: (id: string) => void;
  onDelete: (id: string) => void;
  onPin?: (id: string, text: string, note: string) => void;
}

export function StickyNote({ id, text, note, onSave, onClose, onDelete, onPin }: Readonly<StickyNoteProps>) {
  const [value, setValue] = useState(note);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Center on first mount
  useEffect(() => {
    setPos({
      x: Math.max(60, globalThis.innerWidth / 2 - 150),
      y: Math.max(60, globalThis.innerHeight / 2 - 120),
    });
    textareaRef.current?.focus();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'TEXTAREA' || tag === 'BUTTON') return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent) => {
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const handleUp = () => setDragging(false);

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [dragging]);

  const handleSave = () => onSave(id, value);

  return createPortal(
    <dialog
      ref={noteRef}
      className="sticky-note"
      style={{ left: pos.x, top: pos.y }}
      open
      aria-label="Nota pessoal"
      onMouseDown={handleMouseDown}
    >
      <div className="sticky-note-header">
        <span className="sticky-note-title">📌 Nota</span>
        <div className="sticky-note-actions">
          {onPin && (
            <button
              className="sticky-note-btn"
              onClick={() => { handleSave(); onPin(id, text, value); }}
              aria-label="Guardar no shelf"
              title="Guardar no shelf"
            >
              📋
            </button>
          )}
          <button
            className="sticky-note-btn"
            onClick={() => onDelete(id)}
            aria-label="Excluir nota"
            title="Excluir"
          >
            🗑️
          </button>
          <button
            className="sticky-note-btn"
            onClick={() => { handleSave(); onClose(id); }}
            aria-label="Fechar nota"
            title="Fechar"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="sticky-note-quote">"{text.slice(0, 80)}{text.length > 80 ? '…' : ''}"</div>
      <textarea
        ref={textareaRef}
        className="sticky-note-textarea"
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleSave}
        placeholder="Escreva sua nota aqui…"
        rows={4}
      />
    </dialog>,
    document.body
  );
}
