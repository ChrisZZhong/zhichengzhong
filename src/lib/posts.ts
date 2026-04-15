import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Post, PostMeta } from '@/types/post';

const postsDirectory = path.join(process.cwd(), '_posts');

function normalizeTag(raw: unknown): string {
  if (!raw) return 'Uncategorized';
  const s = String(raw).trim().replace(/^["']|["']$/g, '');
  return s || 'Uncategorized';
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith('.md') && !f.startsWith('.') && f !== 'demo.md')
    .map((f) => f.replace(/\.md$/, ''));
}

export function getAllPostsMeta(): PostMeta[] {
  const slugs = getAllPostSlugs();
  return slugs
    .map((slug) => {
      try {
        const fullPath = path.join(postsDirectory, `${slug}.md`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);
        return {
          slug,
          title: data.title || slug,
          date: data.date ? String(data.date).slice(0, 10) : '2020-01-01',
          description: data.description || '',
          tag: normalizeTag(data.tag),
        } as PostMeta;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as PostMeta[];
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    return {
      slug,
      title: data.title || slug,
      date: data.date ? String(data.date).slice(0, 10) : '2020-01-01',
      description: data.description || '',
      tag: normalizeTag(data.tag),
      content,
    };
  } catch {
    return null;
  }
}

export function getAllTags(): string[] {
  const posts = getAllPostsMeta();
  const tagSet = new Set(posts.map((p) => p.tag));
  return Array.from(tagSet).sort();
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPostsMeta()
    .filter((p) => p.tag === tag)
    .sort((a, b) => a.title.localeCompare(b.title));
}
