import type { LoggedUser } from '../../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { gqlClient } from '../../../graphql/common';
import type { FeedData, Post } from '../../../graphql/posts';
import { PREVIEW_FEED_QUERY } from '../../../graphql/feed';

/**
 * The posts the reader's feed would open with, on the tags they just picked:
 * the push preview shows the first, the goal's post stack their sources.
 */
export const feedPreviewPostsQueryOptions = (user?: LoggedUser) => ({
  queryKey: generateQueryKey(RequestKey.FeedPreview, user, 'posts'),
  queryFn: async (): Promise<Post[]> => {
    const { page } = await gqlClient.request<FeedData>(PREVIEW_FEED_QUERY, {
      loggedIn: !!user,
    });
    return page.edges.map(({ node }) => node);
  },
  staleTime: StaleTime.Default,
});
