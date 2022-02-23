export interface BootData {
  id: string;
  title: string;
  commentsPermalink: string;
  trending?: boolean;
  summary?: string;
  numUpvotes: number;
  upvoted?: boolean;
  numComments?: number;
  bookmarked?: boolean;
  source: {
    id: string;
    name: string;
    image?: string;
  };
}
export interface CompanionBootData {
  postCanonical: BootData;
}
