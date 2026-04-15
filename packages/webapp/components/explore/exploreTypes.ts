import type { Post } from '@dailydotdev/shared/src/graphql/posts';

export type ExploreStory = Pick<
  Post,
  | 'id'
  | 'bookmarked'
  | 'bookmark'
  | 'commented'
  | 'title'
  | 'summary'
  | 'type'
  | 'flags'
  | 'sharedPost'
  | 'author'
  | 'scout'
  | 'commentsPermalink'
  | 'createdAt'
  | 'creatorTwitter'
  | 'creatorTwitterImage'
  | 'creatorTwitterName'
  | 'readTime'
  | 'image'
  | 'source'
  | 'collectionSources'
  | 'numComments'
  | 'numUpvotes'
  | 'userState'
>;
