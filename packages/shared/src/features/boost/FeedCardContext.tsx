import { createContext, useContext } from 'react';

type FeedCardContextData = {
  isBoostedReach: boolean;
};

export const FeedCardContext = createContext<FeedCardContextData>({
  isBoostedReach: false,
});

export const useFeedCardContext = () => useContext(FeedCardContext);
