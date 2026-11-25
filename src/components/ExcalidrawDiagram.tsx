'use client';

import { useEffect, useState } from 'react';

interface Props {
  src: string;
  alt: string;
}

export default function ExcalidrawDiagram({ src, alt }: Props) {
  // undefined while rendering, null if the scene could not be loaded.
  const [image, setImage] = useState<{ url: string; width: number; height: number } | null>();

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;

    async function renderDiagram() {
      const source = new URL(src, window.location.href);
      if (source.origin !== window.location.origin) {
        throw new Error('Use an Excalidraw file hosted on this site.');
      }

      const response = await fetch(source, {
        mode: 'same-origin',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Diagram file could not be loaded.');

      const { loadFromBlob, exportToSvg } = await import('@excalidraw/excalidraw');
      if (controller.signal.aborted) return;

      const { elements, appState, files } = await loadFromBlob(await response.blob(), null, null);
      const svg = await exportToSvg({
        elements,
        files,
        appState: {
          ...appState,
          exportBackground: true,
          exportEmbedScene: false,
          exportWithDarkMode: false,
        },
      });
      if (controller.signal.aborted) return;

      objectUrl = URL.createObjectURL(new Blob([svg.outerHTML], { type: 'image/svg+xml' }));
      setImage({
        url: objectUrl,
        width: Number(svg.getAttribute('width')),
        height: Number(svg.getAttribute('height')),
      });
    }

    renderDiagram().catch(() => {
      if (!controller.signal.aborted) setImage(null);
    });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (image === undefined) {
    return <span role="status" className="block text-sm text-text-muted">Loading diagram…</span>;
  }

  if (image === null) {
    return (
      <span role="status" className="block text-sm text-text-muted">
        Couldn’t display this drawing. <a href={src}>Open the Excalidraw file</a>
      </span>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={image.url} alt={alt} width={image.width} height={image.height} className="rounded-xl border border-card-border max-w-full h-auto mx-auto bg-white" />;
}
