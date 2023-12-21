import { createContext } from 'react';
import { AllFeedPages } from '../lib/query';

export type ActiveFeedNameContextValue = {
  feedName?: AllFeedPages;
  setFeedName: (feedName: AllFeedPages) => void;
};

export const ActiveFeedNameContext = createContext<ActiveFeedNameContextValue>({
  setFeedName: () => {},
});
