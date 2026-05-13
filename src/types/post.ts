export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tag: string;
  pinned?: boolean;
}

export interface Post extends PostMeta {
  content: string;
}
