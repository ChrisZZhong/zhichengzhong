import { getAllPostsMeta } from '@/lib/posts';
import HomeClient from '@/components/HomeClient';

export default function HomePage() {
  const allPosts = getAllPostsMeta();

  // Sort by date desc for "recent posts"
  const recentPosts = [...allPosts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  return <HomeClient recentPosts={recentPosts} />;
}
