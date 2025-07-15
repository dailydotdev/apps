import { createContext, useContext } from 'react';
import type { Author } from '../../graphql/comments';

interface FeedCardContextData {
  // a boosted post can surface organically, and we want to show the boosted label only if the post surfaced as an ad
  boostedBy?: Author;
}

export const FeedCardContext = createContext<FeedCardContextData>({});

export const useFeedCardContext = () => useContext(FeedCardContext);
