import React, { ReactElement } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { PREVIEW_FEED_QUERY } from '../../graphql/feed';
import useFeedSettings from '../../hooks/useFeedSettings';
import { OtherFeedPage, RequestKey } from '../../lib/query';
import Feed from '../Feed';
import FeedLayout from '../FeedLayout';

export type FeedCustomPreviewProps = {
  feedId: string;
};

export const FeedCustomPreview = ({
  feedId,
}: FeedCustomPreviewProps): ReactElement => {
  const { user } = useAuthContext();
  const { feedSettings } = useFeedSettings({ feedId });
  const { advancedSettings, ...previewFilters } = feedSettings || {};

  const feedProps = {
    feedName: OtherFeedPage.Preview,
    feedQueryKey: [
      RequestKey.FeedPreview,
      user?.id,
      RequestKey.FeedPreviewCustom,
      previewFilters,
    ],
    query: PREVIEW_FEED_QUERY,
    showSearch: false,
    options: { refetchOnMount: true, cacheTime: 10, keepPreviousData: true },
    variables: {
      filters: previewFilters,
    },
  };

  return (
    <FeedLayout>
      <Feed {...feedProps} />
    </FeedLayout>
  );
};
