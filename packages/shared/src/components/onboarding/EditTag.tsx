import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { FeedPreviewControls } from '../feeds';
import { OnboardingHeadline, REQUIRED_TAGS_THRESHOLD } from './common';
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

/**
 * Columns the onboarding feed preview is allowed to grow to, and the width that
 * many cards need. A grid card is designed at 21.25rem (340px) with a 2rem (32px)
 * gutter, and the feed only caps its own width above 2156px — so without both a
 * column cap AND a matching width cap the preview either divides the viewport
 * into a page's worth of columns (cards far too narrow) or stretches a few
 * columns across the whole screen (cards far too wide).
 */
const PREVIEW_MAX_COLUMNS = 3;
const previewWidthClass = {
  3: 'tablet:max-w-[70.75rem]',
  4: 'tablet:max-w-[94rem]',
}[PREVIEW_MAX_COLUMNS];

interface EditTagProps {
  feedSettings: FeedSettings;
  userId: string;
  headline?: string;
  requiredTags?: number;
  hidePreview?: boolean;
  featuredTags?: string[];
  // The post-signup funnel's treatment: floating search field, tighter tag
  // grid and a tag-shaped preview toggle. `/helloworld` keeps the original.
  isOnboarding?: boolean;
}
export const EditTag = ({
  feedSettings,
  userId,
  headline,
  requiredTags = REQUIRED_TAGS_THRESHOLD,
  hidePreview,
  featuredTags,
  isOnboarding,
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
      {isOnboarding ? (
        <OnboardingHeadline>{resolvedHeadline}</OnboardingHeadline>
      ) : (
        <h2 className="text-center font-bold typo-large-title">
          {resolvedHeadline}
        </h2>
      )}
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
          // Onboarding takes the gap from the step's own flex gap; the paid
          // funnel still needs the grid's own offset under the headline.
          className={classNames(
            'max-w-4xl',
            showPersonas ? 'mt-6' : !isOnboarding && 'mt-10',
          )}
          // `!` because TagSelection's own gap-4 sits later in the stylesheet.
          // Scoped here so the post panels and feed settings keep theirs.
          classNameTags={isOnboarding ? '!gap-2' : undefined}
          featuredTags={featuredTags}
          searchElement={
            <SearchField
              aria-label="Pick tags that are relevant to you"
              autoFocus={!isMobile}
              // The tag grid below is deliberately wider than the rail, but the
              // search field is a single control and belongs on it — so in the
              // funnel it takes the same 440px measure as the headline and CTA.
              // The paid funnel keeps main's 20rem cap from tablet up.
              className={classNames(
                'mb-10 w-full',
                isOnboarding ? 'max-w-[27.5rem]' : 'tablet:max-w-xs',
              )}
              // The funnel step is a bare surface, so a field filled with the
              // page colour would read as a gap. The float surface gives it the
              // same presence as the tag pills below it.
              isFloating={isOnboarding}
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
          isTagStyle={isOnboarding}
          isOpen={isPreviewVisible}
          isDisabled={!isPreviewEnabled}
          textDisabled={`${tagsCount}/${requiredTags} to show feed preview`}
          origin={Origin.EditTag}
          onClick={setPreviewVisible}
          data-funnel-track={FunnelTargetId.FeedPreview}
        />
      )}
      {!hidePreview && isPreviewEnabled && isPreviewVisible && (
        <FeedLayoutProvider
          maxNumCards={isOnboarding ? PREVIEW_MAX_COLUMNS : undefined}
        >
          <p className="-mb-4 mt-6 text-center text-text-secondary typo-body">
            Change your tag selection until you&apos;re happy with your feed
            preview.
          </p>
          <Feed
            className={classNames(
              'relative mx-auto px-6 pt-14 tablet:left-1/2 tablet:w-screen tablet:-translate-x-1/2 laptop:pt-10',
              // The breakout stays centred at any width: `left-1/2` resolves
              // against the centred rail, so its 50% mark is the viewport's
              // centre, and `-translate-x-1/2` then centres the feed on it.
              isOnboarding && previewWidthClass,
            )}
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
