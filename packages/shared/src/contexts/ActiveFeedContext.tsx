import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { FeedReturnType } from '../hooks/useFeed';

export type ActiveFeedContextValue = {
  queryKey?: unknown[];
  items: FeedReturnType['items'];
  onClick?: () => void;
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
}: ActiveFeedContextProviderProps): ReactElement => {
  const feedRef = useRef();
  const virtualGrid =
    feedRef.current && getComputedStyle(feedRef.current).gridTemplateColumns;
  console.log(virtualGrid);
  const data: ActiveFeedContextValue = useMemo(
    () => ({
      items,
      queryKey,
      onClick,
      feedRef,
    }),
    [items, onClick, queryKey],
  );
  return (
    <ActiveFeedContext.Provider value={data}>
      {children}
    </ActiveFeedContext.Provider>
  );
};

export const useActiveFeedContext = (): ActiveFeedContextValue =>
  useContext(ActiveFeedContext);
