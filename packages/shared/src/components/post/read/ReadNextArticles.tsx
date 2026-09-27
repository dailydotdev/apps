import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Post } from '../../../graphql/posts';
import type { FurtherReadingData } from '../../../graphql/furtherReading';
import { FURTHER_READING_QUERY } from '../../../graphql/furtherReading';
import { gqlClient } from '../../../graphql/common';
import { disabledRefetch } from '../../../lib/func';
import SimilarPosts from '../../widgets/SimilarPosts';
import { READ_ELIGIBLE_POST_TYPES } from './common';

const READ_NEXT_COUNT = 5;

const readNextQueryOptions = (post: Post) => ({
  queryKey: ['readNextArticles', post.id],
  queryFn: () =>
    gqlClient.request<FurtherReadingData>(FURTHER_READING_QUERY, {
      post: post.id,
      trendingFirst: 3,
      // Over-fetched: only the types /articles renders make the list.
      similarFirst: READ_NEXT_COUNT * 2,
      tags: post.tags ?? [],
    }),
  ...disabledRefetch,
});

interface ReadNextArticlesProps {
  post: Post;
  className?: string;
}

/**
 * The next /articles page for a reader who finished this one. Links carry
 * the posts' own permalinks, which the page rewrites to /articles.
 */
export function ReadNextArticles({
  post,
  className,
}: ReadNextArticlesProps): ReactElement | null {
  const { data, isLoading } = useQuery(readNextQueryOptions(post));
  const posts = useMemo(
    () =>
      [...(data?.trendingPosts ?? []), ...(data?.similarPosts ?? [])]
        .filter(
          (item) =>
            item.id !== post.id && READ_ELIGIBLE_POST_TYPES.has(item.type),
        )
        .slice(0, READ_NEXT_COUNT),
    [data, post.id],
  );

  if (!isLoading && !posts.length) {
    return null;
  }

  return (
    <SimilarPosts
      title="Read next"
      posts={posts}
      isLoading={isLoading}
      moreButtonProps={{ hidden: true }}
      className={className}
    />
  );
}
