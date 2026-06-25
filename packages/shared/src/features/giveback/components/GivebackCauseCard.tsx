import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { OpenLinkIcon, PlusIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { CauseEmblem } from './CauseEmblem';
import type { ContributionCause } from '../types';

interface GivebackCauseCardProps {
  cause: ContributionCause;
  // Position in the list, used to pick a stable brand tint for the emblem.
  index: number;
  selected: boolean;
  onToggle: (id: string) => void;
  // When true, only the corner "+" button toggles selection (the card itself
  // isn't a big toggle target). Used on the manage tab's "more causes" grid; the
  // onboarding funnel leaves it false so the whole card is tappable.
  buttonToggle?: boolean;
}

export const GivebackCauseCard = ({
  cause,
  index,
  selected,
  onToggle,
  buttonToggle = false,
}: GivebackCauseCardProps): ReactElement => {
  const toggle = () => onToggle(cause.id);
  const cardClickable = !buttonToggle;

  return (
    <div
      className={classNames(
        'group relative flex flex-col gap-3 rounded-16 border p-4 transition-all duration-200',
        cardClickable &&
          'hover:-translate-y-0.5 hover:shadow-2 active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none',
        selected
          ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
          : 'border-border-subtlest-tertiary hover:bg-surface-hover',
      )}
    >
      {/* Whole-card toggle (funnel). Skipped in button-toggle mode so only the
          "+" adds the cause. */}
      {cardClickable && (
        <button
          type="button"
          aria-pressed={selected}
          aria-label={`${selected ? 'Deselect' : 'Select'} ${cause.title}`}
          onClick={toggle}
          className="absolute inset-0 z-0 rounded-16"
        />
      )}

      <FlexRow
        className={classNames(
          'relative z-1 items-start gap-3',
          cardClickable && 'pointer-events-none',
        )}
      >
        <CauseEmblem
          cause={cause}
          index={index}
          className="transition-transform duration-200 group-hover:scale-105"
        />
        <FlexCol className="min-w-0 flex-1 gap-0.5">
          <Typography bold type={TypographyType.Callout}>
            {cause.title}
          </Typography>
          {cause.category && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {cause.category}
            </Typography>
          )}
        </FlexCol>
        {buttonToggle ? (
          <button
            type="button"
            aria-pressed={selected}
            aria-label={`${selected ? 'Remove' : 'Add'} ${cause.title}`}
            onClick={toggle}
            className={classNames(
              'pointer-events-auto flex size-8 shrink-0 items-center justify-center rounded-10 border transition-colors [&_svg]:size-4',
              selected
                ? 'border-accent-cabbage-default bg-accent-cabbage-default text-white hover:border-status-error hover:bg-status-error'
                : 'border-border-subtlest-secondary text-text-tertiary hover:border-accent-cabbage-default hover:text-accent-cabbage-default',
            )}
          >
            {selected ? <VIcon /> : <PlusIcon />}
          </button>
        ) : (
          <span
            className={classNames(
              'flex size-5 shrink-0 items-center justify-center rounded-full transition-colors',
              selected
                ? 'bg-accent-cabbage-default text-white'
                : 'border border-border-subtlest-secondary',
            )}
          >
            {selected && <VIcon secondary size={IconSize.XXSmall} />}
          </span>
        )}
      </FlexRow>

      {cause.description && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className={classNames(
            'relative z-1',
            cardClickable && 'pointer-events-none',
          )}
        >
          {cause.description}
        </Typography>
      )}

      {cause.url && (
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
      )}
    </div>
  );
};
