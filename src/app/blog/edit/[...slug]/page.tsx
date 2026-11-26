import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import LocalBlogEditor from '@/components/LocalBlogEditor';
import PasswordGate from '@/components/PasswordGate';
import { accessCookie, passwordSalt, validAccessProof } from '@/lib/blog-access';
import { canEditLocally, getLocalEditorPaths, loadLocalPost } from '@/lib/local-blog-editor';
import { getPostHref, parsePostSlug } from '@/lib/post-url';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Local Blog Editor', robots: { index: false } };

export default function LocalEditorPage({ params }: { params: { slug: string[] } }) {
  const slug = parsePostSlug(params.slug);
  if (!slug || !canEditLocally(headers().get('host'))) notFound();
  const current = loadLocalPost(slug);
  if (!current) notFound();
  const postHref = getPostHref(slug);

  if (!validAccessProof(cookies().get(accessCookie)?.value)) {
    return (
      <section className="mx-auto max-w-3xl px-6 pb-12 pt-24">
        <Link href={postHref} className="text-sm text-text-muted hover:text-text-primary">← Back to article</Link>
        <h1 className="mb-6 mt-3 text-2xl font-bold">Unlock local editing</h1>
        <PasswordGate salt={passwordSalt} forEditing />
      </section>
    );
  }

  const { apiHref, imageBase } = getLocalEditorPaths(current.post);
  return <LocalBlogEditor
    title={current.post.title}
    slug={slug}
    postHref={postHref}
    apiHref={apiHref}
    imageBase={imageBase}
    initialContent={current.post.content}
    initialRevision={current.revision}
  />;
}
