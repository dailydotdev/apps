import { createContext } from 'react';
import { AllFeedPages } from '../lib/query';

export type ActiveFeedNameContextValue = {
  feedName?: AllFeedPages | string;
  setFeedName: (feedName: AllFeedPages | string) => void;
};

export const ActiveFeedNameContext = createContext<ActiveFeedNameContextValue>({
  setFeedName: () => {},
});
