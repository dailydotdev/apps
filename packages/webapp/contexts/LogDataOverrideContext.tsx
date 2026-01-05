import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { LogData } from '../types/log';

interface LogDataOverrideContextValue {
  overrideData: LogData | null;
  setOverrideData: (data: LogData | null) => void;
}

const LogDataOverrideContext = createContext<
  LogDataOverrideContextValue | undefined
>(undefined);

interface LogDataOverrideProviderProps {
  children: ReactNode;
}

export function LogDataOverrideProvider({
  children,
}: LogDataOverrideProviderProps): ReactElement {
  const [overrideData, setOverrideDataState] = useState<LogData | null>(null);

  const setOverrideData = useCallback((data: LogData | null) => {
    setOverrideDataState(data);
  }, []);

  return (
    <LogDataOverrideContext.Provider value={{ overrideData, setOverrideData }}>
      {children}
    </LogDataOverrideContext.Provider>
  );
}

export function useLogDataOverride(): LogDataOverrideContextValue {
  const context = useContext(LogDataOverrideContext);

  // Return default values for SSR/when provider is not available
  // File upload only happens on client, so this is safe
  if (context === undefined) {
    return {
      overrideData: null,
      setOverrideData: () => {
        // No-op during SSR
      },
    };
  }

  return context;
}
