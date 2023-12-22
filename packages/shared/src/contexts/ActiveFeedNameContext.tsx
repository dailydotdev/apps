import { createContext } from 'react';
import { AllFeedPages } from '../lib/query';

export type ActiveFeedNameContextValue = {
  feedName?: AllFeedPages;
};

export const ActiveFeedNameContext = createContext<ActiveFeedNameContextValue>(
  {},
);
