import { createContext, useContext } from 'react';
import type { Post } from '../../graphql/posts';

type FeedCardContextData = {
  isBoostedReach: boolean;
  post: Partial<Post>;
};

export const FeedCardContext = createContext<FeedCardContextData>({
  isBoostedReach: false,
  post: {},
});

export const useFeedCardContext = () => useContext(FeedCardContext);
