import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import SimilarPosts from '../../components/widgets/SimilarPosts';
import { gqlClient } from '../../graphql/common';
import { FEED_BY_TAGS_QUERY, type FeedData } from '../../graphql/feed';

interface FeedTastePreviewProps {
  tags: string[];
  currentPostId?: string;
  title?: string;
  maxItems?: number;
}

/**
 * A compact, static taste of the feed the visitor would get, seeded by the
 * tags they're following. Fixed count (no scroll-reveal) so it never shifts
 * the sticky sidebar — the endless "keep reading" experience lives in the
 * main column instead.
 */
export const FeedTastePreview = ({
  tags,
  currentPostId,
  title = 'Your feed is forming',
  maxItems = 3,
}: FeedTastePreviewProps): ReactElement | null => {
  const { data, isPending } = useQuery({
    queryKey: ['anonFeedTaste', tags],
    queryFn: () =>
      gqlClient.request<FeedData>(FEED_BY_TAGS_QUERY, {
        tags,
        first: maxItems + 1,
      }),
    enabled: tags.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const posts = useMemo(() => {
    const nodes = data?.page?.edges?.map((edge) => edge.node) ?? [];
    return nodes.filter((post) => post.id !== currentPostId).slice(0, maxItems);
  }, [data, currentPostId, maxItems]);

  if (tags.length === 0) {
    return null;
  }

  if (!isPending && posts.length === 0) {
    return null;
  }

  return (
    <SimilarPosts
      title={title}
      posts={isPending ? null : posts}
      isLoading={isPending}
      moreButtonProps={{ text: 'Get the full feed' }}
    />
  );
};
