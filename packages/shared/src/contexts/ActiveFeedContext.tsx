import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { FeedReturnType } from '../hooks/useFeed';
import { Post } from '../graphql/posts';
import useLeanPostActions from '../hooks/post/useLeanPostActions';

export type ActiveFeedContextValue = {
  queryKey?: unknown[];
  pinPost?: boolean;
  items: FeedReturnType['items'];
  canPinPost?: (post: Post) => boolean;
  feedRef?: React.RefObject<HTMLDivElement>;
};

const ActiveFeedContext = React.createContext<ActiveFeedContextValue>({
  items: [],
});

export default ActiveFeedContext;

type ActiveFeedContextProviderProps = ActiveFeedContextValue & {
  children: ReactNode;
};

export const ActiveFeedContextProvider = ({
  children,
  items,
  queryKey,
  pinPost = true,
}: ActiveFeedContextProviderProps): ReactElement => {
  const feedRef = useRef();
  const virtualGrid =
    feedRef.current && getComputedStyle(feedRef.current).gridTemplateColumns;

  // TODO: determine tracking when lean post actions are invoked from a feed type
  const { canPinPost } = useLeanPostActions({
    queryKey,
  });

  // console.log(virtualGrid);
  const data: ActiveFeedContextValue = useMemo(
    () => ({
      items,
      queryKey,
      canPinPost: pinPost && canPinPost,
      feedRef,
    }),
    [items, canPinPost, queryKey, pinPost],
  );
  return (
    <ActiveFeedContext.Provider value={data}>
      {children}
    </ActiveFeedContext.Provider>
  );
};

export const useActiveFeedContext = (): ActiveFeedContextValue =>
  useContext(ActiveFeedContext);
