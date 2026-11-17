/** Encode path segments while preserving the category/article separator. */
export function getPostHref(slug: string): string {
  return `/blog/${slug.split('/').map(encodeURIComponent).join('/')}`;
}

export function getBlogHref(tag?: string, subcategory?: string): string {
  if (!tag) return '/blog';
  const query = new URLSearchParams({ tag });
  if (subcategory) query.set('subcategory', subcategory);
  return `/blog?${query}`;
}
