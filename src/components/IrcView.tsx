import React from 'react';

const IRC_URL = 'https://kiwiirc.com/nextclient/irc.libera.chat/#gopherlab';

export function IrcView() {
  return (
    <iframe
      className="irc-view-frame"
      src={IRC_URL}
      title="Chat IRC — #gopherlab na Libera.Chat"
      allow="fullscreen"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
    />
  );
}
