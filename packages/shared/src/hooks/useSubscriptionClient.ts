import { SubscriptionContextData } from '../contexts/SubscriptionContext';
import { useEffect, useState } from 'react';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';

export default function useSubscriptionClient(
  ready: boolean,
): SubscriptionContextData {
  const [connected, setConnected] = useState(false);
  const [
    subscriptionClient,
    setSubscriptionClient,
  ] = useState<SubscriptionClient>(null);

  useEffect(() => {
    if (ready) {
      requestIdleCallback(() => {
        import(
          /* webpackChunkName: "subscriptions" */ '../../../webapp/graphql/subscriptions'
        ).then(({ subscriptionClient }) => {
          setSubscriptionClient(subscriptionClient);
          subscriptionClient.onConnected(() => setConnected(true));
        });
      });
    }
  }, [ready]);

  return {
    connected,
    subscriptionClient,
  };
}
