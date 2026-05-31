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
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { useAnonPostOnboarding } from './useAnonPostOnboarding';
import { useAnonFeedTags } from './useAnonFeedTags';
import { FeedConversionBanner } from './FeedConversionBanner';

const PAGE_SIZE = 8;
const BANNER_AFTER = 2;

interface ContinueReadingFeedProps {
  post: Post;
}

const FeedCard = ({ post }: { post: Post }): ReactElement => (
  <article className="group relative flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary transition-colors hover:border-border-subtlest-primary">
    <CardLink href={post.commentsPermalink} title={post.title} />
    <LazyImage
      imgSrc={post.image}
      imgAlt={post.title ?? 'Post cover image'}
      className="h-36 w-full"
      fallbackSrc={cloudinaryPostImageCoverPlaceholder}
    />
    <div className="flex flex-1 flex-col gap-1 p-3">
      <div className="flex items-center gap-2">
        <LazyImage
          imgSrc={post.source?.image ?? ''}
          imgAlt={post.source?.name ?? ''}
          className="size-5 shrink-0 rounded-full"
        />
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          truncate
        >
          {post.source?.name}
        </Typography>
      </div>
      <h3 className="line-clamp-2 break-words font-bold text-text-primary typo-callout">
        {post.title}
      </h3>
      <PostEngagementCounts
        upvotes={post.numUpvotes ?? 0}
        comments={post.numComments ?? 0}
        className="mt-auto pt-1 text-text-tertiary"
      />
    </div>
  </article>
);

const CardPlaceholder = (): ReactElement => (
  <div
    aria-busy
    className="flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary"
  >
    <ElementPlaceholder className="h-36 w-full" />
    <div className="flex flex-col gap-2 p-3">
      <ElementPlaceholder className="h-3 w-1/3 rounded-12" />
      <ElementPlaceholder className="h-4 w-4/5 rounded-12" />
      <ElementPlaceholder className="h-3 w-1/4 rounded-12" />
    </div>
  </div>
);

/**
 * A visual, card-based "Keep reading" feed below the comments — turns the end
 * of the article into an addictive discovery grid of relevant dev content,
 * with a conversion banner woven in and an explicit "Load more" for
 * performance (no runaway auto-fetching).
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

      <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
        {query.isLoading ? (
          <>
            <CardPlaceholder />
            <CardPlaceholder />
            <CardPlaceholder />
            <CardPlaceholder />
          </>
        ) : (
          posts.map((item, index) => (
            <Fragment key={item.id}>
              <FeedCard post={item} />
              {index === BANNER_AFTER - 1 && (
                <div className="tablet:col-span-2">
                  <FeedConversionBanner tags={selectedTags} />
                </div>
              )}
            </Fragment>
          ))
        )}
      </div>

      {query.hasNextPage && (
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Medium}
          className="mt-5 self-center"
          loading={query.isFetchingNextPage}
          disabled={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
        >
          Load more articles
        </Button>
      )}
    </section>
  );
};
