import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import type { AllFeedPages } from '../lib/query';
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
  const hasUser = !!user;
  const feedName = useMemo(
    () => getFeedName(pathname, { hasUser }),
    [pathname, hasUser],
  );

  const activeFeedNameContextValue = useMemo(() => ({ feedName }), [feedName]);
  return (
    <ActiveFeedNameContext.Provider value={activeFeedNameContextValue}>
      {children}
    </ActiveFeedNameContext.Provider>
  );
};

export const useActiveFeedNameContext = (): ActiveFeedNameContextValue =>
  useContext(ActiveFeedNameContext);
