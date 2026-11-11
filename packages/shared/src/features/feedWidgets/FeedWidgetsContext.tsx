import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext, useMemo } from 'react';

export type FeedWidgetsContextData = {
  /** For the widgets' click and impression events, as the in-feed cards report. */
  feedName: string;
  isEditing: boolean;
  /** The top story is on the rail, so the hero payload must carry its posts. */
  hasTopStory: boolean;
};

const FeedWidgetsContext = createContext<FeedWidgetsContextData>({
  feedName: '',
  isEditing: false,
  hasTopStory: false,
});

export const useFeedWidgetsContext = (): FeedWidgetsContextData =>
  useContext(FeedWidgetsContext);

export const FeedWidgetsProvider = ({
  feedName,
  isEditing,
  hasTopStory,
  children,
}: FeedWidgetsContextData & { children: ReactNode }): ReactElement => {
  const value = useMemo(
    () => ({ feedName, isEditing, hasTopStory }),
    [feedName, isEditing, hasTopStory],
  );

  return (
    <FeedWidgetsContext.Provider value={value}>
      {children}
    </FeedWidgetsContext.Provider>
  );
};
