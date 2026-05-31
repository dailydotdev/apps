import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SimilarPosts from '../../components/widgets/SimilarPosts';
import { gqlClient } from '../../graphql/common';
import { FEED_BY_TAGS_QUERY, type FeedData } from '../../graphql/feed';

const PREVIEW_SIZE = 6;
const INITIAL_VISIBLE = 2;

interface FeedTastePreviewProps {
  tags: string[];
  currentPostId?: string;
  title?: string;
}

/**
 * A live taste of the feed the visitor would get, seeded by the tags they're
 * following. It starts with a couple of posts and reveals more as the reader
 * scrolls — so the act of reading visibly assembles a feed around them. The
 * query is anonymous-safe (loggedIn defaults to false server-side).
 */
export const FeedTastePreview = ({
  tags,
  currentPostId,
  title = 'Your feed is forming',
}: FeedTastePreviewProps): ReactElement | null => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const { data, isPending } = useQuery({
    queryKey: ['anonFeedTaste', tags],
    queryFn: () =>
      gqlClient.request<FeedData>(FEED_BY_TAGS_QUERY, {
        tags,
        first: PREVIEW_SIZE,
      }),
    enabled: tags.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const posts = useMemo(() => {
    const nodes = data?.page?.edges?.map((edge) => edge.node) ?? [];
    return nodes.filter((post) => post.id !== currentPostId);
  }, [data, currentPostId]);

  // Reveal more posts as the reader scrolls — the feed "builds" around them.
  const revealRef = useRef(visibleCount);
  revealRef.current = visibleCount;
  useEffect(() => {
    if (typeof window === 'undefined' || posts.length <= INITIAL_VISIBLE) {
      return undefined;
    }
    const onScroll = () => {
      const { scrollY, innerHeight } = window;
      const docHeight = document.documentElement.scrollHeight;
      const progress =
        docHeight <= innerHeight ? 1 : (scrollY + innerHeight) / docHeight;
      const next = Math.min(
        posts.length,
        INITIAL_VISIBLE +
          Math.floor(progress * (posts.length - INITIAL_VISIBLE) * 1.5),
      );
      if (next > revealRef.current) {
        setVisibleCount(next);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [posts.length]);

  if (tags.length === 0) {
    return null;
  }

  if (!isPending && posts.length === 0) {
    return null;
  }

  return (
    <SimilarPosts
      title={title}
      posts={isPending ? null : posts.slice(0, visibleCount)}
      isLoading={isPending}
      moreButtonProps={{ text: 'Get the full feed' }}
    />
  );
};
