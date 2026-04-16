'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, Tag, Search, BookOpen, ChevronRight, Hash } from 'lucide-react';
import type { PostMeta } from '@/types/post';

interface Props {
  posts: PostMeta[];
  tags: string[];
}

export default function BlogPageClient({ posts, tags }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    let result = posts;

    // Filter by tag
    if (activeTag) {
      result = result.filter((p) => p.tag === activeTag);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tag.toLowerCase().includes(q)
      );
    }

    // Sort alphabetically by title
    return [...result].sort((a, b) => a.title.localeCompare(b.title));
  }, [posts, activeTag, searchQuery]);

  // Group filtered posts by tag for the grouped view
  const groupedPosts = useMemo(() => {
    if (activeTag || searchQuery.trim()) return null; // flat view when filtered
    const groups: Record<string, PostMeta[]> = {};
    const sorted = [...posts].sort((a, b) => a.title.localeCompare(b.title));
    for (const post of sorted) {
      if (!groups[post.tag]) groups[post.tag] = [];
      groups[post.tag].push(post);
    }
    return groups;
  }, [posts, activeTag, searchQuery]);

  // Count per tag
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of posts) {
      counts[p.tag] = (counts[p.tag] || 0) + 1;
    }
    return counts;
  }, [posts]);

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Page header */}
      <div className="relative py-16 px-6 overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-space pointer-events-none" />
        <div
          className="absolute top-0 left-1/3 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div className="max-w-6xl mx-auto relative">
          <p className="text-xs font-mono font-semibold text-accent-cyan tracking-[0.2em] mb-3 uppercase">
            KNOWLEDGE BASE
          </p>
          <h1 className="text-4xl lg:text-5xl font-black text-text-primary mb-4">
            Blog <span className="gradient-text">Posts</span>
          </h1>
          <p className="text-text-muted text-lg max-w-xl">
            Notes on distributed systems, system design, algorithms, and software engineering.
          </p>
          <p className="text-text-muted text-sm mt-2 font-mono">
            {posts.length} posts across {tags.length} categories
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar ──────────────────────────────────────────── */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Search */}
            <div className="relative mb-6">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card-bg border border-card-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 focus:bg-space transition-all font-mono"
              />
            </div>

            {/* Tag list */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-text-muted text-xs font-semibold uppercase tracking-widest mb-4">
                <Hash size={12} />
                <span>Tags</span>
              </div>

              <button
                onClick={() => setActiveTag(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-all ${
                  activeTag === null
                    ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                    : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={13} />
                  All Posts
                </span>
                <span className="text-xs font-mono opacity-60">{posts.length}</span>
              </button>

              <div className="mt-2 space-y-0.5">
                {[...tags].sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0)).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTag === tag
                        ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20'
                        : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-left">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
                      <span className="truncate">{tag}</span>
                    </span>
                    <span className="text-xs font-mono opacity-60 flex-shrink-0">
                      {tagCounts[tag] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main Content ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Active filter indicator */}
            {(activeTag || searchQuery) && (
              <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-card-bg border border-card-border text-sm">
                <span className="text-text-muted">Showing</span>
                <span className="font-semibold text-accent-cyan">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
                </span>
                {activeTag && (
                  <span className="flex items-center gap-1 text-text-muted">
                    in <span className="tag-badge ml-1">{activeTag}</span>
                  </span>
                )}
                {searchQuery && (
                  <span className="text-text-muted">
                    matching &ldquo;<span className="text-text-primary">{searchQuery}</span>&rdquo;
                  </span>
                )}
                <button
                  onClick={() => { setActiveTag(null); setSearchQuery(''); }}
                  className="ml-auto text-xs text-text-muted hover:text-accent-cyan transition-colors"
                >
                  Clear ×
                </button>
              </div>
            )}

            {/* Flat/filtered view */}
            {(activeTag || searchQuery.trim()) && (
              <div className="space-y-2">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-16 text-text-muted">
                    <BookOpen size={32} className="mx-auto mb-4 opacity-30" />
                    <p>No posts found.</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => <PostRow key={post.slug} post={post} />)
                )}
              </div>
            )}

            {/* Grouped view (default) */}
            {!activeTag && !searchQuery.trim() && groupedPosts && (
              <div className="space-y-10">
                {Object.entries(groupedPosts)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([tag, tagPosts]) => (
                    <div key={tag}>
                      {/* Tag heading */}
                      <div className="flex items-center gap-3 mb-4">
                        <button
                          onClick={() => setActiveTag(tag)}
                          className="flex items-center gap-2 group"
                        >
                          <Tag size={14} className="text-accent-cyan" />
                          <h2 className="text-base font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                            {tag}
                          </h2>
                        </button>
                        <span className="text-xs font-mono text-text-muted">
                          {tagPosts.length} post{tagPosts.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex-1 h-px bg-card-border" />
                      </div>

                      {/* Posts in this tag */}
                      <div className="space-y-2">
                        {tagPosts.map((post) => <PostRow key={post.slug} post={post} />)}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Post Row Component ──────────────────────────────────────────────── */
function PostRow({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex items-center gap-4 p-4 rounded-xl glass-card group"
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-cyan transition-colors truncate">
          {post.title}
        </h3>
        {post.description && post.description !== post.title && (
          <p className="text-xs text-text-muted mt-0.5 truncate">{post.description}</p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="hidden sm:block tag-badge">{post.tag}</span>
        <span className="text-xs text-text-muted font-mono flex items-center gap-1">
          <Calendar size={10} />
          {post.date.slice(0, 7)}
        </span>
        <ChevronRight
          size={14}
          className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-accent-cyan transition-all"
        />
      </div>
    </Link>
  );
}
