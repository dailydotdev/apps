import { useEffect, useRef } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import {
  updateTitleTranslation,
  useTranslation,
} from '@dailydotdev/shared/src/hooks/translation/useTranslation';
import type { FeedData, Post } from '@dailydotdev/shared/src/graphql/posts';

export type ExploreFeedSection = {
  data: FeedData | undefined;
  queryKey: QueryKey;
};

/**
 * Mirrors the smart-title fetching `useFeed` performs, but for the explore
 * page's single-page `FeedData` queries. Without this, post titles never get
 * replaced with the smart-shielded version, so clicking the Clickbait Shield
 * fetches the original title back into the cache and the visible title never
 * changes.
 */
export const useExploreFeedTranslations = (
  sections: ExploreFeedSection[],
): void => {
  const queryClient = useQueryClient();
  const { fetchTranslations } = useTranslation({ skipLanguageFilter: true });
  const inFlightRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    sections.forEach(({ data, queryKey }) => {
      const edges = data?.page?.edges ?? [];
      const postsToTranslate: Post[] = [];
      edges.forEach((edge) => {
        const node = edge?.node;
        if (
          !node?.id ||
          !node?.clickbaitTitleDetected ||
          !!node.translation?.smartTitle ||
          inFlightRef.current.has(node.id)
        ) {
          return;
        }
        postsToTranslate.push(node);
      });

      if (postsToTranslate.length === 0) {
        return;
      }

      postsToTranslate.forEach((post) => inFlightRef.current.add(post.id));

      (async () => {
        try {
          const results = await fetchTranslations(postsToTranslate);
          if (!results?.length) {
            return;
          }

          queryClient.setQueryData<FeedData>(queryKey, (oldData) => {
            if (!oldData?.page?.edges) {
              return oldData;
            }

            const updatedEdges = oldData.page.edges.map((edge) => {
              let updatedNode = edge.node;
              results.forEach((translation) => {
                if (translation.id !== updatedNode?.id) {
                  return;
                }
                updatedNode = updateTitleTranslation({
                  post: updatedNode,
                  translation,
                });
              });

              if (updatedNode === edge.node) {
                return edge;
              }

              return { ...edge, node: updatedNode };
            });

            return {
              ...oldData,
              page: { ...oldData.page, edges: updatedEdges },
            };
          });
        } finally {
          postsToTranslate.forEach((post) => inFlightRef.current.delete(post.id));
        }
      })();
    });
  }, [sections, queryClient, fetchTranslations]);
};
