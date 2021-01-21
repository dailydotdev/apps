import React from 'react';

export type FeedSettings = {
  pageSize: number;
  adSpot: number;
  numCards: number;
};
export const defaultFeedSettings: FeedSettings = {
  pageSize: 7,
  adSpot: 2,
  numCards: 1,
};

const FeedSettingsContext = React.createContext<FeedSettings>(
  defaultFeedSettings,
);
export default FeedSettingsContext;
