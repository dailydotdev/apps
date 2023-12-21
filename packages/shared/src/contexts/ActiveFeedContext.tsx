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
  feedRef?: React.RefObject<HTMLDivElement>;
  onOpenModal?: (index: number) => void;
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
  onOpenModal,
}: ActiveFeedContextProviderProps): ReactElement => {
  const feedRef = useRef();

  const data: ActiveFeedContextValue = useMemo(
    () => ({
      items,
      queryKey,
      feedRef,
      onOpenModal,
    }),
    [items, queryKey, onOpenModal],
  );
  return (
    <ActiveFeedContext.Provider value={data}>
      {children}
    </ActiveFeedContext.Provider>
  );
};

export const useActiveFeedContext = (): ActiveFeedContextValue =>
  useContext(ActiveFeedContext);
