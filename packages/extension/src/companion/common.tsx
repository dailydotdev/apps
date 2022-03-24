import { Post } from '@dailydotdev/shared/src/graphql/posts';

export type PostBootData = Pick<
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
  data: {
    postByUrl: PostBootData;
  };
}
