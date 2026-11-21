'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { PatternTopic } from './PatternCatalog';
import {
  bands,
  connections,
  frame,
  groupBounds,
  mapHeight,
  mapWidth,
  nodeBounds,
  shortLabels,
} from './pattern-map-layout';
import type { Rectangle, Relationship } from './pattern-map-layout';
import styles from './patterns.module.css';

function position([left, top, right, bottom]: Rectangle) {
  return {
    left: `${100 * left / mapWidth}%`,
    top: `${100 * top / mapHeight}%`,
    width: `${100 * (right - left) / mapWidth}%`,
    height: `${100 * (bottom - top) / mapHeight}%`,
  };
}

function midpoint([left, top, right, bottom]: Rectangle) {
  return [(left + right) / 2, (top + bottom) / 2] as const;
}

function drawConnections(board: HTMLDivElement, canvas: HTMLCanvasElement) {
  const drawingContext = canvas.getContext('2d');
  if (!drawingContext) return;
  const context = drawingContext;

  const boardRect = board.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.round(boardRect.width * scale);
  canvas.height = Math.round(boardRect.height * scale);
  context.setTransform(canvas.width / mapWidth, 0, 0, canvas.height / mapHeight, 0, 0);

  const theme = getComputedStyle(board);
  const background = theme.getPropertyValue('--map-background').trim();
  const colors = {
    solution: theme.getPropertyValue('--solution-edge').trim(),
    alternative: theme.getPropertyValue('--alternative-edge').trim(),
    specialization: theme.getPropertyValue('--specialization-edge').trim(),
  };
  context.lineWidth = 1.7;
  context.lineJoin = 'round';

  function drawArrow(x: number, y: number, angle: number, hollow: boolean) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x - 9 * Math.cos(angle - 0.51), y - 9 * Math.sin(angle - 0.51));
    context.lineTo(x - 9 * Math.cos(angle + 0.51), y - 9 * Math.sin(angle + 0.51));
    context.closePath();
    context.fillStyle = hollow ? background : context.strokeStyle;
    context.fill();
    if (hollow) context.stroke();
  }

  function connect(start: Rectangle, end: Rectangle, relationship: Relationship) {
    const [sx, sy] = midpoint(start);
    const [ex, ey] = midpoint(end);
    const dx = ex - sx;
    const dy = ey - sy;
    const startOffset = Math.min(
      dx === 0 ? Infinity : (start[2] - start[0]) / (2 * Math.abs(dx)),
      dy === 0 ? Infinity : (start[3] - start[1]) / (2 * Math.abs(dy)),
    );
    const endOffset = Math.min(
      dx === 0 ? Infinity : (end[2] - end[0]) / (2 * Math.abs(dx)),
      dy === 0 ? Infinity : (end[3] - end[1]) / (2 * Math.abs(dy)),
    );
    const x1 = sx + dx * startOffset;
    const y1 = sy + dy * startOffset;
    const x2 = ex - dx * endOffset;
    const y2 = ey - dy * endOffset;
    const angle = Math.atan2(dy, dx);

    context.strokeStyle = colors[relationship];
    context.setLineDash(relationship === 'alternative' ? [5, 5] : []);
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.setLineDash([]);
    drawArrow(x2, y2, angle, relationship === 'specialization');
    if (relationship === 'alternative') drawArrow(x1, y1, angle + Math.PI, false);
  }

  for (const [from, to, relationship] of connections) {
    connect(nodeBounds[from], nodeBounds[to], relationship);
  }
  connect(nodeBounds['microservice-architecture'], [frame[0], 650, frame[0], 652], 'solution');
}

export default function PatternMap({ topics }: { topics: PatternTopic[] }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const board = boardRef.current;
    const canvas = canvasRef.current;
    if (!board || !canvas) return;

    const draw = () => drawConnections(board, canvas);
    const resize = new ResizeObserver(draw);
    const theme = new MutationObserver(draw);
    resize.observe(board);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    draw();

    return () => {
      resize.disconnect();
      theme.disconnect();
    };
  }, []);

  const patterns = topics.flatMap(topic => topic.patterns);
  return (
    <section className={styles.overview} aria-labelledby="pattern-map-title">
      <div className={styles.mapHeading}>
        <div>
          <h2 id="pattern-map-title">Microservice architecture map</h2>
          <p>{patterns.length} patterns. Select a node to open its guide.</p>
        </div>
        <a href="#pattern-catalog" className={styles.mapJump}>Search or browse the catalog ↓</a>
      </div>
      <ul className={styles.mapLegend} aria-label="Relationship legend">
        <li><span aria-hidden="true" data-edge="solution" />Motivation → solution</li>
        <li><span aria-hidden="true" data-edge="alternative" />Alternative solutions</li>
        <li><span aria-hidden="true" data-edge="specialization" />General ← specific</li>
      </ul>
      <p className={styles.panGuide}>Scroll horizontally to explore the map.</p>
      <div className={styles.mapViewport} role="region" aria-label="Interactive map" tabIndex={0}>
        <div
          className={styles.mapBoard}
          ref={boardRef}
          style={{ aspectRatio: `${mapWidth} / ${mapHeight}` }}
        >
          <div className={styles.mapFrame} style={position(frame)} aria-hidden="true" />
          {bands.map(({ name, y }, index) => (
            <div
              className={styles.mapBand}
              data-divider={index > 0}
              style={position([frame[0] + 13, y, frame[2] - 17, y])}
              key={name}
            >
              <h3>{name}</h3>
            </div>
          ))}
          {groupBounds.map(group => (
            <div
              key={group.name}
              className={styles.mapGroup}
              id={group.anchor ? `map-${group.anchor}` : undefined}
              data-map-group={group.name}
              data-outer={group.outer || undefined}
              style={position(group.bounds)}
            >
              <span>{group.name}</span>
            </div>
          ))}
          <canvas className={styles.mapConnections} ref={canvasRef} aria-hidden="true" />
          <ul className={styles.mapNodes} aria-label="Design patterns">
            {patterns.map(pattern => (
              <li key={pattern.slug} id={`map-node-${pattern.slug}`} style={position(nodeBounds[pattern.slug])}>
                <Link
                  href={pattern.href}
                  data-pattern={pattern.slug}
                  prefetch={false}
                  aria-label={pattern.name}
                  title={pattern.name}
                >
                  <span>{shortLabels[pattern.slug] ?? pattern.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
