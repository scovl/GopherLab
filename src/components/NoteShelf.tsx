import React, { useState, useEffect, useCallback } from 'react';
import { StickyNote } from './StickyNote';

export interface ShelfNote {
  id: string;
  lessonId: string;
  lessonTitle: string;
  text: string;
  note: string;
}

const SHELF_KEY = 'gopherlab-note-shelf';

function loadShelf(): ShelfNote[] {
  try {
    const raw = localStorage.getItem(SHELF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveShelf(notes: ShelfNote[]) {
  localStorage.setItem(SHELF_KEY, JSON.stringify(notes));
}

export function useNoteShelf() {
  const [shelf, setShelf] = useState<ShelfNote[]>(() => loadShelf());

  useEffect(() => {
    saveShelf(shelf);
  }, [shelf]);

  const pinToShelf = useCallback((note: ShelfNote) => {
    setShelf(prev => {
      if (prev.some(n => n.id === note.id)) {
        return prev.map(n => (n.id === note.id ? note : n));
      }
      return [...prev, note];
    });
  }, []);

  const removeFromShelf = useCallback((id: string) => {
    setShelf(prev => prev.filter(n => n.id !== id));
  }, []);

  const updateShelfNote = useCallback((id: string, noteText: string) => {
    setShelf(prev => prev.map(n => (n.id === id ? { ...n, note: noteText } : n)));
  }, []);

  return { shelf, pinToShelf, removeFromShelf, updateShelfNote };
}

interface NoteShelfProps {
  shelf: ShelfNote[];
  onOpen: (note: ShelfNote) => void;
  onRemove: (id: string) => void;
}

export function NoteShelf({ shelf, onOpen, onRemove }: Readonly<NoteShelfProps>) {
  const [expanded, setExpanded] = useState(false);

  if (shelf.length === 0) return null;

  return (
    <div className="note-shelf">
      <button
        className="note-shelf-toggle"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
      >
        <span aria-hidden="true">📋</span>
        <span>Notas ({shelf.length})</span>
        <span className="note-shelf-chevron" aria-hidden="true">{expanded ? '▴' : '▾'}</span>
      </button>

      {expanded && (
        <ul className="note-shelf-list">
          {shelf.map(sn => (
            <li key={sn.id} className="note-shelf-item">
              <button
                className="note-shelf-item-open"
                onClick={() => onOpen(sn)}
                title={`Abrir nota: ${sn.text.slice(0, 40)}`}
              >
                <span className="note-shelf-item-text">
                  {sn.text.slice(0, 35)}{sn.text.length > 35 ? '…' : ''}
                </span>
                <span className="note-shelf-item-lesson">{sn.lessonTitle}</span>
              </button>
              <button
                className="note-shelf-item-remove"
                onClick={() => onRemove(sn.id)}
                aria-label="Remover nota do shelf"
                title="Remover"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ShelfStickyManagerProps {
  openNotes: ShelfNote[];
  onSave: (id: string, note: string) => void;
  onClose: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ShelfStickyManager({ openNotes, onSave, onClose, onDelete }: Readonly<ShelfStickyManagerProps>) {
  return (
    <>
      {openNotes.map(sn => (
        <StickyNote
          key={sn.id}
          id={sn.id}
          text={sn.text}
          note={sn.note}
          onSave={onSave}
          onClose={onClose}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}
