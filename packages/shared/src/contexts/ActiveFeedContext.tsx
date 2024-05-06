import { createContext } from 'react';
import { FeedReturnType } from '../hooks/useFeed';

export type ActiveFeedContextValue = {
  queryKey?: unknown[];
  items: FeedReturnType['items'];
  trackingOpts?: { columns: number; row: number; column: number };
};

export const ActiveFeedContext = createContext<ActiveFeedContextValue>({
  items: [],
});
