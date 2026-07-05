import type { Post } from '../../../graphql/posts';
import { TRENDS_SOURCE_ID } from '../../../lib/utils';

export const isTrendsPost = (post: Pick<Post, 'source'>): boolean =>
  post.source?.id === TRENDS_SOURCE_ID;

export const getCollectionPillLabel = (post: Pick<Post, 'source'>): string =>
  isTrendsPost(post) ? 'Trend' : 'Collection';
