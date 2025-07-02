import { createContext, useContext } from 'react';
import type { Post } from '../../graphql/posts';

type FeedCardContextData = {
  isBoostedReach: boolean;
  post?: Post;
};

export const FeedCardContext = createContext<FeedCardContextData>({
  isBoostedReach: false,
});

export const useFeedCardContext = () => useContext(FeedCardContext);
