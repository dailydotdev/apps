import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  ArrowIcon,
  OpenLinkIcon,
  PlusIcon,
  VIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { useGivebackContext } from '../GivebackContext';
import type { GivebackCause } from '../types';
import { CauseSelectionModal } from './CauseSelectionModal';
import { CauseEmblem } from './CauseEmblem';
import { GivebackFilterChip } from './GivebackFilterChip';

// Synthetic first filter that shows our hand-picked developer causes.
const RECOMMENDED_FILTER = 'recommended';

interface CauseSelectionProps {
  /** Called when the visitor confirms their causes (onboarding or settings). */
  onContinue: () => void;
  /** Label for the confirm button. Defaults to "Continue" for onboarding. */
  continueLabel?: string;
  /**
   * Pin the confirm CTA to a sticky bottom bar (like the level bar) so it stays
   * one tap away while scrolling the cause list. Used for the onboarding step.
   */
  stickyContinue?: boolean;
}

export const CauseSelection = ({
  onContinue,
  continueLabel = 'Continue',
  stickyContinue = false,
}: CauseSelectionProps): ReactElement => {
  const { causes, suggestedCauses, toggleCause, userProfile } =
    useGivebackContext();
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  const isSelected = (cause: GivebackCause): boolean =>
    userProfile.selectedCauseIds.includes(cause.id);

  const selectedCount = causes.filter(isSelected).length;

  // Lead with a "Recommended" filter (our hand-picked developer causes), then
  // one chip per cause category so people can browse by what they care about.
  const categoryOptions = Array.from(
    new Set(
      causes
        .map((cause) => cause.category)
        .filter((category): category is string => Boolean(category)),
    ),
  );
  const [activeFilter, setActiveFilter] = useState<string>(RECOMMENDED_FILTER);

  const indexedCauses = causes.map((cause, index) => ({ cause, index }));
  const visibleCauses = indexedCauses.filter(({ cause }) =>
    activeFilter === RECOMMENDED_FILTER
      ? cause.recommended
      : cause.category === activeFilter,
  );

  return (
    <FlexCol className="gap-6">
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="max-w-2xl"
      >
        Pick as many as you like. daily.dev funds every donation, and you can
        change them anytime.
      </Typography>

      <FlexCol id="giveback-causes" className="scroll-mt-16 gap-6">
        <FlexCol className="gap-4">
          <FlexRow className="flex-wrap gap-2">
            <GivebackFilterChip
              isSelected={activeFilter === RECOMMENDED_FILTER}
              label="Recommended"
              onClick={() => setActiveFilter(RECOMMENDED_FILTER)}
            />
            {categoryOptions.map((category) => (
              <GivebackFilterChip
                key={category}
                isSelected={activeFilter === category}
                label={category}
                onClick={() => setActiveFilter(category)}
              />
            ))}
          </FlexRow>

          <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
            {visibleCauses.map(({ cause, index }) => {
              const selected = isSelected(cause);

              return (
                <div
                  key={cause.id}
                  className={classNames(
                    'group relative flex flex-col gap-3 rounded-16 border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2 active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none',
                    selected
                      ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
                      : 'border-border-subtlest-tertiary hover:bg-surface-hover',
                  )}
                >
                  {/* Full-card overlay handles the toggle so the "Learn more"
                      link can live inside the box without nesting interactives. */}
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${selected ? 'Deselect' : 'Select'} ${
                      cause.name
                    }`}
                    onClick={() => toggleCause(cause.id)}
                    className="absolute inset-0 z-0 rounded-16"
                  />

                  <FlexRow className="pointer-events-none relative z-1 items-start justify-between gap-2">
                    <CauseEmblem
                      cause={cause}
                      index={index}
                      className="transition-transform duration-200 group-hover:scale-105"
                    />
                    <span
                      className={classNames(
                        'flex size-5 shrink-0 items-center justify-center rounded-full transition-colors',
                        selected
                          ? 'bg-accent-cabbage-default text-white'
                          : 'border border-border-subtlest-secondary',
                      )}
                    >
                      {selected && (
                        <VIcon
                          secondary
                          size={IconSize.XXSmall}
                          className="motion-safe:animate-reward-pop"
                        />
                      )}
                    </span>
                  </FlexRow>

                  <FlexCol className="pointer-events-none relative z-1 min-w-0 flex-1 gap-1">
                    <Typography bold type={TypographyType.Callout}>
                      {cause.name}
                    </Typography>
                    {cause.category && (
                      <Typography
                        tag={TypographyTag.Span}
                        type={TypographyType.Caption1}
                        color={TypographyColor.Tertiary}
                      >
                        {cause.category}
                      </Typography>
                    )}
                    <Typography
                      type={TypographyType.Caption1}
                      color={TypographyColor.Tertiary}
                      className="line-clamp-2 pt-1"
                    >
                      {cause.description}
                    </Typography>
                  </FlexCol>

                  <a
                    href={cause.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="group/learn relative z-1 inline-flex w-fit items-center gap-1 font-bold text-text-link underline-offset-2 typo-footnote hover:underline focus-visible:underline"
                  >
                    Learn more
                    <OpenLinkIcon
                      size={IconSize.XSmall}
                      className="transition-transform duration-200 group-hover/learn:-translate-y-0.5 group-hover/learn:translate-x-0.5"
                    />
                  </a>
                </div>
              );
            })}
          </div>
        </FlexCol>

        {suggestedCauses.length > 0 && (
          <FlexRow className="flex-wrap items-center gap-2">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Your suggestions:
            </Typography>
            {suggestedCauses.map((cause) => (
              <FlexRow
                key={cause.id}
                className="items-center gap-1.5 rounded-8 bg-surface-float px-2.5 py-1"
              >
                <Typography type={TypographyType.Caption1} bold>
                  {cause.name}
                </Typography>
                <Typography
                  type={TypographyType.Caption2}
                  color={TypographyColor.Tertiary}
                >
                  pending review
                </Typography>
              </FlexRow>
            ))}
          </FlexRow>
        )}

        <FlexRow className="flex-wrap items-center justify-between gap-3">
          {!stickyContinue && (
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              {selectedCount} selected
            </Typography>
          )}
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
            icon={<PlusIcon />}
            onClick={() => setIsSuggestOpen(true)}
          >
            Suggest a cause
          </Button>
        </FlexRow>

        {!stickyContinue && (
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            icon={<ArrowIcon className="rotate-90" />}
            iconPosition={ButtonIconPosition.Right}
            disabled={selectedCount === 0}
            onClick={onContinue}
            className="w-full tablet:w-fit"
          >
            {continueLabel}
          </Button>
        )}

        {isSuggestOpen && (
          <CauseSelectionModal onClose={() => setIsSuggestOpen(false)} />
        )}
      </FlexCol>
    </FlexCol>
  );
};
