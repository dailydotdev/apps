import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
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
import { PersonaSelector } from './PersonaSelector';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureOnboardingPersonas } from '../../lib/featureManagement';
import { subscribePersonaSelection } from './onboardingPopBus';

interface EditTagProps {
  feedSettings: FeedSettings;
  userId: string;
  headline?: string;
  requiredTags?: number;
  hidePreview?: boolean;
}
export const EditTag = ({
  feedSettings,
  userId,
  headline,
  requiredTags = REQUIRED_TAGS_THRESHOLD,
  hidePreview,
}: EditTagProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const tagsCount = feedSettings?.includeTags?.length || 0;
  const isPreviewEnabled = tagsCount >= requiredTags;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onSearch] = useDebounceFn((value?: string) => {
    setSearchQuery(value ?? '');
  }, 350);

  const { data: searchResult } = useTagSearch({
    value: searchQuery,
    origin: Origin.EditTag,
  });
  const searchTags = searchResult?.searchTags.tags || [];

  const { value: showPersonas } = useConditionalFeature({
    feature: featureOnboardingPersonas,
    shouldEvaluate: !!feedSettings,
  });

  const tagsRef = useRef<HTMLDivElement>(null);
  const hasScrolledToTagsRef = useRef(false);

  useEffect(() => {
    if (!isMobile || !showPersonas) {
      return undefined;
    }
    return subscribePersonaSelection(() => {
      if (hasScrolledToTagsRef.current) {
        return;
      }
      hasScrolledToTagsRef.current = true;
      tagsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [isMobile, showPersonas]);

  // When the persona feature is on, override any caller-supplied headline
  // (Freyja funnel JSON) with the persona-tuned copy.
  // TODO: drop this override once Freyja's persona-experiment variant ships
  // the new headline directly.
  const resolvedHeadline = showPersonas
    ? 'Tune your feed'
    : headline || 'Pick tags that are relevant to you';

  return (
    <>
      <h2 className="text-center font-bold typo-large-title">
        {resolvedHeadline}
      </h2>
      {showPersonas && (
        <>
          <p className="mt-3 max-w-2xl text-center text-text-tertiary typo-callout">
            Pick a role to start fast, then add tags you like.
          </p>
          <PersonaSelector className="mt-6" />
        </>
      )}
      <div ref={tagsRef} className="flex w-full flex-col items-center">
        <TagSelection
          className={classNames('max-w-4xl', showPersonas ? 'mt-6' : 'mt-10')}
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
      </div>
      {!hidePreview && (
        <FeedPreviewControls
          isOpen={isPreviewVisible}
          isDisabled={!isPreviewEnabled}
          textDisabled={`${tagsCount}/${requiredTags} to show feed preview`}
          origin={Origin.EditTag}
          onClick={setPreviewVisible}
          data-funnel-track={FunnelTargetId.FeedPreview}
        />
      )}
      {!hidePreview && isPreviewEnabled && isPreviewVisible && (
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
