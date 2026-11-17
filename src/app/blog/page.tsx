import { getAllPostsMeta, getAllTags } from '@/lib/posts';
import BlogPageClient from '@/components/BlogPageClient';

export const metadata = {
  title: 'Blog | Zhicheng Zhong',
  description: 'Technical blog posts on system design, distributed systems, and software engineering.',
};

interface Props {
  searchParams: { tag?: string | string[]; subcategory?: string | string[] };
}

export default function BlogPage({ searchParams }: Props) {
  const posts = getAllPostsMeta();
  const tags = getAllTags();
  const { tag, subcategory } = searchParams;
  const activeTag = typeof tag === 'string' && tags.includes(tag) ? tag : undefined;
  const activeSubcategory = activeTag && typeof subcategory === 'string' &&
    posts.some((post) => post.tag === activeTag && post.subcategory === subcategory)
    ? subcategory
    : undefined;

  return <BlogPageClient posts={posts} tags={tags} activeTag={activeTag} activeSubcategory={activeSubcategory} />;
}
