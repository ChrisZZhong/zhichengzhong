import { ImageResponse } from 'next/og';
import { getMicroservicePattern, microservicePatterns } from '@/lib/microservice-patterns';

const width = 900;
const height = 320;
const boxWidth = 184;
const accents = ['#6ee7c8', '#c4b5fd', '#7dd3fc', '#fcd78b'];

interface Point {
  x: number;
  y: number;
}

function connector(start: Point, end: Point, color: string) {
  const x = start.x + boxWidth / 2;
  const dx = end.x - boxWidth / 2 - x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  const rotation = Math.atan2(dy, dx) * 180 / Math.PI;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      position: 'absolute',
      left: x,
      top: start.y - 9,
      width: length,
      height: 18,
      transform: `rotate(${rotation}deg)`,
      transformOrigin: 'left center',
    }}>
      <div style={{ flexGrow: 1, height: 2, background: color, opacity: 0.7 }} />
      <div style={{
        width: 10, height: 10, marginRight: 4,
        borderRight: `2px solid ${color}`, borderTop: `2px solid ${color}`,
        transform: 'rotate(45deg)',
      }} />
    </div>
  );
}

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return microservicePatterns.map(pattern => ({ pattern: pattern.slug }));
}

export function GET(_request: Request, { params }: { params: { pattern: string } }) {
  const entry = getMicroservicePattern(params.pattern);
  if (!entry) return new Response(null, { status: 404 });
  const { pattern, group } = entry;
  const labels = pattern.diagram;
  const color = accents[group.id.split('').reduce((total, char) => total + char.charCodeAt(0), 0) % accents.length];

  let points: Point[];
  let edges: [number, number][];
  if (pattern.flow === 'split') {
    points = [{ x: 132, y: 160 }, { x: 430, y: 160 }, { x: 750, y: 89 }, { x: 750, y: 231 }];
    edges = [[0, 1], [1, 2], [1, 3]];
  } else if (pattern.flow === 'join') {
    points = [{ x: 190, y: 89 }, { x: 190, y: 231 }, { x: 702, y: 160 }];
    edges = [[0, 2], [1, 2]];
  } else {
    points = (labels.length === 4 ? [119, 339, 561, 781] : [146, 450, 754]).map(x => ({ x, y: 160 }));
    edges = points.slice(1).map((_, index) => [index, index + 1]);
  }

  return new ImageResponse(
    <div style={{
      width, height, display: 'flex', position: 'relative', background: '#0b1522',
      fontFamily: 'sans-serif',
    }}>
      {[40, 100, 160, 220, 280].map(y => (
        <div key={y} style={{ position: 'absolute', left: 30, right: 30, top: y, height: 1, background: '#18293a' }} />
      ))}
      {[60, 190, 320, 450, 580, 710, 840].map(x => (
        <div key={x} style={{ position: 'absolute', top: 25, bottom: 25, left: x, width: 1, background: '#18293a' }} />
      ))}
      <div style={{
        position: 'absolute', inset: 14, border: '1px solid #23384a', borderRadius: 18,
      }} />
      {edges.map(([from, to]) => (
        <div key={`${from}-${to}`} style={{ display: 'flex', position: 'absolute', inset: 0 }}>
          {connector(points[from], points[to], color)}
        </div>
      ))}
      {labels.map((label, index) => {
        const point = points[index];
        const featured = index === (pattern.flow === 'join' ? 2 : 1);
        return (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'absolute', left: point.x - boxWidth / 2, top: point.y - 48,
            width: boxWidth, height: 96, padding: 9,
            border: `2px solid ${featured ? color : '#415870'}`,
            borderRadius: 17, color: featured ? color : '#eef6ff', background: '#162537',
            fontSize: 25, fontWeight: 700, lineHeight: 1.08, textAlign: 'center',
          }}>
            {label}
          </div>
        );
      })}
    </div>,
    { width, height },
  );
}
