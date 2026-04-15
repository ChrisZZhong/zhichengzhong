'use client';

import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { Components } from 'react-markdown';

const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), { ssr: false });

interface Props {
  content: string;
}

export default function BlogPostContent({ content }: Props) {
  const components: Components = {
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
    img({ src, alt }) {
      return (
        <span className="block my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt || ''} className="rounded-xl border border-card-border max-w-full mx-auto" />
          {alt && <span className="block text-center text-xs text-text-muted mt-2 italic">{alt}</span>}
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

  return (
    <div className="blog-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
