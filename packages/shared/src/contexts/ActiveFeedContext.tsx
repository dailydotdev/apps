import { createContext } from 'react';
import { FeedReturnType } from '../hooks/useFeed';
import { AllFeedPages } from '../lib/query';

export type ActiveFeedContextValue = {
  feedName?: AllFeedPages;
  queryKey?: unknown[];
  items: FeedReturnType['items'];
};

export const ActiveFeedContext = createContext<ActiveFeedContextValue>({
  items: [],
});
