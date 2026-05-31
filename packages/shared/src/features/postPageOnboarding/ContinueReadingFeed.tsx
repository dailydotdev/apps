import type { ReactElement } from 'react';
import React, { Fragment, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
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
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { Loader } from '../../components/Loader';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { useAnonPostOnboarding } from './useAnonPostOnboarding';
import { useAnonFeedTags } from './useAnonFeedTags';
import { FeedConversionBanner } from './FeedConversionBanner';

const PAGE_SIZE = 7;
const BANNER_AFTER = 3;

interface ContinueReadingFeedProps {
  post: Post;
}

const ContinueReadingItem = ({ post }: { post: Post }): ReactElement => (
  <article className="relative flex items-start gap-4 rounded-16 p-3 hover:bg-surface-hover">
    <CardLink href={post.commentsPermalink} title={post.title} />
    <LazyImage
      imgSrc={post.image}
      imgAlt={post.title ?? 'Post cover image'}
      className="h-20 w-32 shrink-0 rounded-12"
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
      <h3 className="multi-truncate mb-1 break-words font-bold text-text-primary typo-body">
        {post.title}
      </h3>
      <PostEngagementCounts
        upvotes={post.numUpvotes ?? 0}
        comments={post.numComments ?? 0}
        className="text-text-tertiary"
      />
    </div>
  </article>
);

const ItemPlaceholder = (): ReactElement => (
  <article aria-busy className="flex items-start gap-4 p-3">
    <ElementPlaceholder className="h-20 w-32 shrink-0 rounded-12" />
    <div className="flex flex-1 flex-col gap-2">
      <ElementPlaceholder className="h-3 w-1/3 rounded-12" />
      <ElementPlaceholder className="h-4 w-4/5 rounded-12" />
      <ElementPlaceholder className="h-3 w-1/4 rounded-12" />
    </div>
  </article>
);

/**
 * A personalized "Keep reading" feed below the comments so an anonymous reader
 * who finishes the article keeps discovering relevant dev content. Loads in
 * pages via an explicit "Load more" button (cheaper than auto infinite scroll)
 * and weaves a conversion banner into the flow.
 */
export const ContinueReadingFeed = ({
  post,
}: ContinueReadingFeedProps): ReactElement | null => {
  const { isEnabled } = useAnonPostOnboarding();
  const { previewTags, selectedTags } = useAnonFeedTags({
    postTags: post?.tags ?? [],
    enabled: isEnabled,
  });

  const query = useInfiniteQuery({
    queryKey: ['continueReading', post?.id, previewTags],
    queryFn: ({ pageParam }) =>
      gqlClient.request<FeedData>(FEED_BY_TAGS_QUERY, {
        tags: previewTags,
        first: PAGE_SIZE,
        after: pageParam || undefined,
      }),
    initialPageParam: '',
    getNextPageParam: (lastPage) =>
      lastPage.page.pageInfo.hasNextPage
        ? lastPage.page.pageInfo.endCursor
        : undefined,
    enabled: isEnabled && previewTags.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const posts = useMemo(() => {
    const nodes =
      query.data?.pages.flatMap((page) =>
        page.page.edges.map((edge) => edge.node),
      ) ?? [];
    return nodes.filter((item) => item.id !== post?.id);
  }, [query.data, post?.id]);

  if (!isEnabled || previewTags.length === 0) {
    return null;
  }

  if (!query.isLoading && posts.length === 0) {
    return null;
  }

  const primary = previewTags[0] ? capitalize(previewTags[0]) : 'dev';

  return (
    <section className="mt-8 flex flex-col">
      <Typography bold type={TypographyType.Title3}>
        Keep reading
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mb-3"
      >
        More {primary} stories developers are reading right now
      </Typography>

      <div className="flex flex-col gap-1">
        {query.isLoading ? (
          <>
            <ItemPlaceholder />
            <ItemPlaceholder />
            <ItemPlaceholder />
          </>
        ) : (
          posts.map((item, index) => (
            <Fragment key={item.id}>
              <ContinueReadingItem post={item} />
              {index === BANNER_AFTER - 1 && (
                <FeedConversionBanner tags={selectedTags} />
              )}
            </Fragment>
          ))
        )}
      </div>

      {query.hasNextPage && (
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Medium}
          className="mt-4 self-center"
          loading={query.isFetchingNextPage}
          disabled={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
        >
          {query.isFetchingNextPage ? <Loader /> : 'Load more articles'}
        </Button>
      )}
    </section>
  );
};
