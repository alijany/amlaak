import { parseSlateValue, slateToHtml } from './slate.utils';

interface SlateRendererProps {
  content: string;
  className?: string;
}

export function SlateRenderer({ content, className = '' }: SlateRendererProps) {
  const nodes = parseSlateValue(content);
  const html = slateToHtml(nodes);

  return (
    <>
      <style>{`
        .slate-content figure { margin: 1rem 0; }
        .slate-content figure img { max-width: 100%; border-radius: 0.5rem; }
        .slate-content figcaption { text-align: center; font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem; }
        .slate-content a { color: #2563eb; text-decoration: underline; }
        .slate-content a:hover { color: #1d4ed8; }
      `}</style>
      <div
        className={`prose prose-slate max-w-none slate-content ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
