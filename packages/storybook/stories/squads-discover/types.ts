export interface RawCategory {
  id: string;
  slug: string;
  title: string;
}

export interface RawSquad {
  id: string;
  name: string;
  handle: string;
  image: string;
  headerImage: string | null;
  description: string;
  membersCount: number;
  color: string | null;
  featured: boolean;
  totalPosts: number;
  category: string | null;
  verified: boolean;
}
