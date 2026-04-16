import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPostSlugs, getPostBySlug, getAllPostsMeta } from '@/lib/posts';
import BlogPostContent from '@/components/BlogPostContent';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string[] };
}

// slug is e.g. ['System Design', '2025-04-15-system-design-url-shorterner']
function paramsToSlug(parts: string[]): string {
  return parts.join('/');
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  // Each slug is "TagFolder/filename" — split into array for [...slug]
  return slugs.map((slug) => ({ slug: slug.split('/') }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = paramsToSlug(params.slug);
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} | Zhicheng Zhong`,
    description: post.description || post.title,
  };
}

export default function BlogPostPage({ params }: Props) {
  const slug = paramsToSlug(params.slug);
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Prev / next within the same tag
  const allPosts = getAllPostsMeta()
    .filter((p) => p.tag === post.tag)
    .sort((a, b) => a.title.localeCompare(b.title));

  const currentIdx = allPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = currentIdx > 0 ? allPosts[currentIdx - 1] : null;
  const nextPost = currentIdx < allPosts.length - 1 ? allPosts[currentIdx + 1] : null;

  return (
    <div className="min-h-screen pt-16">
      {/* Back bar */}
      <div className="sticky top-16 z-40 bg-space/80 backdrop-blur-md border-b border-card-border px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-text-muted hover:text-accent-cyan transition-colors text-sm font-medium"
          >
            <ArrowLeft size={14} />
            Blog
          </Link>
          <span className="text-card-border">/</span>
          <span className="text-text-muted text-sm truncate">{post.title}</span>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Post header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <Link href={`/blog?tag=${encodeURIComponent(post.tag)}`}>
              <span className="tag-badge flex items-center gap-1">
                <Tag size={10} />
                {post.tag}
              </span>
            </Link>
            <span className="text-text-muted text-sm flex items-center gap-1 font-mono">
              <Calendar size={13} />
              {post.date}
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-text-primary leading-tight mb-4">
            {post.title}
          </h1>

          {post.description && post.description !== post.title && (
            <p className="text-lg text-text-muted">{post.description}</p>
          )}

          <div className="mt-6 h-px bg-gradient-to-r from-accent-cyan/30 via-accent-purple/20 to-transparent" />
        </header>

        {/* Content */}
        <BlogPostContent content={post.content} />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-card-border">
          <div className="mb-8">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">Filed under</p>
            <Link href="/blog">
              <span className="tag-badge">{post.tag}</span>
            </Link>
          </div>

          {/* Prev / Next */}
          {(prevPost || nextPost) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prevPost ? (
                <Link href={`/blog/${prevPost.slug}`} className="glass-card p-4 group">
                  <p className="text-xs text-text-muted mb-1">← Previous</p>
                  <p className="text-sm font-semibold text-text-primary group-hover:text-accent-cyan transition-colors line-clamp-2">
                    {prevPost.title}
                  </p>
                </Link>
              ) : <div />}
              {nextPost && (
                <Link href={`/blog/${nextPost.slug}`} className="glass-card p-4 text-right group">
                  <p className="text-xs text-text-muted mb-1">Next →</p>
                  <p className="text-sm font-semibold text-text-primary group-hover:text-accent-cyan transition-colors line-clamp-2">
                    {nextPost.title}
                  </p>
                </Link>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-card-border text-text-muted text-sm font-medium hover:border-accent-cyan/30 hover:text-accent-cyan transition-all"
            >
              <ArrowLeft size={14} />
              Back to All Posts
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
