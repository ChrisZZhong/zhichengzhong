import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Post, PostMeta } from '@/types/post';

const postsDirectory = path.join(process.cwd(), '_posts');

/** Sanitize a raw tag value (strip quotes, \r, leading/trailing spaces) */
function normalizeTag(raw: unknown): string {
  if (!raw) return 'Uncategorized';
  return String(raw)
    .replace(/\r/g, '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim() || 'Uncategorized';
}

/**
 * Walk _posts/<TagFolder>/*.md and return every { slug, tag, filePath }.
 * slug = "<TagFolder>/<filename-without-.md>"
 */
function walkPosts(): Array<{ slug: string; tag: string; filePath: string }> {
  if (!fs.existsSync(postsDirectory)) return [];

  const results: Array<{ slug: string; tag: string; filePath: string }> = [];

  const entries = fs.readdirSync(postsDirectory, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;                 // skip loose files at root
    const tagFolder = entry.name;
    const tagDir = path.join(postsDirectory, tagFolder);

    const files = fs.readdirSync(tagDir).filter(
      (f) => f.endsWith('.md') && !f.startsWith('.')
    );

    for (const file of files) {
      results.push({
        slug: `${tagFolder}/${file.replace(/\.md$/, '')}`,
        tag: tagFolder,
        filePath: path.join(tagDir, file),
      });
    }
  }

  return results;
}

export function getAllPostSlugs(): string[] {
  return walkPosts().map((p) => p.slug);
}

export function getAllPostsMeta(): PostMeta[] {
  return walkPosts()
    .map(({ slug, tag, filePath }) => {
      try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContents);
        return {
          slug,
          title: data.title || slug.split('/').pop() || slug,
          date: data.date ? String(data.date).slice(0, 10) : '2020-01-01',
          description: data.description || '',
          // Use folder name as canonical tag (already normalized by OS folder name)
          tag,
        } as PostMeta;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as PostMeta[];
}

export function getPostBySlug(slug: string): Post | null {
  // slug format: "<TagFolder>/<filename-without-.md>"
  try {
    const filePath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const tag = slug.split('/')[0];
    return {
      slug,
      title: data.title || slug.split('/').pop() || slug,
      date: data.date ? String(data.date).slice(0, 10) : '2020-01-01',
      description: data.description || '',
      tag,
      content,
    };
  } catch {
    return null;
  }
}

export function getAllTags(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs
    .readdirSync(postsDirectory, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPostsMeta()
    .filter((p) => p.tag === tag)
    .sort((a, b) => a.title.localeCompare(b.title));
}
