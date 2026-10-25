import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext, useMemo } from 'react';

export type FeedWidgetsContextData = {
  /** For the widgets' click and impression events, as the in-feed cards report. */
  feedName: string;
  isEditing: boolean;
};

const FeedWidgetsContext = createContext<FeedWidgetsContextData>({
  feedName: '',
  isEditing: false,
});

export const useFeedWidgetsContext = (): FeedWidgetsContextData =>
  useContext(FeedWidgetsContext);

export const FeedWidgetsProvider = ({
  feedName,
  isEditing,
  children,
}: FeedWidgetsContextData & { children: ReactNode }): ReactElement => {
  const value = useMemo(() => ({ feedName, isEditing }), [feedName, isEditing]);

  return (
    <FeedWidgetsContext.Provider value={value}>
      {children}
    </FeedWidgetsContext.Provider>
  );
};
