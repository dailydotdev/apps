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
import { OpenLinkIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { CauseEmblem } from './CauseEmblem';
import type { ContributionCause } from '../types';

interface GivebackCauseCardProps {
  cause: ContributionCause;
  // Position in the list, used to pick a stable brand tint for the emblem.
  index: number;
  selected: boolean;
  onToggle: (id: string) => void;
}

export const GivebackCauseCard = ({
  cause,
  index,
  selected,
  onToggle,
}: GivebackCauseCardProps): ReactElement => (
  <div
    className={classNames(
      'group relative flex flex-col gap-3 rounded-16 border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2 active:translate-y-0 active:scale-[0.99] motion-reduce:transform-none',
      selected
        ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
        : 'border-border-subtlest-tertiary hover:bg-surface-hover',
    )}
  >
    {/* Full-card overlay drives the toggle so the "Learn more" link can live
        inside the card without nesting interactives. */}
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${selected ? 'Deselect' : 'Select'} ${cause.title}`}
      onClick={() => onToggle(cause.id)}
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
        {selected && <VIcon secondary size={IconSize.XXSmall} />}
      </span>
    </FlexRow>

    <FlexCol className="pointer-events-none relative z-1 min-w-0 flex-1 gap-1">
      <Typography bold type={TypographyType.Callout}>
        {cause.title}
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
      {cause.description && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="pt-1"
        >
          {cause.description}
        </Typography>
      )}
    </FlexCol>

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
