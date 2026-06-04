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
  PlusIcon,
  SparkleIcon,
  VIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { useGivebackContext } from '../GivebackContext';
import { useGivebackNav } from '../GivebackNavContext';
import { GivebackSection } from './GivebackSection';
import { CauseSelectionModal } from './CauseSelectionModal';

// Brand-tinted emblems so each cause card reads as its own tile, Lemonade-style.
const emblemAccents = [
  'bg-accent-cabbage-flat text-accent-cabbage-default',
  'bg-accent-avocado-flat text-accent-avocado-default',
  'bg-accent-onion-flat text-accent-onion-default',
  'bg-accent-bacon-flat text-accent-bacon-default',
];

export const CauseSelection = (): ReactElement => {
  const { causes, suggestedCauses, toggleCause, userProfile } =
    useGivebackContext();
  const { setActiveTab } = useGivebackNav();
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  const selectedCount = causes.filter((cause) =>
    userProfile.selectedCauseIds.includes(cause.id),
  ).length;

  return (
    <FlexCol className="gap-8">
      <FlexCol className="gap-2">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
          className="uppercase tracking-wider"
        >
          Why we&apos;re doing this
        </Typography>
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title1}
          bold
          className="max-w-2xl"
        >
          We fund developers, not ads.{' '}
          <span className="bg-gradient-to-r from-accent-avocado-default via-accent-cabbage-default to-accent-cheese-default bg-clip-text text-transparent">
            You pick where it goes.
          </span>
        </Typography>
      </FlexCol>

      <GivebackSection
        id="giveback-causes"
        title="Pick the causes you care about"
      >
        <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
          {causes.map((cause, index) => {
            const isSelected = userProfile.selectedCauseIds.includes(cause.id);

            return (
              <button
                key={cause.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleCause(cause.id)}
                className={classNames(
                  'group relative flex h-full flex-col gap-3 rounded-16 border p-4 text-left transition-colors',
                  isSelected
                    ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
                    : 'border-border-subtlest-tertiary hover:bg-surface-hover',
                )}
              >
                <FlexRow className="items-start justify-between gap-2">
                  <span
                    className={classNames(
                      'flex size-11 shrink-0 items-center justify-center rounded-16',
                      emblemAccents[index % emblemAccents.length],
                    )}
                  >
                    <SparkleIcon size={IconSize.Medium} />
                  </span>
                  <span
                    className={classNames(
                      'flex size-5 shrink-0 items-center justify-center rounded-full transition-colors',
                      isSelected
                        ? 'bg-accent-cabbage-default text-white'
                        : 'border border-border-subtlest-secondary',
                    )}
                  >
                    {isSelected && <VIcon secondary size={IconSize.XXSmall} />}
                  </span>
                </FlexRow>

                <FlexCol className="min-w-0 flex-1 gap-1">
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
              </button>
            );
          })}
        </div>

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
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {selectedCount} selected
          </Typography>
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

        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          icon={<ArrowIcon className="rotate-90" />}
          iconPosition={ButtonIconPosition.Right}
          disabled={selectedCount === 0}
          onClick={() => setActiveTab('impact')}
          className="w-full tablet:w-fit"
        >
          Continue
        </Button>

        {isSuggestOpen && (
          <CauseSelectionModal onClose={() => setIsSuggestOpen(false)} />
        )}
      </GivebackSection>
    </FlexCol>
  );
};
