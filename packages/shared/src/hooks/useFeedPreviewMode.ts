import { useContext } from 'react';
import { ActiveFeedContext } from '../contexts';
import { RequestKey } from '../lib/query';

export const useFeedPreviewMode = (): boolean => {
  const { queryKey: feedQueryKey } = useContext(ActiveFeedContext);

  return feedQueryKey?.[0] === RequestKey.FeedPreview;
};
