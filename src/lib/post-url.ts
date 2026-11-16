/** Encode path segments while preserving the category/article separator. */
export function getPostHref(slug: string): string {
  return `/blog/${slug.split('/').map(encodeURIComponent).join('/')}`;
}
