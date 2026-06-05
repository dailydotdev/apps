import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { ErrorBoundary } from '../../../../components/ErrorBoundary';
import { ArticleGrid } from '../../../../components/cards/article/ArticleGrid';
import { ActiveFeedNameContext } from '../../../../contexts/ActiveFeedNameContext';
import { SharedFeedPage } from '../../../../components/utilities';
import { gqlClient } from '../../../../graphql/common';
import { MOST_UPVOTED_FEED_QUERY } from '../../../../graphql/feed';
import type { Post } from '../../../../graphql/posts';

// =============================================================
// Cards background — real daily.dev feed cards
// =============================================================

type FeedQueryResult = {
  page: { edges: Array<{ node: Post }> };
};

const noop = (): void => undefined;

const useExplorePosts = (): Post[] => {
  const { data } = useQuery({
    queryKey: ['onboarding-explore-feed'],
    queryFn: async () => {
      const res = await gqlClient.request<FeedQueryResult>(
        MOST_UPVOTED_FEED_QUERY,
        {
          first: 30,
          period: 7,
          loggedIn: false,
          supportedTypes: ['article', 'video:youtube'],
        },
      );
      return res.page.edges
        .map((edge) => edge.node)
        .filter((post): post is Post => !!post && !!post.id && !!post.title)
        .map((post) => ({ ...post, clickbaitTitleDetected: false }));
    },
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
  return data ?? [];
};

const ExplorePostCard = ({ post }: { post: Post }): ReactElement => (
  <ErrorBoundary fallback={null}>
    <ArticleGrid
      post={post}
      onPostClick={noop}
      onPostAuxClick={noop}
      onUpvoteClick={noop}
      onDownvoteClick={noop}
      onCommentClick={noop}
      onBookmarkClick={noop}
      onShare={noop}
      onCopyLinkClick={noop}
      onReadArticleClick={noop}
    />
  </ErrorBoundary>
);

export const CardsBackground = ({
  splitMode = false,
}: {
  splitMode?: boolean;
}): ReactElement => {
  const posts = useExplorePosts();
  const feedMaskClass = splitMode
    ? 'onb-split-grid-mask inset-0 -z-1'
    : 'onb-grid-mask inset-0 -z-1';

  return (
    <ActiveFeedNameContext.Provider
      value={{ feedName: SharedFeedPage.Popular }}
    >
      <div
        aria-hidden
        className={classNames(
          'pointer-events-none absolute select-none overflow-hidden opacity-[0.4] [&_*]:!pointer-events-none',
          feedMaskClass,
        )}
      >
        <div
          className={classNames(
            'grid auto-rows-min gap-8 px-10 pb-5 pt-10 tablet:px-14 tablet:pb-7 tablet:pt-14',
            splitMode
              ? 'grid-cols-2 laptop:grid-cols-2 laptopL:grid-cols-3'
              : 'grid-cols-2 laptop:grid-cols-3 laptopL:grid-cols-4 laptopXL:grid-cols-5 desktop:grid-cols-6',
          )}
        >
          {posts.map((post) => (
            <ExplorePostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </ActiveFeedNameContext.Provider>
  );
};
