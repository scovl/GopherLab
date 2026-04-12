import React, { useEffect, useRef } from 'react';

interface IrcModalProps {
  onClose: () => void;
}

const IRC_URL = 'https://kiwiirc.com/nextclient/irc.libera.chat/#gopherlab';

export function IrcModal({ onClose }: Readonly<IrcModalProps>) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the close button on open; close on Escape
  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="irc-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Chat IRC — #gopherlab na Libera.Chat"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="irc-modal">
        <div className="irc-modal-header">
          <span className="irc-modal-title">
            <span aria-hidden="true">💬</span>
            Chat IRC — <code>#gopherlab</code> @ Libera.Chat
          </span>
          <button
            ref={closeButtonRef}
            className="irc-modal-close"
            onClick={onClose}
            aria-label="Fechar chat IRC"
            title="Fechar (Esc)"
          >
            ✕
          </button>
        </div>
        <iframe
          className="irc-modal-frame"
          src={IRC_URL}
          title="Chat IRC — #gopherlab na Libera.Chat"
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
