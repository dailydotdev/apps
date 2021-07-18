import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import ProgressiveEnhancementContext from './ProgressiveEnhancementContext';
import AuthContext from './AuthContext';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';

export interface SubscriptionContextData {
  subscriptionClient: SubscriptionClient;
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
  const { tokenRefreshed } = useContext(AuthContext);

  const [connected, setConnected] = useState(false);
  const [subscriptionClient, setSubscriptionClient] =
    useState<SubscriptionClient>(null);

  useEffect(() => {
    if (windowLoaded && tokenRefreshed) {
      requestIdleCallback(() => {
        import(
          /* webpackChunkName: "subscriptions" */ '../graphql/subscriptions'
        ).then(({ subscriptionClient }) => {
          setSubscriptionClient(subscriptionClient);
          subscriptionClient.onConnected(() => setConnected(true));
        });
      });
    }
  }, [windowLoaded, tokenRefreshed]);

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
