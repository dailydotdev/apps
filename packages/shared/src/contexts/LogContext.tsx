import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useRef, useContext } from 'react';
import type { LogEvent } from '../hooks/log/useLogQueue';
import useLogQueue from '../hooks/log/useLogQueue';
import useLogSharedProps from '../hooks/log/useLogSharedProps';
import type { LogContextData } from '../hooks/log/useLogContextData';
import useLogContextData from '../hooks/log/useLogContextData';
import useBackfillPendingLogs from '../hooks/log/useBackfillPendingLogs';
import useLogLifecycleEvents from '../hooks/log/useLogLifecycleEvents';
import type { BootApp } from '../lib/boot';

const LogContext = createContext<LogContextData>({
  logEvent: () => {},
  logEventStart: () => {},
  logEventEnd: () => {},
  sendBeacon: () => {},
});
export default LogContext;

export type LogContextProviderProps = {
  app: BootApp;
  getPage: () => string;
  version?: string;
  fetchMethod?: typeof fetch;
  backgroundMethod?: (msg: unknown) => Promise<unknown>;
  deviceId?: string;
  children?: ReactNode;
};

export const LogContextProvider = ({
  app,
  version,
  children,
  fetchMethod = fetch,
  backgroundMethod,
  deviceId,
  getPage,
}: LogContextProviderProps): ReactElement => {
  const { pushToQueue, setEnabled, queueRef, sendBeacon } = useLogQueue({
    fetchMethod,
    backgroundMethod,
  });
  const [sharedPropsRef, sharedPropsSet] = useLogSharedProps(
    app,
    version,
    deviceId,
  );
  const durationEventsQueue = useRef<Map<string, LogEvent>>(new Map());
  const contextData = useLogContextData(
    pushToQueue,
    sharedPropsRef,
    getPage,
    durationEventsQueue,
    sendBeacon,
  );
  useBackfillPendingLogs(
    sharedPropsRef,
    sharedPropsSet,
    queueRef,
    durationEventsQueue,
    setEnabled,
  );
  useLogLifecycleEvents(
    setEnabled,
    contextData,
    durationEventsQueue,
    sendBeacon,
  );

  return (
    <LogContext.Provider value={contextData}>{children}</LogContext.Provider>
  );
};

export const useLogContext = (): LogContextData => useContext(LogContext);
