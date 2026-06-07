import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext } from 'react';

export type GivebackTabId = 'impact' | 'why' | 'actions';

interface GivebackNavContextValue {
  // Whether the visitor has opted in from the hero gateway. Until then the
  // tabs and the rest of the experience stay hidden.
  hasStarted: boolean;
  start: () => void;
  activeTab: GivebackTabId;
  setActiveTab: (tab: GivebackTabId) => void;
}

const GivebackNavContext = createContext<GivebackNavContextValue | undefined>(
  undefined,
);

interface GivebackNavProviderProps extends GivebackNavContextValue {
  children: ReactNode;
}

export const GivebackNavProvider = ({
  hasStarted,
  start,
  activeTab,
  setActiveTab,
  children,
}: GivebackNavProviderProps): ReactElement => (
  <GivebackNavContext.Provider
    value={{ hasStarted, start, activeTab, setActiveTab }}
  >
    {children}
  </GivebackNavContext.Provider>
);

export const useGivebackNav = (): GivebackNavContextValue => {
  const context = useContext(GivebackNavContext);
  if (!context) {
    throw new Error('useGivebackNav must be used within a GivebackNavProvider');
  }
  return context;
};
