import { createContext } from 'react';
import { FeedReturnType } from '../hooks/useFeed';

export type ActiveFeedContextValue = {
  queryKey?: unknown[];
  items: FeedReturnType['items'];
};

export const ActiveFeedContext = createContext<ActiveFeedContextValue>({
  items: [],
});
