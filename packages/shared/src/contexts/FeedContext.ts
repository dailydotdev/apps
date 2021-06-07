import React from 'react';
import { Spaciness } from '../graphql/settings';

export type FeedContextData = {
  pageSize: number;
  adSpot: number;
  numCards: Record<Spaciness, number>;
};

export const defaultFeedContextData: FeedContextData = {
  pageSize: 7,
  adSpot: 2,
  numCards: {
    cozy: 1,
    eco: 1,
    roomy: 1,
  },
};

const FeedContext = React.createContext<FeedContextData>(
  defaultFeedContextData,
);
export default FeedContext;
