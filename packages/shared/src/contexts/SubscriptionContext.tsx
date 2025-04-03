'use client';

import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import type { Client } from 'graphql-ws';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import { useQuery } from '@tanstack/react-query';
import ProgressiveEnhancementContext from './ProgressiveEnhancementContext';
import AuthContext from './AuthContext';
import { appBootDataQuery } from '../lib/boot';

export interface SubscriptionContextData {
  subscriptionClient: Client;
  connected: boolean;
}

const SubscriptionContext = React.createContext<SubscriptionContextData>({
  subscriptionClient: null,
  connected: false,
});
export default SubscriptionContext;

export type SubscriptionContextProviderProps = {
  children?: ReactNode;
};

const useSubscriptionContext = ({
  tokenRefreshed,
  accessToken,
}: {
  tokenRefreshed: boolean;
  accessToken: { token: string };
}): SubscriptionContextData => {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const [connected, setConnected] = useState(false);
  const [subscriptionClient, setSubscriptionClient] = useState<Client>(null);

  useEffect(() => {
    if (windowLoaded && tokenRefreshed && !subscriptionClient) {
      requestIdleCallback(() => {
        import(
          /* webpackChunkName: "subscriptions" */ '../graphql/subscriptions'
        ).then(({ createSubscriptionClient }) => {
          const client = createSubscriptionClient(accessToken?.token);
          setSubscriptionClient(client);
          client.on('connected', () => setConnected(true));
        });
      });
    }
  }, [windowLoaded, tokenRefreshed, accessToken, subscriptionClient]);

  return useMemo<SubscriptionContextData>(
    () => ({
      connected,
      subscriptionClient,
    }),
    [connected, subscriptionClient],
  );
};

export const AppSubscriptionContextProvider = ({
  children,
}: SubscriptionContextProviderProps): ReactElement => {
  const { data: boot, dataUpdatedAt } = useQuery(appBootDataQuery);
  const tokenRefreshed = dataUpdatedAt > 0;
  const accessToken = boot?.accessToken;
  const contextData = useSubscriptionContext({
    tokenRefreshed,
    accessToken,
  });
  return (
    <SubscriptionContext.Provider value={contextData}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const SubscriptionContextProvider = ({
  children,
}: SubscriptionContextProviderProps): ReactElement => {
  const { tokenRefreshed, accessToken } = useContext(AuthContext);
  const contextData = useSubscriptionContext({
    tokenRefreshed,
    accessToken,
  });
  return (
    <SubscriptionContext.Provider value={contextData}>
      {children}
    </SubscriptionContext.Provider>
  );
};
