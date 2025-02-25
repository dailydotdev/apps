import { useMemo } from 'react';
import type { Edge } from '../../graphql/common';
import type { Feed } from '../../graphql/feed';
import useCustomDefaultFeed from './useCustomDefaultFeed';

export type UseSortedFeedsProps = {
  edges?: Edge<Feed>[];
};

export type UseSortedFeeds = Edge<Feed>[];

export const useSortedFeeds = ({
  edges,
}: UseSortedFeedsProps): UseSortedFeeds => {
  const { defaultFeedId } = useCustomDefaultFeed();

  return useMemo(() => {
    if (!edges) {
      return [];
    }

    let sortedFeeds = [...edges];
    const defaultFeed = sortedFeeds.findIndex(
      (feed) => feed.node.id === defaultFeedId,
    );

    if (defaultFeed === -1) {
      return sortedFeeds;
    }

    sortedFeeds = [...sortedFeeds.splice(defaultFeed, 1), ...sortedFeeds];

    return sortedFeeds;
  }, [edges, defaultFeedId]);
};
