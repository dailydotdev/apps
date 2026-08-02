import { createContext, useContext } from 'react';
import type { Author } from '../../graphql/comments';

interface FeedCardContextData {
  // a boosted post can surface organically, and we want to show the boosted label only if the post surfaced as an ad
  boostedBy?: Author;
  // set by single-source feeds: every card is from the same source, so showing
  // it on each one is repetition. Cards drop the source avatar and label.
  hideSource?: boolean;
  // drop the tag chips, and the row they sit on, from every card in the feed
  hideTags?: boolean;
}

export const FeedCardContext = createContext<FeedCardContextData>({});

export const useFeedCardContext = () => useContext(FeedCardContext);
