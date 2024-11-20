import { keepPreviousData } from '@tanstack/react-query';
import React, { ReactElement } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { PREVIEW_FEED_QUERY } from '../../graphql/feed';
import useFeedSettings from '../../hooks/useFeedSettings';
import { OtherFeedPage, RequestKey } from '../../lib/query';
import Feed from '../Feed';
import { FeedLayoutProvider } from '../../contexts/FeedContext';

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
    options: {
      refetchOnMount: true,
      gcTime: 10,
      placeholderData: keepPreviousData,
    },
    variables: {
      filters: previewFilters,
    },
  };

  return (
    <FeedLayoutProvider>
      <Feed {...feedProps} />
    </FeedLayoutProvider>
  );
};
