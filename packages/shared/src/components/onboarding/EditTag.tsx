import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { FeedPreviewControls } from '../feeds';
import type { OnboardingStep } from './common';
import { REQUIRED_TAGS_THRESHOLD } from './common';
import { Origin } from '../../lib/log';
import Feed from '../Feed';
import { OtherFeedPage, RequestKey } from '../../lib/query';
import { PREVIEW_FEED_QUERY } from '../../graphql/feed';
import type { FeedSettings } from '../../graphql/feedSettings';
import { CreateFeedButton } from './CreateFeedButton';
import { TagSelection } from '../tags/TagSelection';
import { FeedLayoutProvider } from '../../contexts/FeedContext';
import useDebounceFn from '../../hooks/useDebounceFn';
import { useTagSearch } from '../../hooks/useTagSearch';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import { SearchField } from '../fields/SearchField';

interface EditTagProps {
  feedSettings: FeedSettings;
  userId: string;
  onClick: () => void;
  customActionName?: string;
  activeScreen?: OnboardingStep;
}
export const EditTag = ({
  feedSettings,
  userId,
  onClick,
  customActionName,
  activeScreen,
}: EditTagProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const tagsCount = feedSettings?.includeTags?.length || 0;
  const isPreviewEnabled = tagsCount >= REQUIRED_TAGS_THRESHOLD;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onSearch] = useDebounceFn(setSearchQuery, 200);

  const { data: searchResult } = useTagSearch({
    value: searchQuery,
    origin: Origin.EditTag,
  });
  const searchTags = searchResult?.searchTags.tags || [];

  return (
    <>
      <h2 className="text-center font-bold typo-large-title">
        Pick tags that are relevant to you
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
        textDisabled={`${tagsCount}/${REQUIRED_TAGS_THRESHOLD} to show feed preview`}
        origin={Origin.EditTag}
        onClick={setPreviewVisible}
      />
      {isPreviewEnabled && isPreviewVisible && (
        <FeedLayoutProvider>
          <p className="-mb-4 mt-6 text-center text-text-secondary typo-body">
            Change your tag selection until you&apos;re happy with your feed
            preview.
          </p>
          <Feed
            className="px-6 pt-14 laptop:pt-10"
            feedName={OtherFeedPage.Preview}
            feedQueryKey={[RequestKey.FeedPreview, userId]}
            query={PREVIEW_FEED_QUERY}
            showSearch={false}
            options={{ refetchOnMount: true }}
            allowPin
          />
          <CreateFeedButton
            className="mt-20"
            onClick={onClick}
            customActionName={customActionName}
            activeScreen={activeScreen}
          />
        </FeedLayoutProvider>
      )}
    </>
  );
};
