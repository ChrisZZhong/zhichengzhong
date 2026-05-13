import { getAllPostsMeta } from '@/lib/posts';
import HomeClient from '@/components/HomeClient';

export default function HomePage() {
  const allPosts = getAllPostsMeta();

  // Pinned first, then by date desc
  const recentPosts = [...allPosts]
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.date.localeCompare(a.date);
    })
    .slice(0, 6);

  return <HomeClient recentPosts={recentPosts} />;
}
