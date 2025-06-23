import { createContext, useContext } from 'react';

interface FeedCardContextData {
  isBoostedReach: boolean;
}

export const FeedCardContext = createContext<FeedCardContextData>({
  isBoostedReach: false,
});

export const useFeedCardContext = (): FeedCardContextData =>
  useContext(FeedCardContext);
