import { canEditLocally, isPostEdit, loadLocalPost, readLocalDrawing, saveLocalPost } from '@/lib/local-blog-editor';
import { cookies } from 'next/headers';
import { accessCookie, validAccessProof } from '@/lib/blog-access';
import { parsePostSlug } from '@/lib/post-url';

interface Context {
  params: { slug: string[] };
}

export const dynamic = 'force-dynamic';

export function GET(request: Request, { params }: Context) {
  const slug = parsePostSlug(params.slug);
  if (!slug || !canEditLocally(request.headers.get('host'))) return new Response(null, { status: 404 });
  if (!validAccessProof(cookies().get(accessCookie)?.value)) return new Response(null, { status: 401 });
  if (!loadLocalPost(slug)) return new Response(null, { status: 404 });

  const id = new URL(request.url).searchParams.get('drawing');
  const scene = id && readLocalDrawing(slug, id);
  if (!scene) return new Response(null, { status: 404 });
  return new Response(scene, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request, { params }: Context) {
  const slug = parsePostSlug(params.slug);
  const host = request.headers.get('host');
  if (!slug || !canEditLocally(host)) return new Response(null, { status: 404 });
  if (request.headers.get('origin') !== `http://${host}`) {
    return Response.json({ error: 'Save from the local editor page.' }, { status: 403 });
  }
  if (!validAccessProof(cookies().get(accessCookie)?.value)) {
    return Response.json({ error: 'Unlock local editing before saving.' }, { status: 401 });
  }

  const edit: unknown = await request.json().catch(() => null);
  if (!isPostEdit(edit)) return Response.json({ error: 'Invalid post or drawing data.' }, { status: 400 });

  const current = loadLocalPost(slug);
  if (!current) return new Response(null, { status: 404 });
  if (current.revision !== edit.revision) {
    return Response.json({ error: 'The file changed on disk. Copy any unsaved edits, then reload the editor.' }, { status: 409 });
  }

  try {
    return Response.json(saveLocalPost(current, edit));
  } catch (error) {
    console.error('Could not save local blog post:', error);
    return Response.json({ error: 'Could not save the files in this workspace.' }, { status: 500 });
  }
}
