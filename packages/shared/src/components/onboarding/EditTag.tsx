import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { FeedPreviewControls } from '../feeds';
import { REQUIRED_TAGS_THRESHOLD } from './common';
import { Origin } from '../../lib/log';
import Feed from '../Feed';
import { OtherFeedPage, RequestKey } from '../../lib/query';
import { PREVIEW_FEED_QUERY } from '../../graphql/feed';
import type { FeedSettings } from '../../graphql/feedSettings';
import { TagSelection } from '../tags/TagSelection';
import { FeedLayoutProvider } from '../../contexts/FeedContext';
import useDebounceFn from '../../hooks/useDebounceFn';
import { useTagSearch } from '../../hooks/useTagSearch';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { SearchField } from '../fields/SearchField';
import { FunnelTargetId } from '../../features/onboarding/types/funnelEvents';

interface EditTagProps {
  feedSettings: FeedSettings;
  userId: string;
  headline?: string;
  requiredTags?: number;
}
export const EditTag = ({
  feedSettings,
  userId,
  headline,
  requiredTags = REQUIRED_TAGS_THRESHOLD,
}: EditTagProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const tagsCount = feedSettings?.includeTags?.length || 0;
  const isPreviewEnabled = tagsCount >= requiredTags;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onSearch] = useDebounceFn((value: string) => {
    setSearchQuery(value);
  }, 350);

  const { data: searchResult } = useTagSearch({
    value: searchQuery,
    origin: Origin.EditTag,
  });
  const searchTags = searchResult?.searchTags.tags || [];

  return (
    <>
      <h2 className="text-center font-bold typo-large-title">
        {headline || 'Pick tags that are relevant to you'}
      </h2>
      <TagSelection
        className="mt-10 max-w-4xl"
        searchElement={
          <SearchField
            aria-label="Pick tags that are relevant to you"
            autoFocus={!isMobile}
            className="mb-10 w-full tablet:max-w-xs"
            inputId="search-filters"
            placeholder="Search javascript, php, git, etc…"
            valueChanged={onSearch}
          />
        }
        searchQuery={searchQuery}
        searchTags={searchTags}
      />
      <FeedPreviewControls
        isOpen={isPreviewVisible}
        isDisabled={!isPreviewEnabled}
        textDisabled={`${tagsCount}/${requiredTags} to show feed preview`}
        origin={Origin.EditTag}
        onClick={setPreviewVisible}
        data-funnel-track={FunnelTargetId.FeedPreview}
      />
      {isPreviewEnabled && isPreviewVisible && (
        <FeedLayoutProvider>
          <p className="-mb-4 mt-6 text-center text-text-secondary typo-body">
            Change your tag selection until you&apos;re happy with your feed
            preview.
          </p>
          <Feed
            className="relative mx-auto px-6 pt-14 tablet:left-1/2 tablet:w-screen tablet:-translate-x-1/2 laptop:pt-10"
            feedName={OtherFeedPage.Preview}
            feedQueryKey={[RequestKey.FeedPreview, userId]}
            query={PREVIEW_FEED_QUERY}
            showSearch={false}
            options={{ refetchOnMount: true }}
            allowPin
          />
        </FeedLayoutProvider>
      )}
    </>
  );
};
