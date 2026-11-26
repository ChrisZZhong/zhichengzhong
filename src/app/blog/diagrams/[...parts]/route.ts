import { cookies } from 'next/headers';
import { accessCookie, validAccessProof } from '@/lib/blog-access';
import { drawingSvgPolicy, readProtectedDrawing } from '@/lib/blog-drawings';
import { getPostBySlug } from '@/lib/posts';
import { parsePostSlug } from '@/lib/post-url';

export const dynamic = 'force-dynamic';

export function GET(_request: Request, { params }: { params: { parts: string[] } }) {
  const [category, article, file] = params.parts;
  if (params.parts.length !== 3 || !file.endsWith('.svg') ||
      !validAccessProof(cookies().get(accessCookie)?.value)) {
    return new Response(null, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
  }
  const slug = parsePostSlug([category, article]);
  const svg = slug && getPostBySlug(slug)?.protected && readProtectedDrawing(slug, file.slice(0, -4));
  return new Response(svg || null, {
    status: svg ? 200 : 404,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Content-Security-Policy': drawingSvgPolicy,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
