import React from 'react';
import { SubscriptionClient } from 'subscriptions-transport-ws';

export interface SubscriptionContextData {
  subscriptionClient: SubscriptionClient;
  connected: boolean;
}

const SubscriptionContext = React.createContext<SubscriptionContextData>({
  subscriptionClient: null,
  connected: false,
});
export default SubscriptionContext;
