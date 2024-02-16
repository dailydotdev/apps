import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { AllFeedPages } from '../lib/query';
import { usePrevious } from '../hooks/usePrevious';
import { useAuthContext } from './AuthContext';
import { getFeedName } from '../lib/feed';

export type ActiveFeedNameContextValue = {
  feedName?: AllFeedPages;
};

export const ActiveFeedNameContext = createContext<ActiveFeedNameContextValue>(
  {},
);

export interface ActiveFeedNameContextProviderProps {
  children?: ReactNode;
}

export const ActiveFeedNameContextProvider = ({
  children,
}: ActiveFeedNameContextProviderProps): ReactElement => {
  const router = useRouter();
  const { pathname } = router || {};
  const { user } = useAuthContext();
  const previousPathname = usePrevious(pathname);
  const previousUserId = usePrevious(user?.id);
  const [feedName, setFeedName] = useState<AllFeedPages>(
    getFeedName(pathname, { hasUser: !!user }),
  );

  useEffect(() => {
    if (pathname !== previousPathname || user?.id !== previousUserId) {
      const newFeedName = getFeedName(pathname, {
        hasUser: !!user,
      });
      if (newFeedName !== feedName) {
        setFeedName(newFeedName);
      }
    }
  }, [pathname, previousPathname, feedName, user, previousUserId]);

  const activeFeedNameContextValue = useMemo(() => ({ feedName }), [feedName]);
  return (
    <ActiveFeedNameContext.Provider value={activeFeedNameContextValue}>
      {children}
    </ActiveFeedNameContext.Provider>
  );
};

export const useActiveFeedNameContext = (): ActiveFeedNameContextValue =>
  useContext(ActiveFeedNameContext);
