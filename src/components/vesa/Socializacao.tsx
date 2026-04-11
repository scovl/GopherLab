import React from 'react';
import type { VesaContent } from '../../types';

const SOCIAL_PLATFORMS = [
  {
    label: 'X (Twitter)',
    icon: '𝕏',
    url: (tags: string) => `https://x.com/intent/post?text=${encodeURIComponent(tags)}`,
    color: '#000',
  },
  {
    label: 'Mastodon',
    icon: '🐘',
    url: () => 'https://mastodon.social/',
    color: '#6364ff',
  },
  {
    label: 'Bluesky',
    icon: '🦋',
    url: () => 'https://bsky.app/',
    color: '#0085ff',
  },
];

export function SocializacaoContent({ content }: Readonly<{ content: VesaContent['socializacao'] }>) {
  const topic = content.sugestaoBlog ?? 'Go';
  const hashtags = `#100DaysOfCode #100DaysOfGo #golang ${content.hashtagsExtras ?? ''}`.trim();
  const postTemplate = `Dia X/100 do #100DaysOfCode #100DaysOfGo\n\n📚 Hoje aprendi: ${topic}\n💻 O que fiz: [descreva brevemente]\n🔗 Repositório: [link do GitHub]\n\n#golang ${content.hashtagsExtras ?? ''}`.trim();

  return (
    <div className="phase-content">
      {content.diasDesafio && (
        <div className="days-badge" aria-label={`Faixa do desafio: ${content.diasDesafio}`}>
          🗓️ {content.diasDesafio} — #100DaysOfCode
        </div>
      )}

      <div className="challenge-100days">
        <h4 className="challenge-100days-heading">🔥 #100DaysOfCode — Compartilhe seu progresso</h4>
        <div className="challenge-100days-body">
          <p className="challenge-100days-info">
            Programe <strong>pelo menos 1 hora por dia</strong> e poste sobre seu progresso usando{' '}
            <code>#100DaysOfCode</code>. A accountability pública acelera o aprendizado e conecta
            você com uma comunidade global de desenvolvedores.
          </p>
          <div className="challenge-100days-links">
            <p className="challenge-label">📖 Leia antes de começar:</p>
            <ul className="challenge-links-list">
              <li>
                <a
                  href="https://www.freecodecamp.org/portuguese/news/desafio-100daysofcode-qual-e-a-sua-origem-e-por-que-voce-deveria-fazer-o-desafio/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  O que é o #100DaysOfCode e por que participar — freeCodeCamp (pt-BR)
                </a>
              </li>
              <li>
                <a
                  href="https://www.100daysofcode.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Site oficial do #100DaysOfCode
                </a>
              </li>
            </ul>
          </div>

          <div className="challenge-post-template">
            <label htmlFor="post-template-text" className="challenge-label">
              📋 Template de post — copie, edite e publique:
            </label>
            <textarea
              id="post-template-text"
              className="post-template-textarea"
              defaultValue={postTemplate}
              rows={5}
              aria-label="Template de post para redes sociais"
            />
          </div>

          <div className="social-platforms">
            <p className="challenge-label">📣 Publicar em:</p>
            <div className="social-buttons">
              {SOCIAL_PLATFORMS.map(p => (
                <a
                  key={p.label}
                  href={p.url(hashtags)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-social"
                  style={{ '--social-color': p.color } as React.CSSProperties}
                  aria-label={`Abrir ${p.label}`}
                >
                  <span aria-hidden="true">{p.icon}</span> {p.label}
                </a>
              ))}
            </div>
          </div>

          {content.sugestaoBlog && (
            <div className="blog-suggestion">
              <p className="challenge-label">✍️ Escreva no seu blog:</p>
              <p className="blog-title-suggestion">"{content.sugestaoBlog}"</p>
              <div className="blog-platforms">
                <a
                  href="https://dev.to/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-blog"
                >
                  📝 Publicar no dev.to
                </a>
                <a
                  href="https://gohugo.io/getting-started/quick-start/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-blog btn-blog-secondary"
                >
                  ⚡ Blog com Hugo + GitHub Pages
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
