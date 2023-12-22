import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { AllFeedPages } from '../lib/query';
import { usePrevious } from '../hooks';
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
  const [feedName, setFeedName] = useState<AllFeedPages>(
    getFeedName(pathname, { hasUser: !!user }),
  );

  useEffect(() => {
    if (pathname !== previousPathname) {
      const newFeedName = getFeedName(pathname, {
        hasUser: !!user,
      });
      if (newFeedName !== feedName) {
        setFeedName(newFeedName);
      }
    }
  }, [pathname, previousPathname, feedName, user]);
  return (
    <ActiveFeedNameContext.Provider value={{ feedName }}>
      {children}
    </ActiveFeedNameContext.Provider>
  );
};

export const useActiveFeedNameContext = (): ActiveFeedNameContextValue =>
  useContext(ActiveFeedNameContext);
