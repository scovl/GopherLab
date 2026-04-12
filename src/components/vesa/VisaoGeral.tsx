import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { VesaContent } from '../../types';
import { getLessonContent } from '../../data/content';
import { mdComponents } from './mdComponents';

function getYouTubeId(url: string): string | null {
  const m = RegExp(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/).exec(url);
  return m ? m[1] : null;
}

export function VisaoGeralContent({ content, lessonId }: Readonly<{ content: VesaContent['visaoGeral']; lessonId: string }>) {
  const markdownContent = getLessonContent(lessonId);
  const youtubeUrls = content.recursos.filter(u => getYouTubeId(u) !== null);
  const linkUrls = content.recursos.filter(u => getYouTubeId(u) === null);

  return (
    <div className="phase-content">
      <div className="explanation-block">
        {markdownContent ? (
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{markdownContent}</ReactMarkdown>
          </div>
        ) : content.explicacao ? (
          content.explicacao.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)
        ) : null}
      </div>

      {youtubeUrls.map((url, i) => {
        const videoId = getYouTubeId(url)!;
        return (
          <div key={videoId} className="youtube-embed">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`Vídeo ${i + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      })}

      {content.codeExample && (
        <div className="code-block">
          <h4>Exemplo de código</h4>
          <pre>
            <code>{content.codeExample}</code>
          </pre>
        </div>
      )}

      {linkUrls.length > 0 && (
        <div className="resources-block">
          <h4>Recursos para estudo</h4>
          <ul>
            {linkUrls.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {url.replace(/^https?:\/\//, '').split('/').slice(0, 2).join('/')}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
