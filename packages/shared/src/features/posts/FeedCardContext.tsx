import { createContext, useContext } from 'react';

interface FeedCardContextData {
  // a boosted post can surface organically, and we want to show the boosted label only if the post surfaced as an ad
  isBoostedAdPost: boolean;
}

export const FeedCardContext = createContext<FeedCardContextData>({
  isBoostedAdPost: false,
});

export const useFeedCardContext = () => useContext(FeedCardContext);
