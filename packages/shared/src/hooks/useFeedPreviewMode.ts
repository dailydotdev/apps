import { useContext } from 'react';
import { ActiveFeedContext, useActiveFeedContext } from '../contexts';
import { RequestKey } from '../lib/query';

export const useFeedPreviewMode = (): boolean => {
  const { queryKey: feedQueryKey } = useActiveFeedContext();

  return feedQueryKey?.[0] === RequestKey.FeedPreview;
};
