import React from 'react';

export type FeedContextData = {
  pageSize: number;
  adSpot: number;
  numCards: number;
};

export const defaultFeedContextData: FeedContextData = {
  pageSize: 7,
  adSpot: 2,
  numCards: 1,
};

const FeedContext = React.createContext<FeedContextData>(
  defaultFeedContextData,
);
export default FeedContext;
