import { createContext } from 'react';
import { FeedReturnType } from '../hooks/useFeed';
import { AllFeedPages } from '../lib/query';

export type ActiveFeedContextValue = {
  queryKey?: unknown[];
  items: FeedReturnType['items'];
  feedName?: AllFeedPages;
};

export const ActiveFeedContext = createContext<ActiveFeedContextValue>({
  items: [],
});
