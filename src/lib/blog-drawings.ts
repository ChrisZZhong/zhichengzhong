import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { encodePostSlug } from './post-url';
import type { PostMeta } from '@/types/post';

export const drawingIdPattern = /^[a-z0-9][a-z0-9-]{0,95}$/;
export const drawingSvgPolicy = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; sandbox";

export function getDrawingImageBase(post: Pick<PostMeta, 'slug' | 'protected'>) {
  const base = post.protected ? '/blog/diagrams' : '/media/diagrams';
  return `${base}/${encodePostSlug(post.slug)}/`;
}

export function readProtectedDrawing(slug: string, id: string) {
  if (!drawingIdPattern.test(id)) return null;
  const file = join(process.cwd(), 'diagrams', slug, `${id}.svg`);
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}
