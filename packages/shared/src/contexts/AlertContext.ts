import React from 'react';

export type Alerts = { filter?: boolean };

export const AlertDefaults: Alerts = {
  filter: true,
};

export interface AlertContextData {
  alerts: { filter?: boolean };
  setAlerts?: (alerts: Alerts) => Promise<void>;
}

const AlertContext = React.createContext<AlertContextData>(null);
export default AlertContext;
