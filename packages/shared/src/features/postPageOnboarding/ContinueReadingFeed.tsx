import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import type { Post } from '../../graphql/posts';
import { gqlClient } from '../../graphql/common';
import { FEED_BY_TAGS_QUERY, type FeedData } from '../../graphql/feed';
import { capitalize } from '../../lib/strings';
import { LazyImage } from '../../components/LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { CardLink } from '../../components/cards/common/Card';
import { PostEngagementCounts } from '../../components/cards/SimilarPosts/PostEngagementCounts';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import InfiniteScrolling, {
  checkFetchMore,
} from '../../components/containers/InfiniteScrolling';
import { useAnonPostOnboarding } from './useAnonPostOnboarding';

const PAGE_SIZE = 10;

interface ContinueReadingFeedProps {
  post: Post;
}

const ContinueReadingItem = ({ post }: { post: Post }): ReactElement => (
  <article className="relative -mx-4 flex items-start gap-3 px-4 py-3 hover:bg-surface-hover">
    <CardLink href={post.commentsPermalink} title={post.title} />
    <LazyImage
      imgSrc={post.image}
      imgAlt={post.title ?? 'Post cover image'}
      className="h-16 w-24 shrink-0 rounded-12"
      fallbackSrc={cloudinaryPostImageCoverPlaceholder}
    />
    <div className="flex min-w-0 flex-1 flex-col">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        truncate
      >
        {post.source?.name}
      </Typography>
      <h5 className="multi-truncate mb-1 break-words font-bold text-text-primary typo-callout">
        {post.title}
      </h5>
      <PostEngagementCounts
        upvotes={post.numUpvotes ?? 0}
        comments={post.numComments ?? 0}
        className="text-text-tertiary"
      />
    </div>
  </article>
);

const ItemPlaceholder = (): ReactElement => (
  <article aria-busy className="-mx-4 flex items-start gap-3 px-4 py-3">
    <ElementPlaceholder className="h-16 w-24 shrink-0 rounded-12" />
    <div className="flex flex-1 flex-col gap-2">
      <ElementPlaceholder className="h-3 w-1/3 rounded-12" />
      <ElementPlaceholder className="h-3 w-4/5 rounded-12" />
      <ElementPlaceholder className="h-3 w-1/4 rounded-12" />
    </div>
  </article>
);

/**
 * An endless, personalized feed below the comments so an anonymous reader who
 * finishes the article and discussion keeps scrolling into more relevant dev
 * content instead of hitting a dead end. Seeded by the article's tags and
 * anonymous-safe.
 */
export const ContinueReadingFeed = ({
  post,
}: ContinueReadingFeedProps): ReactElement | null => {
  const { isEnabled } = useAnonPostOnboarding();
  const tags = useMemo(() => post?.tags ?? [], [post?.tags]);

  const query = useInfiniteQuery({
    queryKey: ['continueReading', post?.id, tags],
    queryFn: ({ pageParam }) =>
      gqlClient.request<FeedData>(FEED_BY_TAGS_QUERY, {
        tags,
        first: PAGE_SIZE,
        after: pageParam,
      }),
    initialPageParam: '',
    getNextPageParam: (lastPage) =>
      lastPage.page.pageInfo.hasNextPage
        ? lastPage.page.pageInfo.endCursor
        : undefined,
    enabled: isEnabled && tags.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const posts = useMemo(() => {
    const nodes =
      query.data?.pages.flatMap((page) =>
        page.page.edges.map((edge) => edge.node),
      ) ?? [];
    return nodes.filter((item) => item.id !== post?.id);
  }, [query.data, post?.id]);

  if (!isEnabled || tags.length === 0) {
    return null;
  }

  if (!query.isLoading && posts.length === 0) {
    return null;
  }

  const primary = tags[0] ? capitalize(tags[0]) : 'dev';

  return (
    <section className={classNames('mt-8 flex flex-col')}>
      <Typography bold type={TypographyType.Title3}>
        Keep reading
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mb-2"
      >
        More {primary} stories developers are reading right now
      </Typography>
      <InfiniteScrolling
        canFetchMore={checkFetchMore(query)}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
        placeholder={<ItemPlaceholder />}
      >
        {query.isLoading ? (
          <>
            <ItemPlaceholder />
            <ItemPlaceholder />
            <ItemPlaceholder />
          </>
        ) : (
          posts.map((item) => <ContinueReadingItem key={item.id} post={item} />)
        )}
      </InfiniteScrolling>
    </section>
  );
};
