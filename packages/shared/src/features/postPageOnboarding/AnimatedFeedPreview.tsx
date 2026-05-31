import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import { FEED_BY_TAGS_QUERY, type FeedData } from '../../graphql/feed';
import { LazyImage } from '../../components/LazyImage';
import { UpvoteIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';

interface AnimatedFeedPreviewProps {
  tags: string[];
  currentPostId?: string;
  max?: number;
}

/**
 * A live, staggered preview of the feed the visitor would get — real posts
 * matching their topics streaming in one after another, so they literally
 * watch a feed assemble itself around what they're reading. This is the aha.
 */
export const AnimatedFeedPreview = ({
  tags,
  currentPostId,
  max = 3,
}: AnimatedFeedPreviewProps): ReactElement | null => {
  const { data, isPending } = useQuery({
    queryKey: ['anonFeedTaste', tags],
    queryFn: () =>
      gqlClient.request<FeedData>(FEED_BY_TAGS_QUERY, {
        tags,
        first: max + 1,
      }),
    enabled: tags.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const posts = useMemo(() => {
    const nodes = data?.page?.edges?.map((edge) => edge.node) ?? [];
    return nodes.filter((post) => post.id !== currentPostId).slice(0, max);
  }, [data, currentPostId, max]);

  if (tags.length === 0) {
    return null;
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-1">
        {Array.from({ length: max }).map((_, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            aria-busy
            className="flex items-center gap-2.5 p-2"
          >
            <ElementPlaceholder className="size-6 rounded-full" />
            <ElementPlaceholder className="h-3 flex-1 rounded-12" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {posts.map((post, index) => (
        <a
          key={post.id}
          href={post.commentsPermalink}
          className="flex animate-fade-slide-up items-center gap-2.5 rounded-12 p-2 hover:bg-surface-hover"
          style={{ animationDelay: `${index * 120}ms` }}
        >
          <LazyImage
            imgSrc={post.source?.image ?? ''}
            imgAlt={post.source?.name ?? ''}
            className="size-6 shrink-0 rounded-full"
          />
          <span className="line-clamp-1 min-w-0 flex-1 font-bold text-text-primary typo-footnote">
            {post.title}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-text-tertiary typo-caption1">
            <UpvoteIcon size={IconSize.Size16} />
            {post.numUpvotes ?? 0}
          </span>
        </a>
      ))}
    </div>
  );
};
