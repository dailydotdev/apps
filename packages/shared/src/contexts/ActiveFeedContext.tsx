import { createContext, useContext } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import type { FeedReturnType } from '../hooks/useFeed';

export type ActiveFeedContextValue = {
  queryKey?: QueryKey;
  items: FeedReturnType['items'];
  logOpts?: { columns: number; row: number; column: number };
};

export const ActiveFeedContext = createContext<ActiveFeedContextValue>({
  items: [],
});

export const useActiveFeedContext = (): ActiveFeedContextValue =>
  useContext(ActiveFeedContext);
