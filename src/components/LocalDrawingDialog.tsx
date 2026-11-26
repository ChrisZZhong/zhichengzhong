'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Excalidraw, exportToSvg, loadFromBlob, serializeAsJSON } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import '@excalidraw/excalidraw/index.css';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  initialCaption: string;
  scene?: string;
  onClose: () => void;
  onInsert: (drawing: { caption: string; scene: string; svg: string }) => void;
}

export default function LocalDrawingDialog({ initialCaption, scene, onClose, onInsert }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { theme } = useTheme();
  const [caption, setCaption] = useState(initialCaption);
  const [api, setApi] = useState<ExcalidrawImperativeAPI>();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { dialog.current?.showModal(); }, []);

  const initialData = useMemo(() => {
    if (!scene) return undefined;
    return loadFromBlob(new Blob([scene], { type: 'application/json' }), null, null)
      .then(data => ({ ...data, scrollToContent: true }));
  }, [scene]);

  async function insertDrawing() {
    if (!api || working) return;
    const elements = api.getSceneElements();
    if (!elements.length) {
      setError('Draw something on the canvas before inserting it.');
      return;
    }
    setWorking(true);
    setError('');
    try {
      const appState = api.getAppState();
      const files = api.getFiles();
      const svg = await exportToSvg({
        elements,
        files,
        appState: { ...appState, exportBackground: true, exportEmbedScene: false, exportWithDarkMode: false },
      });
      onInsert({
        caption: caption.trim().replace(/[\r\n]+/g, ' ') || 'Architecture diagram',
        scene: serializeAsJSON(elements, appState, files, 'local'),
        svg: svg.outerHTML,
      });
    } catch {
      setError('Could not export the drawing. You can retry without losing your canvas.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="drawing-dialog-title"
      className="m-auto w-[calc(100%-1rem)] max-w-6xl overflow-auto rounded-2xl border border-card-border bg-space p-0 text-text-primary backdrop:bg-black/60"
      onCancel={(event) => {
        event.preventDefault();
        if (!working) onClose();
      }}
    >
      <div className="flex flex-wrap items-end gap-3 border-b border-card-border p-4">
        <h2 id="drawing-dialog-title" className="w-full text-lg font-semibold">{scene ? 'Edit drawing' : 'New Excalidraw drawing'}</h2>
        <label className="min-w-44 flex-1 text-sm">
          Diagram caption
          <input value={caption} onChange={event => setCaption(event.target.value)} className="mt-1 block w-full rounded-lg border border-card-border bg-space px-3 py-2" />
        </label>
        <button type="button" onClick={onClose} disabled={working} className="rounded-lg border border-card-border px-4 py-2 text-sm">Cancel</button>
        <button type="button" onClick={insertDrawing} disabled={!api || working} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {working ? 'Rendering…' : scene ? 'Update drawing' : 'Insert drawing'}
        </button>
        {error && <p role="alert" className="w-full text-sm text-red-600">{error}</p>}
      </div>
      <div className="h-[min(67vh,44rem)]">
        <Excalidraw
          initialData={initialData}
          excalidrawAPI={setApi}
          theme={theme}
          UIOptions={{ canvasActions: { loadScene: false, saveToActiveFile: false, export: false, saveAsImage: false } }}
        />
      </div>
    </dialog>
  );
}
