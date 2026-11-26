import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { canEditLocally } from '@/lib/local-blog-editor';
import { encodePostSlug, parsePostSlug } from '@/lib/post-url';

export const dynamic = 'force-dynamic';
export default function PreviousLocalEditorPage({ params }: { params: { slug: string[] } }) {
  const slug = parsePostSlug(params.slug);
  if (!slug || !canEditLocally(headers().get('host'))) notFound();
  redirect(`/blog/edit/${encodePostSlug(slug)}`);
}
