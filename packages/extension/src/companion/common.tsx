import { Post } from '@dailydotdev/shared/src/graphql/posts';

export type BootData = Pick<
  Post,
  | 'id'
  | 'title'
  | 'commentsPermalink'
  | 'trending'
  | 'summary'
  | 'numUpvotes'
  | 'upvoted'
  | 'numComments'
  | 'bookmarked'
  | 'source'
>;
export interface CompanionBootData {
  postCanonical: BootData;
}
