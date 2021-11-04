import React from 'react';
import { Alerts } from '../graphql/alerts';

export const ALERT_DEFAULTS: Alerts = {
  filter: false,
};

export interface AlertContextData {
  alerts: { filter?: boolean };
  setAlerts?: (alerts: Alerts) => Promise<void>;
}

const AlertContext = React.createContext<AlertContextData>({
  alerts: ALERT_DEFAULTS,
});
export default AlertContext;
