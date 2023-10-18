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
  onClick?: (post: Post) => void;
  onBookmark?: (post: Post) => void;
  onUpvote?: (post: Post) => void;
  onDownvote?: (post: Post) => void;
  onHidePost?: (post: Post) => void;
  onPromotePost?: (post: Post) => void;
  onBanPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
  canDeletePost?: (post: Post) => boolean;
  canPinPost?: (post: Post) => boolean;
  onPinPost?: (post: Post) => void;
  onBlockSource?: (post: Post) => void;
  onBlockTag?: (post: Post, tag: string) => void;
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
  onClick,
  pinPost = true,
}: ActiveFeedContextProviderProps): ReactElement => {
  const feedRef = useRef();
  const virtualGrid =
    feedRef.current && getComputedStyle(feedRef.current).gridTemplateColumns;

  // TODO: determine tracking when lean post actions are invoked from a feed type
  const {
    onPromotePost,
    onBanPost,
    canDeletePost,
    onDeletePost,
    canPinPost,
    onPinPost,
    onBlockSource,
    onBlockTag,
    onClick: onClickDefault,
    onBookmark,
    onUpvote,
    onDownvote,
    onHidePost,
  } = useLeanPostActions({
    queryKey,
  });

  // console.log(virtualGrid);
  const data: ActiveFeedContextValue = useMemo(
    () => ({
      items,
      queryKey,
      onClick: onClick || onClickDefault,
      onBookmark,
      onUpvote,
      onDownvote,
      onHidePost,
      onPromotePost,
      onBanPost,
      canDeletePost,
      onDeletePost,
      canPinPost: pinPost && canPinPost,
      onPinPost,
      onBlockSource,
      onBlockTag,
      feedRef,
    }),
    [
      items,
      onClick,
      onBookmark,
      onUpvote,
      onDownvote,
      onHidePost,
      onPromotePost,
      onBanPost,
      canDeletePost,
      onDeletePost,
      canPinPost,
      onPinPost,
      onBlockSource,
      onBlockTag,
      queryKey,
    ],
  );
  return (
    <ActiveFeedContext.Provider value={data}>
      {children}
    </ActiveFeedContext.Provider>
  );
};

export const useActiveFeedContext = (): ActiveFeedContextValue =>
  useContext(ActiveFeedContext);
