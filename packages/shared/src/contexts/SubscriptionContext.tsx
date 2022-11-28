import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Client } from 'graphql-ws';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import ProgressiveEnhancementContext from './ProgressiveEnhancementContext';
import AuthContext from './AuthContext';

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

export const SubscriptionContextProvider = ({
  children,
}: SubscriptionContextProviderProps): ReactElement => {
  const { windowLoaded } = useContext(ProgressiveEnhancementContext);
  const { tokenRefreshed, accessToken } = useContext(AuthContext);

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

  const contextData = useMemo<SubscriptionContextData>(
    () => ({
      connected,
      subscriptionClient,
    }),
    [connected, subscriptionClient],
  );

  return (
    <SubscriptionContext.Provider value={contextData}>
      {children}
    </SubscriptionContext.Provider>
  );
};
