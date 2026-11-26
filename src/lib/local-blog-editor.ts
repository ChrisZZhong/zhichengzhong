import { createHash, randomUUID } from 'node:crypto';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { getPostBySlug } from './posts';
import { encodePostSlug } from './post-url';
import { drawingIdPattern, getDrawingImageBase } from './blog-drawings';
import type { PostMeta } from '@/types/post';

export function canEditLocally(host: string | null) {
  return process.env.NODE_ENV === 'development' &&
    process.env.BLOG_LOCAL_EDITOR === '1' &&
    /^127\.0\.0\.1(?::\d{1,5})?$/.test(host ?? '');
}

export function getLocalEditorPaths(post: Pick<PostMeta, 'slug' | 'protected'>) {
  const slug = encodePostSlug(post.slug);
  return {
    editorHref: `/blog/edit/${slug}`,
    apiHref: `/blog/edit/api/${slug}`,
    imageBase: getDrawingImageBase(post),
  };
}

export function loadLocalPost(slug: string) {
  const post = getPostBySlug(slug);
  if (!post) return null;
  const file = join(process.cwd(), '_posts', `${slug}.md`);
  const raw = readFileSync(file, 'utf8');
  if (!raw.endsWith(post.content)) return null;
  return {
    post,
    file,
    header: raw.slice(0, raw.length - post.content.length),
    revision: createHash('sha256').update(raw).digest('hex'),
  };
}

export function readLocalDrawing(slug: string, id: string) {
  if (!drawingIdPattern.test(id)) return null;
  const file = join(process.cwd(), 'diagrams', slug, `${id}.excalidraw`);
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}

interface Drawing {
  id: string;
  scene: string;
  svg: string;
}

interface PostEdit {
  revision: string;
  content: string;
  drawings: Drawing[];
}

function isDrawing(value: unknown): value is Drawing {
  if (typeof value !== 'object' || value === null) return false;
  const { id, scene, svg } = value as Partial<Drawing>;
  if (typeof id !== 'string' || !drawingIdPattern.test(id) ||
      typeof scene !== 'string' || typeof svg !== 'string' || !/^<svg[\s>]/.test(svg)) return false;
  try {
    const data = JSON.parse(scene);
    return data?.type === 'excalidraw' && Array.isArray(data.elements) && data.elements.length > 0;
  } catch {
    return false;
  }
}

export function isPostEdit(value: unknown): value is PostEdit {
  if (typeof value !== 'object' || value === null) return false;
  const { revision, content, drawings } = value as Partial<PostEdit>;
  return typeof revision === 'string' && typeof content === 'string' &&
    Array.isArray(drawings) && drawings.every(isDrawing) &&
    new Set(drawings.map(({ id }) => id)).size === drawings.length;
}

export function saveLocalPost(current: NonNullable<ReturnType<typeof loadLocalPost>>, edit: PostEdit) {
  const { post, file, header } = current;
  const imageBase = getDrawingImageBase(post);
  const eol = header.includes('\r\n') ? '\r\n' : '\n';
  const content = edit.content.replace(/\r\n|\r|\n/g, eol);
  const next = header + content;
  const temporary = join(dirname(file), `.${randomUUID()}.tmp`);
  const created: string[] = [];

  try {
    for (const { id, scene, svg } of edit.drawings) {
      if (!content.includes(`${imageBase}${id}.svg`)) continue;
      const sourceDirectory = join(process.cwd(), 'diagrams', post.slug);
      const imageDirectory = post.protected
        ? sourceDirectory
        : join(process.cwd(), 'public', 'media', 'diagrams', post.slug);
      const exports = [
        [join(sourceDirectory, `${id}.excalidraw`), scene],
        [join(imageDirectory, `${id}.svg`), svg],
      ];
      for (const [destination, data] of exports) {
        mkdirSync(dirname(destination), { recursive: true });
        const fd = openSync(destination, 'wx');
        created.push(destination);
        try {
          writeFileSync(fd, data);
        } finally {
          closeSync(fd);
        }
      }
    }
    // Publish the Markdown last so it only points to complete drawings.
    writeFileSync(temporary, next, { flag: 'wx' });
    renameSync(temporary, file);
  } catch (error) {
    rmSync(temporary, { force: true });
    for (const destination of created) rmSync(destination, { force: true });
    throw error;
  }

  return { content, revision: createHash('sha256').update(next).digest('hex') };
}
