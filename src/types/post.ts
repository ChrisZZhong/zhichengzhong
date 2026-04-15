export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tag: string;
}

export interface Post extends PostMeta {
  content: string;
}
