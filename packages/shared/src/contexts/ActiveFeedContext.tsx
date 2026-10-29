import { createContext, useContext } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import type { FeedReturnType } from '../hooks/useFeed';
import type { Origin } from '../lib/log';
import type { FeedPostExplanationRequest } from '../features/feedExplain/graphql';

export type ActiveFeedContextValue = {
  queryKey?: QueryKey;
  items: FeedReturnType['items'];
  logOpts?: {
    columns: number;
    row?: number;
    column?: number;
    is_ad?: boolean;
  };
  allowPin?: boolean;
  origin?: Origin;
  onRemovePost?: (postIndex: number) => void;
  /** Where For You's posts can be explained on request: a post's request. */
  getExplainRequest?: (
    postId: string,
  ) => FeedPostExplanationRequest | undefined;
};

export const ActiveFeedContext = createContext<ActiveFeedContextValue>({
  items: [],
});

export const useActiveFeedContext = (): ActiveFeedContextValue =>
  useContext(ActiveFeedContext);
