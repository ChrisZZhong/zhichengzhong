/** Encode path segments while preserving the category/article separator. */
export function encodePostSlug(slug: string): string {
  return slug.split('/').map(encodeURIComponent).join('/');
}

export function getPostHref(slug: string): string {
  return `/blog/${encodePostSlug(slug)}`;
}

export function parsePostSlug(parts: string[]): string | null {
  if (parts.length !== 2) return null;
  try {
    // Next.js 14 can return URL-encoded segments such as Java%26Spring.
    const decoded = parts.map(part => decodeURIComponent(part));
    if (decoded.some(part => !part || part.startsWith('.') || /[/\\\x00-\x1F\x7F]/.test(part))) return null;
    return decoded.join('/');
  } catch {
    return null;
  }
}

export function getBlogHref(tag?: string, subcategory?: string): string {
  if (!tag) return '/blog';
  const query = new URLSearchParams({ tag });
  if (subcategory) query.set('subcategory', subcategory);
  return `/blog?${query}`;
}
