'use client';

import { useEffect, useRef, useState } from 'react';
import { List } from 'lucide-react';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface Props {
  headings: TocHeading[];
}

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    // Track which headings are visible; pick the topmost one
    const visibleIds = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        });

        // Pick the first visible heading in document order
        const ordered = headings.map((h) => h.id);
        const first = ordered.find((id) => visibleIds.has(id));
        if (first) setActiveId(first);
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // offset for the sticky header (~64px nav + ~48px back bar)
    const top = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveId(id);
  };

  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:block w-56 flex-shrink-0 sticky top-36 self-start max-h-[calc(100vh-10rem)] overflow-y-auto"
    >
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-widest mb-3 px-1">
          <List size={12} />
          <span>On this page</span>
        </div>

        {/* Heading list */}
        <ul className="space-y-0.5 border-l border-card-border">
          {headings.map(({ id, text, level }) => {
            const isActive = activeId === id;
            return (
              <li key={id}>
                <button
                  onClick={() => handleClick(id)}
                  className={`
                    w-full text-left text-xs leading-snug transition-all duration-150
                    ${level === 1 ? 'pl-4 py-1.5 font-semibold' : ''}
                    ${level === 2 ? 'pl-4 py-1.5 font-medium' : ''}
                    ${level === 3 ? 'pl-7 py-1 font-normal' : ''}
                    ${level === 4 ? 'pl-10 py-1 font-normal' : ''}
                    ${isActive
                      ? 'text-accent-cyan border-l-2 border-accent-cyan -ml-px'
                      : 'text-text-muted hover:text-text-primary border-l-2 border-transparent -ml-px'
                    }
                  `}
                >
                  {text}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
