'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import BlogPostContent from './BlogPostContent';
import LocalMarkdownInput from './LocalMarkdownInput';
import type { DrawingInsertion } from '@/lib/preview-drawing-markers';

const LocalDrawingDialog = dynamic(() => import('./LocalDrawingDialog'), {
  ssr: false,
  loading: () => <p role="status" className="fixed inset-x-0 bottom-5 z-50 mx-auto w-fit rounded-lg bg-slate-800 px-4 py-2 text-white">Loading drawing canvas…</p>,
});

interface Props {
  title: string;
  slug: string;
  postHref: string;
  apiHref: string;
  imageBase: string;
  initialContent: string;
  initialRevision: string;
}

interface DrawingDraft {
  id: string;
  scene: string;
  svg: string;
  preview: string;
}

type DrawingPlacement =
  | (DrawingInsertion & { draft: string })
  | { src: string; caption: string; scene: string; start: number; end: number; draft: string };

function normalizeLineEndings(content: string) {
  return content.replace(/\r\n?/g, '\n');
}

export default function LocalBlogEditor({ title, slug, postHref, apiHref, imageBase, initialContent, initialRevision }: Props) {
  const [content, setContent] = useState(() => normalizeLineEndings(initialContent));
  const [savedContent, setSavedContent] = useState(() => normalizeLineEndings(initialContent));
  const [revision, setRevision] = useState(initialRevision);
  const [drawings, setDrawings] = useState<Record<string, DrawingDraft>>({});
  const [placement, setPlacement] = useState<DrawingPlacement>();
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const objectUrls = useRef(new Set<string>());
  const dirty = content !== savedContent || Object.keys(drawings).length > 0;

  useEffect(() => {
    const urls = objectUrls.current;
    return () => { urls.forEach(url => URL.revokeObjectURL(url)); };
  }, []);

  useEffect(() => {
    const inUse = new Set(Object.values(drawings).map(drawing => drawing.preview));
    objectUrls.current.forEach(url => {
      if (inUse.has(url)) return;
      URL.revokeObjectURL(url);
      objectUrls.current.delete(url);
    });
  }, [drawings]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function beginDrawing(insertion: DrawingInsertion) {
    if (!working && !placement) setPlacement({ ...insertion, draft: content });
  }

  async function reopenDrawing(src: string, caption: string, start: number, end: number) {
    if (working || placement) return;
    setError('');
    const position = { src, caption, start, end, draft: content };
    const pending = drawings[src];
    if (pending) {
      setPlacement({ ...position, scene: pending.scene });
      return;
    }
    setWorking(true);
    try {
      const id = src.slice(imageBase.length, -'.svg'.length);
      const response = await fetch(`${apiHref}?drawing=${encodeURIComponent(id)}`);
      if (!response.ok) throw new Error('The editable source for this drawing could not be opened.');
      setPlacement({ ...position, scene: await response.text() });
    } catch {
      setError('The editable source for this drawing could not be opened.');
    } finally {
      setWorking(false);
    }
  }

  function insertDrawing({ caption, scene, svg }: { caption: string; scene: string; svg: string }) {
    if (!placement) return;
    if (placement.draft !== content) {
      throw new Error('The draft changed while the canvas was opening.');
    }

    const previous = 'src' in placement ? placement.src : undefined;
    const previousDraft = previous ? drawings[previous] : undefined;
    const label = caption.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48).replace(/^-+|-+$/g, '') || 'diagram';
    const id = previousDraft?.id ?? `${label}-${crypto.randomUUID().slice(0, 8)}`;
    const src = `${imageBase}${id}.svg`;
    const alt = caption.replace(/[\\\[\]]/g, '\\$&');
    const image = `![${alt}](${src})`;
    const preview = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    objectUrls.current.add(preview);

    if ('offset' in placement) {
      const { offset, indent } = placement;
      const after = content.slice(offset).replace(/^(?:[ \t]*\n)+/, '');
      setContent(`${content.slice(0, offset).trimEnd()}\n\n${indent}${image}\n\n${after}`);
    } else {
      const { start, end, src: previousSrc } = placement;
      setContent((content.slice(0, start) + image + content.slice(end)).replaceAll(previousSrc, src));
    }

    setDrawings(current => ({ ...current, [src]: { id, scene, svg, preview } }));
    setPlacement(undefined);
    setMessage('Drawing added to this draft. Save to write it to the workspace.');
    setError('');
  }

  async function save() {
    if (working || placement) return;
    setWorking(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(apiHref, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revision, content,
          drawings: Object.values(drawings).map(({ id, scene, svg }) => ({ id, scene, svg })),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || 'Could not save the local draft.');
      setRevision(result.revision);
      const saved = normalizeLineEndings(result.content);
      setContent(saved);
      setSavedContent(saved);
      setDrawings({});
      setMessage('Saved to the local workspace.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save the local draft.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="mx-auto max-w-screen-2xl px-4 pb-12 pt-24 md:px-8">
      <Link
        href={postHref}
        className="text-sm text-text-muted hover:text-text-primary"
        onClick={event => {
          if (dirty && !window.confirm('Leave without saving your changes?')) event.preventDefault();
        }}
      >
        ← Back to article
      </Link>
      <h1 className="mt-3 text-2xl font-bold">{title}</h1>
      <div className="mt-2 text-sm text-text-muted">Local editor · {slug}</div>
      <div className="my-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={!dirty || working || Boolean(placement)} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {working ? 'Working…' : 'Save to workspace'}
        </button>
        {message && <p role="status" className="text-sm text-text-muted">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-label="Markdown editor" className="min-w-0 rounded-xl border border-card-border bg-card-bg p-4 text-sm">
          <h2 className="font-semibold">Markdown</h2>
          <LocalMarkdownInput
            value={content}
            onChange={setContent}
            readOnly={working || Boolean(placement)}
          />
        </section>
        <section aria-label="Article preview" className="min-w-0 overflow-auto rounded-xl border border-card-border bg-card-bg p-4 lg:max-h-[70vh]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Preview</h2>
            <button type="button" onClick={() => beginDrawing({ offset: content.length, indent: '' })} disabled={working || Boolean(placement)} className="rounded-md border border-card-border px-2 py-1 text-xs disabled:opacity-50">
              + Add drawing at end
            </button>
          </div>
          <BlogPostContent content={content} editing={{
            imageBase,
            previews: Object.fromEntries(Object.entries(drawings).map(([src, drawing]) => [src, drawing.preview])),
            insertDrawing: beginDrawing,
            editDrawing: reopenDrawing,
          }} />
        </section>
      </div>
      {placement && <LocalDrawingDialog
        initialCaption={'caption' in placement ? placement.caption : ''}
        scene={'scene' in placement ? placement.scene : undefined}
        onClose={() => setPlacement(undefined)}
        onInsert={insertDrawing}
      />}
    </section>
  );
}
