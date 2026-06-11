import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Origin } from '../../../../lib/log';
import { PersonaQuizFeedbackForm } from './PersonaQuizFeedbackForm';
import type { PersonaArchetype } from '../../types/funnel';
import { TagSelection } from '../../../../components/tags/TagSelection';
import { FeedPreviewControls } from '../../../../components/feeds/FeedPreviewControls';
import Feed from '../../../../components/Feed';
import { FeedLayoutProvider } from '../../../../contexts/FeedContext';
import { OtherFeedPage, RequestKey } from '../../../../lib/query';
import { PREVIEW_FEED_QUERY } from '../../../../graphql/feed';
import { SearchField } from '../../../../components/fields/SearchField';
import useDebounceFn from '../../../../hooks/useDebounceFn';
import { useTagSearch } from '../../../../hooks/useTagSearch';
import { onboardingGradientClasses } from '../../../../components/onboarding/common';

interface PersonaQuizRevealProps {
  archetype: PersonaArchetype | null;
  /**
   * Tags accumulated from the quiz answers. Used only as a fallback for the
   * headline copy when no archetype was resolved — the actual editable tag
   * list lives in `feedSettings` (mutated via `TagSelection`).
   */
  tags: string[];
  userId: string | undefined;
  reveal: {
    eyebrow?: string;
    cta?: string;
    feedbackCta?: string;
    feedbackPlaceholder?: string;
  };
  isFinalizing: boolean;
  onSubmitFeedback: (text: string) => void;
  onComplete: () => void;
}

const humaniseTag = (tag: string): string => {
  const spaced = tag.replace(/-/g, ' ').trim();
  if (!spaced) {
    return tag;
  }
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const headlineFromTags = (tags: string[]): string => {
  const top = tags.slice(0, 3).map(humaniseTag);
  if (top.length === 0) {
    return 'Your feed is ready';
  }
  if (top.length === 1) {
    return `${top[0]}, locked in.`;
  }
  if (top.length === 2) {
    return `${top[0]} + ${top[1]}, locked in.`;
  }
  return `${top[0]}, ${top[1]}, ${top[2]} — locked in.`;
};

export const PersonaQuizReveal = ({
  archetype,
  tags,
  userId,
  reveal,
  isFinalizing,
  onSubmitFeedback,
  onComplete,
}: PersonaQuizRevealProps): ReactElement => {
  const [isPreviewOpen, setPreviewOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onSearch] = useDebounceFn((value?: string) => {
    setSearchQuery(value ?? '');
  }, 350);

  const { data: searchResult } = useTagSearch({
    value: searchQuery,
    origin: Origin.EditTag,
  });
  const searchTags = searchResult?.searchTags?.tags ?? [];

  // The persona name is the hero; its headline is the smaller tagline beneath.
  // With no resolved archetype, fall back to a tag-derived hero line.
  const title = archetype?.name ?? headlineFromTags(tags);
  const subtitle = archetype?.headline;
  const { eyebrow } = reveal;
  const description = archetype?.description;

  return (
    <div className="flex w-full flex-1 flex-col gap-6 px-4 py-6 tablet:mx-auto tablet:max-w-4xl">
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="relative grid place-items-center">
          <div
            aria-hidden
            className="bg-accent-cabbage-default/20 absolute h-24 w-24 rounded-full blur-3xl"
          />
          <span aria-hidden className="animate-float-slow relative text-7xl">
            🧞
          </span>
        </div>
        {eyebrow && (
          <Typography
            type={TypographyType.Caption1}
            className="uppercase tracking-[0.15em] text-accent-cabbage-default"
          >
            {eyebrow}
          </Typography>
        )}
        <h2 className={classNames('typo-mega2', onboardingGradientClasses)}>
          {title}
        </h2>
        {subtitle && (
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
          >
            {subtitle}
          </Typography>
        )}
        {description && (
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
            className="max-w-md"
          >
            {description}
          </Typography>
        )}
      </header>

      <TagSelection
        className="mt-4"
        searchElement={
          <SearchField
            aria-label="Search tags"
            className="mb-8 w-full tablet:max-w-xs"
            inputId="persona-quiz-search-tags"
            placeholder="Search tags…"
            valueChanged={onSearch}
          />
        }
        searchQuery={searchQuery}
        searchTags={searchTags}
        origin={Origin.EditTag}
      />

      {userId && (
        <>
          <FeedPreviewControls
            isOpen={isPreviewOpen}
            isDisabled={false}
            textDisabled=""
            origin={Origin.EditTag}
            onClick={setPreviewOpen}
          />
          {isPreviewOpen && (
            <FeedLayoutProvider>
              <p className="-mb-4 mt-6 text-center text-text-secondary typo-body">
                Tweak your tags above until the feed below feels like yours.
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
      )}

      <section className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowFeedback((value) => !value)}
          className="self-start text-left text-text-link transition-colors typo-callout hover:text-text-primary"
          aria-expanded={showFeedback}
        >
          {reveal.feedbackCta ?? 'Nope, this isn’t me'}
        </button>
        {showFeedback && (
          <PersonaQuizFeedbackForm
            placeholder={reveal.feedbackPlaceholder}
            onSubmit={(text) => {
              onSubmitFeedback(text);
              setShowFeedback(false);
            }}
            onCancel={() => setShowFeedback(false)}
          />
        )}
      </section>

      <div className="sticky mx-auto mt-auto flex w-full max-w-md flex-col gap-2 px-1 pb-4 bottom-safe-or-2">
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.XLarge}
          onClick={onComplete}
          disabled={isFinalizing}
          loading={isFinalizing}
          className={classNames('w-full')}
        >
          {reveal.cta ?? 'Looks good'}
        </Button>
      </div>
    </div>
  );
};
