'use client';

import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { Components } from 'react-markdown';
import { markPreviewDrawingBlocks, type DrawingInsertion } from '@/lib/preview-drawing-markers';

const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), { ssr: false });
const ExcalidrawDiagram = dynamic(() => import('./ExcalidrawDiagram'), {
  ssr: false,
  loading: () => <span role="status" className="block text-sm text-text-muted">Loading diagram…</span>,
});

interface Props {
  content: string;
  editing?: {
    imageBase: string;
    previews: Record<string, string>;
    insertDrawing: (insertion: DrawingInsertion) => void;
    editDrawing: (src: string, alt: string, start: number, end: number) => void;
  };
}

/** Convert heading text to a URL-safe id (same logic as server-side extractHeadings) */
function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w一-鿿-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Extract plain text from ReactMarkdown children */
function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children && typeof children === 'object' && 'props' in (children as object)) {
    return extractText((children as { props: { children: React.ReactNode } }).props.children);
  }
  return '';
}

export default function BlogPostContent({ content, editing }: Props) {
  const components: Components = {
    // Headings with auto-generated ids for TOC anchor links
    h1({ children }) {
      const id = slugify(extractText(children));
      return <h1 id={id}>{children}</h1>;
    },
    h2({ children }) {
      const id = slugify(extractText(children));
      return <h2 id={id}>{children}</h2>;
    },
    h3({ children }) {
      const id = slugify(extractText(children));
      return <h3 id={id}>{children}</h3>;
    },
    h4({ children }) {
      const id = slugify(extractText(children));
      return <h4 id={id}>{children}</h4>;
    },
    pre({ node, children, ...props }) {
      const code = node?.children[0];
      if (code?.type === 'element' && code.tagName === 'code' &&
          Array.isArray(code.properties.className) && code.properties.className.includes('language-mermaid')) {
        return <>{children}</>;
      }
      return <pre {...props}>{children}</pre>;
    },
    code(props) {
      const { children, className } = props;
      const match = /language-(\w+)/.exec(className || '');
      const lang = match?.[1];
      const code = String(children).replace(/\n$/, '');

      // Mermaid diagrams
      if (lang === 'mermaid') {
        return <MermaidDiagram chart={code} />;
      }

      // Inline code (no lang)
      if (!lang) {
        return <code className={className}>{children}</code>;
      }

      // Syntax highlighted block
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={lang}
          PreTag="div"
          customStyle={{
            background: '#0d0d1a',
            border: '1px solid rgba(99, 102, 241, 0.18)',
            borderRadius: '10px',
            padding: '1.25rem 1.5rem',
            fontSize: '0.875rem',
            lineHeight: '1.7',
            margin: '1.5rem 0',
          }}
          codeTagProps={{
            style: {
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      );
    },
    // Custom table with nice styling
    table({ children }) {
      return (
        <div className="overflow-x-auto my-6">
          <table className="w-full border-collapse">{children}</table>
        </div>
      );
    },
    // Blockquote
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-accent-cyan/50 pl-5 py-1 my-5 bg-accent-cyan/5 rounded-r-lg italic text-text-muted">
          {children}
        </blockquote>
      );
    },
    // Images
    img({ src, alt, node }) {
      const isExcalidraw = src?.split(/[?#]/, 1)[0].toLowerCase().endsWith('.excalidraw');
      const canEditDrawing = editing && src?.startsWith(editing.imageBase) && src.endsWith('.svg');
      const preview = src && editing?.previews[src];
      const start = node?.position?.start.offset;
      const end = node?.position?.end.offset;
      return (
        <span className="block my-6">
          {isExcalidraw && src ? <ExcalidrawDiagram key={src} src={src} alt={alt ?? ''} /> : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview || src} alt={alt || ''} className="rounded-xl border border-card-border max-w-full mx-auto" />
          )}
          {alt && <span className="block text-center text-xs text-text-muted mt-2 italic">{alt}</span>}
          {canEditDrawing && editing && src && start !== undefined && end !== undefined && (
            <button type="button" className="mx-auto mt-2 block rounded-md border border-card-border px-2.5 py-1 text-xs text-text-primary hover:bg-space" onClick={() => editing.editDrawing(src, alt ?? '', start, end)}>
              Edit drawing
            </button>
          )}
        </span>
      );
    },
    // Links - open external in new tab
    a({ href, children }) {
      const isExternal = href?.startsWith('http');
      return (
        <a
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      );
    },
  };

  if (editing) {
    components.span = function PreviewSpan({ node, children, ...props }) {
      const offset = node?.properties.drawingMarkerOffset;
      if (typeof offset !== 'number' || !node) return <span {...props}>{children}</span>;
      const indent = node.properties.drawingMarkerIndent;
      const insertion = {
        offset,
        indent: typeof indent === 'string' ? indent : '',
      };
      return (
        <button type="button" className="mb-4 block rounded-md border border-dashed border-card-border px-2.5 py-1 text-xs text-text-muted hover:border-accent-cyan hover:text-text-primary" onClick={() => editing.insertDrawing(insertion)}>
          + Insert Excalidraw here
        </button>
      );
    };
  }

  return (
    <div className="blog-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={editing ? [rehypeRaw, [markPreviewDrawingBlocks, content]] : [rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
