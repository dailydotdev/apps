import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
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
import { GivebackFilterChip } from './GivebackFilterChip';
import type { ContributionCause } from '../types';

const ALL_FILTER = 'all';

interface GivebackCauseSelectionProps {
  causes: ContributionCause[];
  isLoading: boolean;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

export const GivebackCauseSelection = ({
  causes,
  isLoading,
  selectedIds,
  onToggle,
}: GivebackCauseSelectionProps): ReactElement => {
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          causes
            .map((cause) => cause.category)
            .filter((category): category is string => Boolean(category)),
        ),
      ),
    [causes],
  );

  const visibleCauses = useMemo(
    () =>
      causes
        .map((cause, index) => ({ cause, index }))
        .filter(({ cause }) =>
          activeFilter === ALL_FILTER ? true : cause.category === activeFilter,
        ),
    [causes, activeFilter],
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="h-36 animate-pulse rounded-16 bg-surface-float"
          />
        ))}
      </div>
    );
  }

  if (!causes.length) {
    return (
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        No causes are available right now. Check back soon.
      </Typography>
    );
  }

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

      {categories.length > 0 && (
        <FlexRow className="flex-wrap gap-2">
          <GivebackFilterChip
            isSelected={activeFilter === ALL_FILTER}
            label="All"
            onClick={() => setActiveFilter(ALL_FILTER)}
          />
          {categories.map((category) => (
            <GivebackFilterChip
              key={category}
              isSelected={activeFilter === category}
              label={category}
              onClick={() => setActiveFilter(category)}
            />
          ))}
        </FlexRow>
      )}

      <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3">
        {visibleCauses.map(({ cause, index }) => {
          const selected = selectedIds.has(cause.id);

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
              {/* Full-card overlay drives the toggle so the "Learn more" link
                  can live inside the card without nesting interactives. */}
              <button
                type="button"
                aria-pressed={selected}
                aria-label={`${selected ? 'Deselect' : 'Select'} ${
                  cause.title
                }`}
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
                    className="line-clamp-2 pt-1"
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
        })}
      </div>
    </FlexCol>
  );
};
