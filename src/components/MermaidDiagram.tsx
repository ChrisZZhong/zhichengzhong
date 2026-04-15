'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  chart: string;
}

let mermaidInitialized = false;

export default function MermaidDiagram({ chart }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const mermaid = (await import('mermaid')).default;

        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            darkMode: true,
            themeVariables: {
              primaryColor: '#1e1e3a',
              primaryTextColor: '#e2e8f0',
              primaryBorderColor: '#22d3ee',
              lineColor: '#6366f1',
              secondaryColor: '#0f0f20',
              tertiaryColor: '#0a0a18',
              background: '#040411',
              mainBkg: '#1e1e3a',
              nodeBorder: '#22d3ee',
              clusterBkg: '#0f0f20',
              titleColor: '#e2e8f0',
              edgeLabelBackground: '#0f0f20',
              attributeBackgroundColorEven: '#0f0f20',
              attributeBackgroundColorOdd: '#0a0a18',
            },
          });
          mermaidInitialized = true;
        }

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        if (!cancelled) setSvg(renderedSvg);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <div className="mermaid-wrapper border-red-500/30">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-2 font-mono">⚠ Diagram render error</p>
          <pre className="text-xs text-text-muted overflow-auto max-w-full">{chart}</pre>
        </div>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="mermaid-wrapper">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
          <span className="text-xs text-text-muted font-mono">Rendering diagram...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mermaid-wrapper"
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
