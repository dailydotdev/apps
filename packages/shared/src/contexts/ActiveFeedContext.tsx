import { createContext, useContext } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import type { FeedReturnType } from '../hooks/useFeed';
import type { Origin } from '../lib/log';

export type ActiveFeedContextValue = {
  queryKey?: QueryKey;
  items: FeedReturnType['items'];
  logOpts?: { columns: number; row: number; column: number };
  allowPin?: boolean;
  origin?: Origin;
  onRemovePost?: (postIndex: number) => void;
};

export const ActiveFeedContext = createContext<ActiveFeedContextValue>({
  items: [],
});

export const useActiveFeedContext = (): ActiveFeedContextValue =>
  useContext(ActiveFeedContext);
