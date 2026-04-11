import ReactMarkdown from 'react-markdown';
import type { VesaContent } from '../../types';
import { GoCodeEditor } from './GoCodeEditor';

const mdComponents = {
  a: ({ href, children }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  ),
};

export function ExperimentacaoContent({ content, lessonId }: Readonly<{ content: VesaContent['experimentacao']; lessonId: string }>) {
  return (
    <div className="phase-content">
      <div className="challenge-block">
        <h4>Desafio</h4>
        <ReactMarkdown components={mdComponents}>{content.desafio}</ReactMarkdown>
      </div>

      <div className="tips-block">
        <h4>Dicas</h4>
        <ul>
          {content.dicas.map((dica, i) => (
            <li key={i}><ReactMarkdown components={mdComponents}>{dica}</ReactMarkdown></li>
          ))}
        </ul>
      </div>

      <GoCodeEditor
        referenceCode={content.codeTemplate}
        referenceLabel="Template — ponto de partida"
        lessonId={lessonId}
        downloadName={`${lessonId}-exercicio`}
        notaPos={content.notaPos}
      />
    </div>
  );
}
