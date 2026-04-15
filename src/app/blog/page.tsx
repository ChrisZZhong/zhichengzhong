import { getAllPostsMeta, getAllTags } from '@/lib/posts';
import BlogPageClient from '@/components/BlogPageClient';

export const metadata = {
  title: 'Blog | Zhicheng Zhong',
  description: 'Technical blog posts on system design, distributed systems, and software engineering.',
};

export default function BlogPage() {
  const posts = getAllPostsMeta();
  const tags = getAllTags();

  return <BlogPageClient posts={posts} tags={tags} />;
}
